import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true, trim: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    bookingCode: { type: String, required: true, trim: true, maxlength: 20 },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    customerEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
    serviceName: { type: String, required: true, trim: true, maxlength: 100 },
    paymentMethod: { type: String, enum: ["bkash", "card", "cod", "bkash_demo", "card_demo"], required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: process.env.CURRENCY ?? "BDT" },
    status: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },
  },
  { timestamps: true },
);

paymentSchema.index({ customerId: 1, date: -1 });
paymentSchema.index({ paymentMethod: 1, status: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);
