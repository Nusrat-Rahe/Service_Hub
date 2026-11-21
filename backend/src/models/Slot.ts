import mongoose, { Schema } from "mongoose";

const slotSchema = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    capacity: { type: Number, required: true, min: 1, default: 1 },
    bookedCount: { type: Number, required: true, min: 0, default: 0 },
    reservedCount: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

slotSchema.index({ serviceId: 1, date: 1, startTime: 1 }, { unique: true });

export const Slot = mongoose.model("Slot", slotSchema);
