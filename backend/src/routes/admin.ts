import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
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
import { requireAdmin } from "../middleware/requireAdmin";
import { ensureServiceCategory } from "../seedCategories";

const router = Router();
router.use(requireAdmin);

const paymentMethods = ["bkash", "card", "cod", "bkash_demo", "card_demo"] as const;
const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"] as const;

router.get("/booking-notifications", async (req, res, next) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      AdminBookingNotification.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
      AdminBookingNotification.countDocuments({ readBy: { $ne: req.authUserId } }),
    ]);
    res.json({
      notifications: notifications.map((notification) => ({
        ...notification,
        isRead: notification.readBy.some((id) => id.toString() === req.authUserId),
      })),
      unreadCount,
    });
  } catch (error) {
    routeError(next, error);
  }
});

router.patch("/booking-notifications/read-all", async (req, res, next) => {
  try {
    await AdminBookingNotification.updateMany(
      { readBy: { $ne: req.authUserId } },
      { $addToSet: { readBy: req.authUserId } },
    );
    res.json({ message: "All booking notifications marked as read." });
  } catch (error) {
    routeError(next, error);
  }
});

router.patch("/booking-notifications/:id/read", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid booking notification ID." });
    return;
  }
  try {
    const notification = await AdminBookingNotification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.authUserId } },
      { new: true },
    ).lean();
    if (!notification) {
      res.status(404).json({ message: "Booking notification not found." });
      return;
    }
    res.json({ message: "Booking notification marked as read." });
  } catch (error) {
    routeError(next, error);
  }
});

function routeError(next: NextFunction, error: unknown) {
  next(error);
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

router.get("/overview", async (_req, res, next) => {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  try {
    const [customers, services, bookings, pendingBookings, completedBookings, revenue, rating, bookingStatuses, popularServices, recentBookings] =
      await Promise.all([
        User.countDocuments({ role: "user", status: { $ne: "Inactive" } }),
        Service.countDocuments({ status: "Active" }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: "Pending" }),
        Booking.countDocuments({ status: "Completed" }),
        Payment.aggregate([
          { $match: { status: "Paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Review.aggregate([
          { $match: { status: "Published" } },
          { $group: { _id: null, average: { $avg: "$rating" } } },
        ]),
        Booking.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Booking.aggregate([
          { $match: { date: { $gte: monthStart } } },
          { $group: { _id: "$serviceName", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 4 },
        ]),
        Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
      ]);
    res.json({
      customers,
      services,
      bookings,
      pendingBookings,
      completedBookings,
      revenue: revenue[0]?.total ?? 0,
      averageRating: rating[0]?.average ?? 0,
      bookingStatuses: Object.fromEntries(
        bookingStatuses.map((status: { _id: string; count: number }) => [
          status._id,
          status.count,
        ]),
      ),
      popularServices: popularServices.map(
        (service: { _id: string; count: number }) => ({
          name: service._id,
          count: service.count,
        }),
      ),
      recentBookings,
    });
  } catch (error) {
    routeError(next, error);
  }
});

router.get("/customers", async (_req, res, next) => {
  try {
    const customers = await User.find({ role: "user" })
      .select("fullName email status createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ customers });
  } catch (error) {
    routeError(next, error);
  }
});

router.patch("/customers/:id/status", async (req, res, next) => {
  const { status } = req.body as Record<string, unknown>;
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid customer ID." });
    return;
  }
  if (status !== "Active" && status !== "Inactive") {
    res.status(400).json({ message: "Invalid customer status." });
    return;
  }
  try {
    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "user" },
      { status },
      { new: true, runValidators: true },
    ).select("fullName email status createdAt");
    if (!customer) {
      res.status(404).json({ message: "Customer not found." });
      return;
    }
    res.json({ customer });
  } catch (error) {
    routeError(next, error);
  }
});

router.get("/admins", async (_req, res, next) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("fullName email status createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ admins });
  } catch (error) {
    routeError(next, error);
  }
});

router.patch("/admins/:id/status", async (req, res, next) => {
  const { status } = req.body as Record<string, unknown>;
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid admin ID." });
    return;
  }
  if (status !== "Active" && status !== "Inactive") {
    res.status(400).json({ message: "Invalid admin status." });
    return;
  }
  if (req.params.id === req.authUserId && status === "Inactive") {
    res.status(400).json({ message: "You cannot deactivate your own account." });
    return;
  }
  try {
    if (status === "Inactive" && (await User.countDocuments({ role: "admin", status: { $ne: "Inactive" } })) <= 1) {
      res.status(409).json({ message: "The last active admin cannot be deactivated." });
      return;
    }
    const admin = await User.findOneAndUpdate(
      { _id: req.params.id, role: "admin" },
      { status },
      { new: true, runValidators: true },
    ).select("fullName email status createdAt");
    if (!admin) {
      res.status(404).json({ message: "Admin account not found." });
      return;
    }
    res.json({ admin });
  } catch (error) {
    routeError(next, error);
  }
});

router.delete("/admins/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid admin ID." });
    return;
  }
  if (req.params.id === req.authUserId) {
    res.status(400).json({ message: "You cannot delete your own account." });
    return;
  }
  try {
    if ((await User.countDocuments({ role: "admin", status: { $ne: "Inactive" } })) <= 1) {
      res.status(409).json({ message: "The last active admin cannot be deleted." });
      return;
    }
    const admin = await User.findOneAndDelete({ _id: req.params.id, role: "admin" });
    if (!admin) {
      res.status(404).json({ message: "Admin account not found." });
      return;
    }
    res.json({ message: "Admin account deleted." });
  } catch (error) {
    routeError(next, error);
  }
});

router.post("/admins", async (req, res, next) => {
  const { fullName, email, password } = req.body as Record<string, unknown>;
  if (
    !isNonEmptyString(fullName, 100) ||
    !isNonEmptyString(email, 254) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    res.status(400).json({ message: "Provide a valid name, email, and password (8-72 bytes)." });
    return;
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: "admin",
    });
    res.status(201).json({
      admin: { id: admin.id, fullName: admin.fullName, email: admin.email },
    });
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }
    routeError(next, error);
  }
});

router.get("/services", async (_req, res, next) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 }).lean();
    res.json({ services });
  } catch (error) {
    routeError(next, error);
  }
});

router.post("/services", async (req, res, next) => {
  const { name, category, description, image, price } = req.body as Record<string, unknown>;
  if (
    !isNonEmptyString(name, 100) ||
    !isNonEmptyString(category, 80) ||
    !isNonEmptyString(description, 1000) ||
    (image !== undefined && typeof image !== "string") ||
    (typeof image === "string" && image.length > 2048) ||
    !isPrice(price)
  ) {
    res.status(400).json({ message: "Provide a name, category, description, and valid price." });
    return;
  }
  const session = await mongoose.startSession();
  try {
    let service: InstanceType<typeof Service> | null = null;
    await session.withTransaction(async () => {
      const [created] = await Service.create([{
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        image: typeof image === "string" ? image.trim() : "",
        price,
      }], { session });
      service = created;
      await ensureServiceCategory(created, session, true);
    });
    if (!service) throw new Error("The service could not be created.");
    res.status(201).json({ service });
  } catch (error) {
    routeError(next, error);
  } finally {
    await session.endSession();
  }
});

router.patch("/services/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid service ID." });
    return;
  }
  const { name, category, description, image, price, status } = req.body as Record<string, unknown>;
  const update: Record<string, string | number> = {};
  if (name !== undefined) {
    if (!isNonEmptyString(name, 100)) { res.status(400).json({ message: "Invalid service name." }); return; }
    update.name = name.trim();
  }
  if (category !== undefined) {
    if (!isNonEmptyString(category, 80)) { res.status(400).json({ message: "Invalid service category." }); return; }
    update.category = category.trim();
  }
  if (description !== undefined) {
    if (!isNonEmptyString(description, 1000)) { res.status(400).json({ message: "Invalid service description." }); return; }
    update.description = description.trim();
  }
  if (image !== undefined) {
    if (typeof image !== "string" || image.length > 2048) { res.status(400).json({ message: "Invalid service image URL." }); return; }
    update.image = image.trim();
  }
  if (price !== undefined) {
    if (!isPrice(price)) { res.status(400).json({ message: "Invalid service price." }); return; }
    update.price = price;
  }
  if (status !== undefined) {
    if (status !== "Active" && status !== "Inactive") { res.status(400).json({ message: "Invalid service status." }); return; }
    update.status = status;
  }
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!service) { res.status(404).json({ message: "Service not found." }); return; }
    const categoryRecord = await Category.findOne({ serviceId: service._id });
    if (categoryRecord) {
      if (typeof update.name === "string") {
        categoryRecord.name = update.name;
        categoryRecord.heading = `Choose Your ${update.name} Service`;
        await categoryRecord.save();
      }
      if (typeof update.description === "string") {
        await Subcategory.updateOne(
          { categoryId: categoryRecord._id, slug: "general" },
          { $set: { description: update.description } },
        );
      }
    }
    res.json({ service });
  } catch (error) {
    routeError(next, error);
  }
});

router.delete("/services/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid service ID." });
    return;
  }
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) { res.status(404).json({ message: "Service not found." }); return; }
    res.json({ message: "Service deleted." });
  } catch (error) {
    routeError(next, error);
  }
});

router.get("/bookings", async (_req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 }).lean();
    res.json({ bookings });
  } catch (error) {
    routeError(next, error);
  }
});

router.get("/reports", async (req, res, next) => {
  const period = req.query.period === "year" ? "year" : "month";
  const dateFormat = period === "year" ? "%Y" : "%Y-%m";
  const start = new Date();
  if (period === "year") {
    start.setUTCMonth(0, 1);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCFullYear(start.getUTCFullYear() - 4);
  } else {
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCMonth(start.getUTCMonth() - 11);
  }
  try {
    const [bookings, revenue, topServices] = await Promise.all([
      Booking.aggregate([
        { $match: { date: { $gte: start } } },
        { $group: { _id: { $dateToString: { format: dateFormat, date: "$date", timezone: "UTC" } }, bookings: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { status: "Paid", date: { $gte: start } } },
        { $group: { _id: { $dateToString: { format: dateFormat, date: "$date", timezone: "UTC" } }, revenue: { $sum: "$amount" } } },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $match: { date: { $gte: start } } },
        { $group: { _id: "$serviceName", bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 10 },
      ]),
    ]);
    res.json({ period, bookings, revenue, topServices });
  } catch (error) {
    routeError(next, error);
  }
});

router.patch("/bookings/:id/status", async (req, res, next) => {
  const { status } = req.body as Record<string, unknown>;
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(400).json({ message: "Invalid booking ID." }); return; }
  if (!["Pending", "Confirmed", "Completed", "Cancelled"].includes(String(status))) {
    res.status(400).json({ message: "Invalid booking status." });
    return;
  }
  const session = await mongoose.startSession();
  try {
    let booking: InstanceType<typeof Booking> | null = null;
    await session.withTransaction(async () => {
      booking = await Booking.findById(req.params.id).session(session);
      if (!booking) return;
      if (booking.status !== "Cancelled" && status === "Cancelled") {
        if (booking.slotId) {
          const counter = booking.reservationExpiresAt ? "reservedCount" : "bookedCount";
          const slotUpdate = await Slot.updateOne(
            { _id: booking.slotId, [counter]: { $gt: 0 } },
            { $inc: { [counter]: -1 } },
            { session },
          );
          if (slotUpdate.matchedCount !== 1) {
            throw new AdminBookingConflict("The booking time slot could not be released.");
          }
        }
        booking.reservationExpiresAt = null;
        const failedPayments = await Payment.updateMany(
          { bookingId: booking._id, status: "Pending" },
          { $set: { status: "Failed" } },
          { session },
        );
        if (failedPayments.modifiedCount > 0 && booking.paymentStatus === "Pending") {
          booking.paymentStatus = "Failed";
        }
      }
      if (
        booking.status === "Pending" &&
        (status === "Confirmed" || status === "Completed") &&
        booking.slotId &&
        booking.reservationExpiresAt
      ) {
        const slotUpdate = await Slot.updateOne(
          { _id: booking.slotId, reservedCount: { $gt: 0 } },
          { $inc: { reservedCount: -1, bookedCount: 1 } },
          { session },
        );
        if (slotUpdate.matchedCount !== 1) {
          throw new AdminBookingConflict("The reserved booking time slot could not be confirmed.");
        }
        booking.reservationExpiresAt = null;
      }
      if (booking.status === "Cancelled" && status !== "Cancelled") {
        throw new AdminBookingConflict("Cancelled bookings cannot be reopened. Create a new booking instead.");
      }
      booking.status = status as typeof booking.status;
      await booking.save({ session });
    });
    if (!booking) { res.status(404).json({ message: "Booking not found." }); return; }
    res.json({ booking });
  } catch (error) {
    if (error instanceof AdminBookingConflict) {
      res.status(409).json({ message: error.message });
      return;
    }
    routeError(next, error);
  } finally {
    await session.endSession();
  }
});

class AdminBookingConflict extends Error {}

router.get("/payments", async (req, res, next) => {
  const { status, method, q } = req.query;
  if (
    (status !== undefined && (typeof status !== "string" || !paymentStatuses.includes(status as (typeof paymentStatuses)[number]))) ||
    (method !== undefined && (typeof method !== "string" || !paymentMethods.includes(method as (typeof paymentMethods)[number]))) ||
    (q !== undefined && (typeof q !== "string" || q.length > 100))
  ) {
    res.status(400).json({ message: "Invalid payment search or filter." });
    return;
  }
  const escapedQuery = typeof q === "string" && q.trim()
    ? q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    : null;
  const paymentQuery = Payment.find();
  if (typeof status === "string") paymentQuery.where("status", status);
  if (typeof method === "string") paymentQuery.where("paymentMethod", method);
  if (escapedQuery) {
    const expression = new RegExp(escapedQuery, "i");
    paymentQuery.or([{ transactionId: expression }, { bookingCode: expression }]);
  }
  try {
    const [payments, counts] = await Promise.all([
      paymentQuery.sort({ date: -1 }).lean(),
      Payment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);
    const bookingStatuses = await Booking.find({
      _id: { $in: payments.map((payment) => payment.bookingId) },
    })
      .select("_id status")
      .lean();
    const bookingStatusById = new Map(
      bookingStatuses.map((booking) => [booking._id.toString(), booking.status]),
    );
    const byStatus = Object.fromEntries(
      counts.map((item: { _id: string; count: number }) => [item._id, item.count]),
    ) as Record<string, number>;
    res.json({
      payments: payments.map((payment) => ({
        ...payment,
        bookingStatus: bookingStatusById.get(payment.bookingId.toString()) ?? "Unknown",
      })),
      summary: {
        total: counts.reduce((total: number, item: { count: number }) => total + item.count, 0),
        paid: byStatus.Paid ?? 0,
        pending: byStatus.Pending ?? 0,
        failed: byStatus.Failed ?? 0,
      },
    });
  } catch (error) {
    routeError(next, error);
  }
});

router.get("/payments/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid payment ID." });
    return;
  }
  try {
    const payment = await Payment.findById(req.params.id).lean();
    if (!payment) {
      res.status(404).json({ message: "Payment not found." });
      return;
    }
    const [booking, customer] = await Promise.all([
      Booking.findById(payment.bookingId)
        .select("bookingId date address notes status")
        .lean(),
      User.findById(payment.customerId).select("fullName email").lean(),
    ]);
    res.json({ payment, booking, customer });
  } catch (error) {
    routeError(next, error);
  }
});

router.patch("/payments/:id/status", async (req, res, next) => {
  const { status } = req.body as Record<string, unknown>;
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid payment ID." });
    return;
  }
  if (status !== "Paid") {
    res.status(400).json({ message: "Only pending COD payments can be confirmed as paid." });
    return;
  }

  const session = await mongoose.startSession();
  try {
    let updatedPayment: InstanceType<typeof Payment> | null = null;
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({
        _id: req.params.id,
        paymentMethod: "cod",
        status: "Pending",
      }).session(session);
      if (!payment) {
        throw new PaymentStatusConflict("Only pending COD payments can be confirmed.");
      }
      const updatedBooking = await Booking.updateOne(
        { _id: payment.bookingId, status: "Completed", paymentStatus: "Pending" },
        { $set: { paymentStatus: "Paid" } },
        { session },
      );
      if (updatedBooking.matchedCount !== 1) {
        throw new PaymentStatusConflict("The related booking must be completed before COD payment can be confirmed.");
      }
      updatedPayment = await Payment.findOneAndUpdate(
        { _id: payment._id, paymentMethod: "cod", status: "Pending" },
        { $set: { status: "Paid", date: new Date() } },
        { new: true, runValidators: true, session },
      );
      if (!updatedPayment) {
        throw new PaymentStatusConflict("This payment has already been updated.");
      }
    });
    res.json({ payment: updatedPayment });
  } catch (error) {
    if (error instanceof PaymentStatusConflict) {
      res.status(409).json({ message: error.message });
      return;
    }
    routeError(next, error);
  } finally {
    await session.endSession();
  }
});

class PaymentStatusConflict extends Error {}

router.get("/reviews", async (_req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    res.json({ reviews });
  } catch (error) {
    routeError(next, error);
  }
});

router.patch("/reviews/:id/status", async (req, res, next) => {
  const { status } = req.body as Record<string, unknown>;
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(400).json({ message: "Invalid review ID." }); return; }
  if (!["Pending", "Published", "Hidden"].includes(String(status))) {
    res.status(400).json({ message: "Invalid review status." });
    return;
  }
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!review) { res.status(404).json({ message: "Review not found." }); return; }
    res.json({ review });
  } catch (error) {
    routeError(next, error);
  }
});

router.delete("/reviews/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid review ID." });
    return;
  }
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      res.status(404).json({ message: "Review not found." });
      return;
    }
    res.json({ message: "Review deleted." });
  } catch (error) {
    routeError(next, error);
  }
});

router.get("/notifications", async (_req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json({ notifications });
  } catch (error) {
    routeError(next, error);
  }
});

router.post("/notifications", async (req, res, next) => {
  const { title, message, audience, status } = req.body as Record<string, unknown>;
  if (
    !isNonEmptyString(title, 120) ||
    !isNonEmptyString(message, 2000) ||
    (audience !== undefined && !["All customers", "Active customers"].includes(String(audience))) ||
    (status !== undefined && !["Draft", "Scheduled"].includes(String(status)))
  ) {
    res.status(400).json({ message: "Provide a title, message, and valid audience and status." });
    return;
  }
  const safeAudience =
    audience === "Active customers" ? "Active customers" : "All customers";
  const safeStatus = status === "Scheduled" ? "Scheduled" : "Draft";
  try {
    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      audience: safeAudience,
      status: safeStatus,
      createdBy: req.authUserId,
    });
    res.status(201).json({ notification });
  } catch (error) {
    routeError(next, error);
  }
});

router.patch("/notifications/:id/status", async (req, res, next) => {
  const { status } = req.body as Record<string, unknown>;
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid notification ID." });
    return;
  }
  if (status !== "Draft" && status !== "Sent") {
    res.status(400).json({ message: "Choose draft or publish in-app." });
    return;
  }
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status, sentAt: status === "Sent" ? new Date() : null },
      { new: true, runValidators: true },
    );
    if (!notification) {
      res.status(404).json({ message: "Notification not found." });
      return;
    }
    res.json({ notification });
  } catch (error) {
    routeError(next, error);
  }
});

router.delete("/notifications/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid notification ID." });
    return;
  }
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      res.status(404).json({ message: "Notification not found." });
      return;
    }
    res.json({ message: "Notification deleted." });
  } catch (error) {
    routeError(next, error);
  }
});

export default router;
