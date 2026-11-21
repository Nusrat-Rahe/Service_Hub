import mongoose, { Schema } from "mongoose";

const subcategorySchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    includes: { type: [String], default: [] },
    duration: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

subcategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });

export const Subcategory = mongoose.model("Subcategory", subcategorySchema);
