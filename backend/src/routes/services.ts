import { Router } from "express";
import mongoose from "mongoose";
import { Booking } from "../models/Booking";
import { Service } from "../models/Service";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const services = await Service.find({ status: "Active" })
      .sort({ category: 1, name: 1 })
      .lean();
    res.json({ services });
  } catch (error) {
    next(error);
  }
});

router.get("/popular", async (_req, res, next) => {
  try {
    const services = await Service.aggregate([
      { $match: { status: "Active" } },
      {
        $lookup: {
          from: Booking.collection.name,
          localField: "_id",
          foreignField: "serviceId",
          pipeline: [{ $match: { status: "Completed" } }, { $count: "count" }],
          as: "completedBookings",
        },
      },
      {
        $addFields: {
          completedBookingCount: {
            $ifNull: [{ $arrayElemAt: ["$completedBookings.count", 0] }, 0],
          },
        },
      },
      { $match: { completedBookingCount: { $gt: 0 } } },
      { $sort: { completedBookingCount: -1, name: 1 } },
      { $limit: 3 },
      { $project: { name: 1, description: 1, image: 1 } },
    ]);
    res.json({ services });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid service ID." });
    return;
  }
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      status: "Active",
    }).lean();
    if (!service) {
      res.status(404).json({ message: "Service not found." });
      return;
    }
    res.json({ service });
  } catch (error) {
    next(error);
  }
});

export default router;
