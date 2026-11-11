import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    audience: { type: String, enum: ["All customers", "Active customers"], default: "All customers" },
    status: { type: String, enum: ["Draft", "Scheduled", "Sent"], default: "Draft" },
    sentAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Notification = mongoose.model("Notification", notificationSchema);
