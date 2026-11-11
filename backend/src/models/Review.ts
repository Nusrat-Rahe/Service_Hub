import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    serviceName: { type: String, required: true, trim: true, maxlength: 100 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["Pending", "Published", "Hidden"], default: "Pending" },
  },
  { timestamps: true },
);
reviewSchema.index({ customerId: 1, bookingId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
