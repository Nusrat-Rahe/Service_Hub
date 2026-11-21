import { Router } from "express";
import { Booking } from "../models/Booking";
import { Review } from "../models/Review";
import { Service } from "../models/Service";
import { User } from "../models/User";

const router = Router();
const defaultLimit = 6;
const maximumLimit = 12;

function parseNonNegativeInteger(value: unknown): number | null {
  if (value === undefined) return 0;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseLimit(value: unknown): number | null {
  if (value === undefined) return defaultLimit;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximumLimit
    ? parsed
    : null;
}

const eligibleReviewStages = [
  { $match: { status: "Published" } },
  {
    $lookup: {
      from: Booking.collection.name,
      localField: "bookingId",
      foreignField: "_id",
      as: "booking",
    },
  },
  { $unwind: "$booking" },
  {
    $match: {
      $expr: {
        $and: [
          { $eq: ["$booking.status", "Completed"] },
          { $eq: ["$booking.customerId", "$customerId"] },
        ],
      },
    },
  },
  {
    $lookup: {
      from: User.collection.name,
      localField: "customerId",
      foreignField: "_id",
      as: "customer",
    },
  },
  { $unwind: "$customer" },
  {
    $lookup: {
      from: Service.collection.name,
      localField: "booking.serviceId",
      foreignField: "_id",
      as: "service",
    },
  },
  { $unwind: "$service" },
  {
    $project: {
      customerName: "$customer.fullName",
      customerProfileImage: "$customer.profileImage",
      serviceName: "$service.name",
      serviceImage: "$service.image",
      serviceId: "$service._id",
      bookingReference: "$booking.bookingId",
      rating: 1,
      comment: 1,
      status: 1,
      createdAt: 1,
    },
  },
];

router.get("/testimonials", async (req, res, next) => {
  const offset = parseNonNegativeInteger(req.query.offset);
  const limit = parseLimit(req.query.limit);
  if (offset === null || limit === null) {
    res.status(400).json({ message: "Review pagination values are invalid." });
    return;
  }

  try {
    const [result] = await Review.aggregate<{
      reviews: Array<{
        _id: string;
        customerName: string;
        customerProfileImage?: string;
        serviceName: string;
        serviceId: string;
        serviceImage: string;
        bookingReference: string;
        rating: number;
        comment: string;
        createdAt: Date;
      }>;
      metadata: Array<{ total: number }>;
    }>([
      ...eligibleReviewStages,
      {
        $facet: {
          reviews: [
            { $sort: { createdAt: -1, _id: -1 } },
            { $skip: offset },
            { $limit: limit },
          ],
          metadata: [{ $count: "total" }],
        },
      },
    ]);
    const reviews = result?.reviews ?? [];
    const total = result?.metadata[0]?.total ?? 0;
    res.json({
      reviews,
      total,
      offset,
      hasMore: offset + reviews.length < total,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
