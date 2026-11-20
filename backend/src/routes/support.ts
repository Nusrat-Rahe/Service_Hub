import { Router } from "express";
import { SupportMessage } from "../models/SupportMessage";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req, res, next) => {
  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ message: "Enter your name, email, subject, and message." });
    return;
  }

  const { fullName, email, subject, message } = body as Record<string, unknown>;
  const normalizedName = typeof fullName === "string" ? fullName.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedSubject = typeof subject === "string" ? subject.trim() : "";
  const normalizedMessage = typeof message === "string" ? message.trim() : "";

  if (!normalizedName || normalizedName.length > 100) {
    res.status(400).json({ message: "Name must be between 1 and 100 characters." });
    return;
  }
  if (
    normalizedEmail.length > 254 ||
    !emailPattern.test(normalizedEmail)
  ) {
    res.status(400).json({ message: "Enter a valid email address." });
    return;
  }
  if (!normalizedSubject || normalizedSubject.length > 160) {
    res.status(400).json({ message: "Subject must be between 1 and 160 characters." });
    return;
  }
  if (!normalizedMessage || normalizedMessage.length > 3000) {
    res.status(400).json({ message: "Message must be between 1 and 3000 characters." });
    return;
  }

  try {
    await SupportMessage.create({
      fullName: normalizedName,
      email: normalizedEmail,
      subject: normalizedSubject,
      message: normalizedMessage,
    });
    res.status(201).json({
      message: "Thanks for contacting us. Your message has been received.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
