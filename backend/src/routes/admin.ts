import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Booking } from "../models/Booking";
import { Notification } from "../models/Notification";
import { Payment } from "../models/Payment";
import { Review } from "../models/Review";
import { Service } from "../models/Service";
import { User } from "../models/User";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();
router.use(requireAdmin);

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
  const { name, category, description, price } = req.body as Record<string, unknown>;
  if (
    !isNonEmptyString(name, 100) ||
    !isNonEmptyString(category, 80) ||
    !isNonEmptyString(description, 1000) ||
    !isPrice(price)
  ) {
    res.status(400).json({ message: "Provide a name, category, description, and valid price." });
    return;
  }
  try {
    const service = await Service.create({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price,
    });
    res.status(201).json({ service });
  } catch (error) {
    routeError(next, error);
  }
});

router.patch("/services/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid service ID." });
    return;
  }
  const { name, category, description, price, status } = req.body as Record<string, unknown>;
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
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!booking) { res.status(404).json({ message: "Booking not found." }); return; }
    res.json({ booking });
  } catch (error) {
    routeError(next, error);
  }
});

router.get("/payments", async (_req, res, next) => {
  try {
    const payments = await Payment.find().sort({ date: -1 }).lean();
    res.json({ payments });
  } catch (error) {
    routeError(next, error);
  }
});

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
