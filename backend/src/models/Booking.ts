import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    customerEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    serviceName: { type: String, required: true, trim: true, maxlength: 100 },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    subcategoryId: { type: Schema.Types.ObjectId, ref: "Subcategory", default: null },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true, index: true },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    date: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    categoryName: { type: String, trim: true, maxlength: 80, default: "" },
    subcategoryName: { type: String, trim: true, maxlength: 100, default: "" },
    serviceTypeName: { type: String, trim: true, maxlength: 100, default: "" },
    reservationExpiresAt: { type: Date, default: null, index: true },
    paymentMethod: { type: String, enum: ["bkash", "card", "cod", "bkash_demo", "card_demo"], default: null },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Pending", "Confirmed", "Completed", "Cancelled"], default: "Pending" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },
  },
  { timestamps: true },
);

export const Booking = mongoose.model("Booking", bookingSchema);
