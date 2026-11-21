import mongoose, { Schema } from "mongoose";

const serviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    image: { type: String, trim: true, maxlength: 2048, default: "" },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

export const Service = mongoose.model("Service", serviceSchema);
