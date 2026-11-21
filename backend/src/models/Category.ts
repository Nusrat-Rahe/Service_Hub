import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true, unique: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

export const Category = mongoose.model("Category", categorySchema);
