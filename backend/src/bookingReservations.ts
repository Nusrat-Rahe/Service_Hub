import mongoose from "mongoose";
import { Booking } from "./models/Booking";
import { Payment } from "./models/Payment";
import { Slot } from "./models/Slot";

export async function expireBookingReservations(now = new Date()) {
  const expiredBookings = await Booking.find({
    status: "Pending",
    paymentStatus: "Pending",
    reservationExpiresAt: { $type: "date", $lte: now },
    slotId: { $exists: true },
  })
    .select("_id slotId")
    .limit(100)
    .lean();
  if (!expiredBookings.length) return 0;

  const session = await mongoose.startSession();
  try {
    let expiredCount = 0;
    await session.withTransaction(async () => {
      for (const expiredBooking of expiredBookings) {
        const booking = await Booking.findOneAndUpdate(
          {
            _id: expiredBooking._id,
            status: "Pending",
            paymentStatus: "Pending",
            reservationExpiresAt: { $type: "date", $lte: now },
          },
          { $set: { status: "Cancelled", paymentStatus: "Failed", reservationExpiresAt: null } },
          { new: true, session },
        );
        if (!booking) continue;

        const slotUpdate = await Slot.updateOne(
          { _id: expiredBooking.slotId, reservedCount: { $gt: 0 } },
          { $inc: { reservedCount: -1 } },
          { session },
        );
        if (slotUpdate.matchedCount !== 1) {
          throw new Error(`Could not release the reserved slot for booking ${booking.bookingId}.`);
        }
        await Payment.updateOne(
          { bookingId: booking._id, status: "Pending" },
          { $set: { status: "Failed" } },
          { session },
        );
        expiredCount += 1;
      }
    });
    return expiredCount;
  } finally {
    await session.endSession();
  }
}
