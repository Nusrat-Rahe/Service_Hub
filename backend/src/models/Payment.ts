import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true, trim: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    serviceName: { type: String, required: true, trim: true, maxlength: 100 },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: process.env.CURRENCY ?? "BDT" },
    status: { type: String, enum: ["Pending", "Paid", "Refunded"], default: "Pending" },
  },
  { timestamps: true },
);

export const Payment = mongoose.model("Payment", paymentSchema);
