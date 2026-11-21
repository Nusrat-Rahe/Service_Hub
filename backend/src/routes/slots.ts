import { Router } from "express";
import mongoose from "mongoose";
import { Service } from "../models/Service";
import { Slot } from "../models/Slot";
import { expireBookingReservations } from "../bookingReservations";

const router = Router();
const slotHours = [9, 10, 11, 12, 14, 15, 16, 17];

function dhakaDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

router.get("/", async (req, res, next) => {
  const { serviceId, month } = req.query;
  if (
    typeof serviceId !== "string" ||
    !mongoose.isValidObjectId(serviceId) ||
    typeof month !== "string" ||
    !/^\d{4}-\d{2}$/.test(month)
  ) {
    res.status(400).json({ message: "Choose a valid service and calendar month." });
    return;
  }
  const [year, monthNumber] = month.split("-").map(Number);
  if (monthNumber < 1 || monthNumber > 12) {
    res.status(400).json({ message: "Choose a valid calendar month." });
    return;
  }
  const monthDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  if (monthDate.toISOString().slice(0, 7) !== month) {
    res.status(400).json({ message: "Choose a valid calendar month." });
    return;
  }

  try {
    await expireBookingReservations();
    const service = await Service.findOne({ _id: serviceId, status: "Active" }).select("_id");
    if (!service) {
      res.status(404).json({ message: "This service is no longer available." });
      return;
    }

    const today = dhakaDateKey(new Date());
    const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const operations = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${month}-${String(day).padStart(2, "0")}`;
      if (date < today) continue;
      for (const hour of slotHours) {
        const startTime = `${String(hour).padStart(2, "0")}:00`;
        const endTime = `${String(hour + 1).padStart(2, "0")}:00`;
        if (date === today && new Date(`${date}T${startTime}:00+06:00`) <= new Date()) continue;
        operations.push({
          updateOne: {
            filter: { serviceId, date, startTime },
            update: { $setOnInsert: { serviceId, date, startTime, endTime, capacity: 1, bookedCount: 0, reservedCount: 0 } },
            upsert: true,
          },
        });
      }
    }
    if (operations.length) {
      try {
        await Slot.bulkWrite(operations, { ordered: false });
      } catch (error) {
        if (
          typeof error !== "object" ||
          error === null ||
          !("code" in error) ||
          error.code !== 11000
        ) {
          throw error;
        }
      }
    }

    const slots = await Slot.find({
      serviceId,
      date: { $gte: `${month}-01`, $lte: `${month}-${String(daysInMonth).padStart(2, "0")}` },
    })
      .sort({ date: 1, startTime: 1 })
      .lean();
    res.json({
      slots: slots.map((slot) => ({
        ...slot,
        available: slot.bookedCount + slot.reservedCount < slot.capacity,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
