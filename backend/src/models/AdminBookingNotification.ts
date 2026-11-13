import mongoose, { Schema } from "mongoose";

const adminBookingNotificationSchema = new Schema(
  {
    bookingRef: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    bookingId: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    serviceName: { type: String, required: true, trim: true },
    appointmentDate: { type: Date, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const AdminBookingNotification = mongoose.model(
  "AdminBookingNotification",
  adminBookingNotificationSchema,
);
