import mongoose, { Schema } from "mongoose";

const supportMessageSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ["New", "In progress", "Resolved"],
      default: "New",
    },
  },
  { timestamps: true },
);

export const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);
