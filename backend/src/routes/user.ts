import { randomUUID } from "node:crypto";
import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/requireAuth";
import { Booking } from "../models/Booking";
import { AdminBookingNotification } from "../models/AdminBookingNotification";
import { Category } from "../models/Category";
import { Notification } from "../models/Notification";
import { Payment } from "../models/Payment";
import { Review } from "../models/Review";
import { Service } from "../models/Service";
import { Slot } from "../models/Slot";
import { Subcategory } from "../models/Subcategory";
import { User } from "../models/User";
import { emitBookingNotification } from "../realtime";

const router = Router();
router.use(requireAuth);

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

const paymentMethods = ["bkash", "card", "cod", "bkash_demo", "card_demo"] as const;
const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"] as const;

function getDhakaDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

router.use((req, res, next) => {
  if (req.authUserRole !== "user") {
    res.status(403).json({ message: "Customer access is required." });
    return;
  }
  next();
});

router.get("/profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.authUserId).select("fullName email role status").lean();
    if (!user || user.status === "Inactive") {
      res.status(404).json({ message: "Your account could not be found." });
      return;
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.patch("/profile", async (req, res, next) => {
  const { fullName } = req.body as Record<string, unknown>;
  if (
    typeof fullName !== "string" ||
    !fullName.trim() ||
    fullName.trim().length > 100
  ) {
    res.status(400).json({ message: "Name must be between 1 and 100 characters." });
    return;
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.authUserId,
      { fullName: fullName.trim() },
      { returnDocument: "after", runValidators: true },
    ).select("fullName email role status");
    if (!user) {
      res.status(404).json({ message: "Your account could not be found." });
      return;
    }
    res.json({ user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

router.get("/notifications", async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      status: "Sent",
      audience: { $in: ["All customers", "Active customers"] },
    })
      .select("title message sentAt createdAt")
      .sort({ sentAt: -1, createdAt: -1 })
      .lean();
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

router.get("/bookings", async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.authUserId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

router.get("/reviews", async (req, res, next) => {
  try {
    const reviews = await Review.aggregate([
      { $match: { customerId: new mongoose.Types.ObjectId(req.authUserId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: Booking.collection.name,
          localField: "bookingId",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: { path: "$booking", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: Service.collection.name,
          localField: "booking.serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: User.collection.name,
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          customerId: 1,
          bookingId: { $ifNull: ["$booking._id", "$bookingId"] },
          bookingReference: { $ifNull: ["$booking.bookingId", ""] },
          customerName: { $ifNull: ["$customer.fullName", "$customerName"] },
          customerProfileImage: { $ifNull: ["$customer.profileImage", ""] },
          serviceId: { $ifNull: ["$service._id", ""] },
          serviceImage: { $ifNull: ["$service.image", ""] },
          serviceName: { $ifNull: ["$service.name", "$serviceName"] },
          rating: 1,
          comment: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ]);
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

router.post("/bookings", async (req, res, next) => {
  const { serviceId, categoryId, subcategoryId, slotId, date, fullName, email, phone, address, notes, paymentMethod } = req.body as Record<string, unknown>;
  const bookingDate = typeof date === "string" ? new Date(date) : null;
  if (
    typeof serviceId !== "string" ||
    !mongoose.isValidObjectId(serviceId) ||
    typeof categoryId !== "string" ||
    !mongoose.isValidObjectId(categoryId) ||
    typeof subcategoryId !== "string" ||
    !mongoose.isValidObjectId(subcategoryId) ||
    typeof slotId !== "string" ||
    !mongoose.isValidObjectId(slotId) ||
    typeof date !== "string" ||
    !bookingDate ||
    !Number.isFinite(bookingDate.getTime()) ||
    getDhakaDateKey(bookingDate) < getDhakaDateKey(new Date()) ||
    !isText(fullName, 100) ||
    !isText(email, 254) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    !isText(phone, 30) ||
    !isText(address, 300) ||
    (paymentMethod !== "bkash" && paymentMethod !== "card" && paymentMethod !== "cod") ||
    (notes !== undefined && typeof notes !== "string") ||
    (typeof notes === "string" && notes.length > 1000)
  ) {
    res.status(400).json({ message: "Choose an active service, available time slot, payment method, phone number, and valid service address." });
    return;
  }

  const bookingCode = `SH-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  const session = await mongoose.startSession();
  try {
    const createdRecords: {
      booking: InstanceType<typeof Booking> | null;
      payment: InstanceType<typeof Payment> | null;
      notification: InstanceType<typeof AdminBookingNotification> | null;
    } = { booking: null, payment: null, notification: null };
    await session.withTransaction(async () => {
      const service = await Service.findOne({ _id: serviceId, status: "Active" }).session(session);
      const category = await Category.findOne({ _id: categoryId, serviceId, status: "Active" }).session(session);
      const subcategory = await Subcategory.findOne({ _id: subcategoryId, categoryId, status: "Active" }).session(session);
      const customer = await User.findById(req.authUserId).select("fullName email").session(session);
      if (!service) throw new SlotReservationConflict("This service is no longer available.");
      if (!category || !subcategory) throw new SlotReservationConflict("This service type is no longer available.");
      if (!customer) throw new SlotReservationConflict("Your account could not be found.");

      const slot = await Slot.findOneAndUpdate(
        {
          _id: slotId,
          serviceId,
          $expr: {
            $lt: [{ $add: ["$bookedCount", "$reservedCount"] }, "$capacity"],
          },
        },
        { $inc: { bookedCount: 1 } },
        { returnDocument: "after", session },
      );
      if (!slot) throw new SlotReservationConflict("This time slot has just been booked. Choose another available time.");

      const slotDate = new Date(`${slot.date}T${slot.startTime}:00+06:00`);
      if (
        slotDate.getTime() !== bookingDate.getTime() ||
        slotDate <= new Date()
      ) {
        throw new SlotReservationConflict("This time slot is no longer available. Choose another time.");
      }

      const isPaid = paymentMethod !== "cod";
      const [booking] = await Booking.create([{
        bookingId: bookingCode,
        customerId: customer.id,
        customerName: fullName.trim(),
        customerEmail: email.trim().toLowerCase(),
        phone: phone.trim(),
        serviceId: service.id,
        categoryId: category._id,
        subcategoryId: subcategory._id,
        slotId: slot._id,
        serviceName: subcategory.name,
        categoryName: category.name,
        subcategoryName: subcategory.name,
        serviceTypeName: subcategory.name,
        date: slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        address: address.trim(),
        notes: typeof notes === "string" ? notes.trim() : "",
        price: service.price,
        paymentMethod,
        paymentStatus: isPaid ? "Paid" : "Pending",
        status: isPaid ? "Confirmed" : "Pending",
        reservationExpiresAt: null,
      }], { session });
      createdRecords.booking = booking;

      const [payment] = await Payment.create([{
        transactionId: `SH-PAY-${randomUUID().replaceAll("-", "").toUpperCase()}`,
        bookingId: booking._id,
        bookingCode: booking.bookingId,
        customerId: booking.customerId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        serviceName: booking.serviceName,
        paymentMethod,
        date: new Date(),
        amount: booking.price,
        status: isPaid ? "Paid" : "Pending",
      }], { session });
      createdRecords.payment = payment;

      const [notification] = await AdminBookingNotification.create([{
        bookingRef: booking._id,
        bookingId: booking.bookingId,
        customerName: booking.customerName,
        serviceName: booking.serviceName,
        appointmentDate: booking.date,
      }], { session });
      createdRecords.notification = notification;
    });

    const { booking, payment, notification } = createdRecords;
    if (!booking || !payment || !notification) throw new Error("The booking could not be created.");
    try {
      emitBookingNotification({
        _id: notification.id,
        bookingRef: booking.id,
        bookingId: notification.bookingId,
        customerName: notification.customerName,
        serviceName: notification.serviceName,
        appointmentDate: notification.appointmentDate,
        createdAt: notification.createdAt,
      });
    } catch (error) {
      console.error("Booking was saved, but the live admin notification could not be sent.", error);
    }
    res.status(201).json({ booking, payment });
  } catch (error) {
    if (error instanceof SlotReservationConflict) {
      res.status(error.message.startsWith("Your account") ? 401 : error.message.startsWith("This service") ? 404 : 409).json({ message: error.message });
      return;
    }
    next(error);
  } finally {
    await session.endSession();
  }
});

class SlotReservationConflict extends Error {}

router.get("/bookings/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid booking ID." });
    return;
  }
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.authUserId,
    }).lean();
    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

router.get("/bookings/:id/payment", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid booking ID." });
    return;
  }
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.authUserId })
      .select("_id")
      .lean();
    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }
    const payment = await Payment.findOne({
      bookingId: booking._id,
      customerId: req.authUserId,
    }).lean();
    res.json({ payment });
  } catch (error) {
    next(error);
  }
});

router.post("/bookings/:id/payment", async (req, res, next) => {
  const { paymentMethod } = req.body as Record<string, unknown>;
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid booking ID." });
    return;
  }
  if (paymentMethod !== "bkash" && paymentMethod !== "card" && paymentMethod !== "cod") {
    res.status(400).json({ message: "Choose bKash, Card, or Cash on Delivery." });
    return;
  }

  const session = await mongoose.startSession();
  try {
    let payment: InstanceType<typeof Payment> | null = null;
    await session.withTransaction(async () => {
      const booking = await Booking.findOne({
        _id: req.params.id,
        customerId: req.authUserId,
        status: { $ne: "Cancelled" },
        paymentStatus: "Pending",
        reservationExpiresAt: { $gt: new Date() },
      }).session(session);
      if (!booking) {
        const existing = await Payment.findOne({
          bookingId: req.params.id,
          customerId: req.authUserId,
        }).session(session);
        if (existing) {
          throw new PaymentConflict("A payment has already been created for this booking.");
        }
        throw new PaymentConflict("This booking is unavailable for payment.");
      }

      const isPaid = paymentMethod !== "cod";
      payment = new Payment({
        transactionId: `SH-PAY-${randomUUID().replaceAll("-", "").toUpperCase()}`,
        bookingId: booking._id,
        bookingCode: booking.bookingId,
        customerId: booking.customerId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        serviceName: booking.serviceName,
        paymentMethod,
        date: new Date(),
        amount: booking.price,
        status: isPaid ? "Paid" : "Pending",
      });
      await payment.save({ session });

      const slotUpdate = await Slot.updateOne(
        { _id: booking.slotId, reservedCount: { $gt: 0 } },
        { $inc: { reservedCount: -1, bookedCount: 1 } },
        { session },
      );
      if (slotUpdate.matchedCount !== 1) {
        throw new PaymentConflict("The reserved time slot could not be confirmed.");
      }

      const updatedBooking = await Booking.updateOne(
        { _id: booking._id, customerId: req.authUserId, paymentStatus: "Pending" },
        {
          $set: {
            paymentStatus: isPaid ? "Paid" : "Pending",
            paymentMethod,
            ...(isPaid && booking.status === "Pending" ? { status: "Confirmed" } : {}),
            reservationExpiresAt: null,
          },
        },
        { session },
      );
      if (updatedBooking.matchedCount !== 1) {
        throw new PaymentConflict("The booking payment status changed. Please refresh and try again.");
      }
    });

    res.status(201).json({ payment });
  } catch (error) {
    if (error instanceof PaymentConflict) {
      res.status(409).json({ message: error.message });
      return;
    }
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      res.status(409).json({ message: "A payment has already been created for this booking." });
      return;
    }
    next(error);
  } finally {
    await session.endSession();
  }
});

router.get("/payments", async (req, res, next) => {
  const status = req.query.status;
  const paymentMethod = req.query.method;
  if (
    (status !== undefined && (typeof status !== "string" || !paymentStatuses.includes(status as (typeof paymentStatuses)[number]))) ||
    (paymentMethod !== undefined && (typeof paymentMethod !== "string" || !paymentMethods.includes(paymentMethod as (typeof paymentMethods)[number])))
  ) {
    res.status(400).json({ message: "Invalid payment filter." });
    return;
  }
  try {
    const paymentQuery = Payment.find().where("customerId", req.authUserId);
    if (typeof status === "string") paymentQuery.where("status", status);
    if (typeof paymentMethod === "string") paymentQuery.where("paymentMethod", paymentMethod);
    const payments = await paymentQuery.sort({ date: -1 }).lean();
    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

router.get("/payments/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid payment ID." });
    return;
  }
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      customerId: req.authUserId,
    }).lean();
    if (!payment) {
      res.status(404).json({ message: "Payment not found." });
      return;
    }
    const booking = await Booking.findOne({
      _id: payment.bookingId,
      customerId: req.authUserId,
    })
      .select("bookingId date startTime endTime categoryName subcategoryName phone address notes status paymentStatus paymentMethod")
      .lean();
    res.json({ payment, booking });
  } catch (error) {
    next(error);
  }
});

router.patch("/bookings/:id/cancel", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid booking ID." });
    return;
  }
  const session = await mongoose.startSession();
  try {
    let booking: InstanceType<typeof Booking> | null = null;
    await session.withTransaction(async () => {
      const existingPayment = await Payment.exists({ bookingId: req.params.id }).session(session);
      if (existingPayment) {
        throw new PaymentConflict("A booking with a payment record cannot be cancelled online. Please contact ServiceHub support.");
      }
      booking = await Booking.findOneAndUpdate(
        { _id: req.params.id, customerId: req.authUserId, status: "Pending", paymentStatus: "Pending" },
        { status: "Cancelled", reservationExpiresAt: null },
        { returnDocument: "after", runValidators: true, session },
      );
      if (!booking) return;
      if (booking.slotId) {
        const slotUpdate = await Slot.updateOne(
          { _id: booking.slotId, reservedCount: { $gt: 0 } },
          { $inc: { reservedCount: -1 } },
          { session },
        );
        if (slotUpdate.matchedCount !== 1) {
          throw new PaymentConflict("The reserved time slot could not be released. Please contact ServiceHub support.");
        }
      }
    });
    if (!booking) {
      res.status(409).json({ message: "Only pending bookings can be cancelled by customers." });
      return;
    }
    res.json({ booking });
  } catch (error) {
    if (error instanceof PaymentConflict) {
      res.status(409).json({ message: error.message });
      return;
    }
    next(error);
  } finally {
    await session.endSession();
  }
});

class PaymentConflict extends Error {}

router.post("/bookings/:id/reviews", async (req, res, next) => {
  const { rating, comment } = req.body as Record<string, unknown>;
  if (
    !mongoose.isValidObjectId(req.params.id) ||
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    !isText(comment, 2000)
  ) {
    res.status(400).json({ message: "Provide a completed booking, a 1-5 rating, and a comment." });
    return;
  }
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.authUserId,
      status: "Completed",
    });
    if (!booking) {
      res.status(404).json({ message: "Only your completed bookings can be reviewed." });
      return;
    }
    const review = await Review.create({
      customerId: req.authUserId,
      bookingId: booking.id,
      customerName: booking.customerName,
      serviceName: booking.serviceName,
      rating,
      comment: comment.trim(),
    });
    res.status(201).json({ review });
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      res.status(409).json({ message: "You have already reviewed this booking." });
      return;
    }
    next(error);
  }
});

export default router;
