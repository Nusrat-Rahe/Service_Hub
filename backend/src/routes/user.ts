import { randomUUID } from "node:crypto";
import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/requireAuth";
import { Booking } from "../models/Booking";
import { Notification } from "../models/Notification";
import { Review } from "../models/Review";
import { Service } from "../models/Service";
import { User } from "../models/User";

const router = Router();
router.use(requireAuth);

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
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
      { new: true, runValidators: true },
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

router.post("/bookings", async (req, res, next) => {
  const { serviceId, date, address, notes } = req.body as Record<string, unknown>;
  if (
    typeof serviceId !== "string" ||
    !mongoose.isValidObjectId(serviceId) ||
    typeof date !== "string" ||
    !Number.isFinite(Date.parse(date)) ||
    Date.parse(date) <= Date.now() ||
    !isText(address, 300) ||
    (notes !== undefined && typeof notes !== "string") ||
    (typeof notes === "string" && notes.length > 1000)
  ) {
    res.status(400).json({ message: "Choose an active service, future date, and valid service address." });
    return;
  }

  try {
    const [service, customer] = await Promise.all([
      Service.findOne({ _id: serviceId, status: "Active" }),
      User.findById(req.authUserId).select("fullName email"),
    ]);
    if (!service) {
      res.status(404).json({ message: "This service is no longer available." });
      return;
    }
    if (!customer) {
      res.status(401).json({ message: "Your account could not be found." });
      return;
    }
    const booking = await Booking.create({
      bookingId: `SH-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
      customerId: customer.id,
      customerName: customer.fullName,
      customerEmail: customer.email,
      serviceId: service.id,
      serviceName: service.name,
      date: new Date(date),
      address: address.trim(),
      notes: typeof notes === "string" ? notes.trim() : "",
      price: service.price,
    });
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
});

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

router.patch("/bookings/:id/cancel", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid booking ID." });
    return;
  }
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, customerId: req.authUserId, status: "Pending" },
      { status: "Cancelled" },
      { new: true, runValidators: true },
    );
    if (!booking) {
      res.status(409).json({ message: "Only pending bookings can be cancelled by customers." });
      return;
    }
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

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
