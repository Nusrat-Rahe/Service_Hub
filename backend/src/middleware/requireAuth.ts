import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      authUserId?: string;
      authUserRole?: "user" | "admin";
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token: unknown = req.cookies?.servicehub_token;
  if (typeof token !== "string") {
    res.status(401).json({ message: "Sign-in is required." });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) {
      throw new Error("JWT_SECRET must be at least 32 bytes long.");
    }

    const payload = jwt.verify(token, secret);
    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      (payload.role !== "user" && payload.role !== "admin")
    ) {
      res.status(401).json({ message: "Your session is invalid. Please sign in again." });
      return;
    }

    const user = await User.findById(payload.sub).select("role status");
    if (!user || user.status === "Inactive" || user.role !== payload.role) {
      res.status(401).json({ message: "Your account is unavailable. Please contact support." });
      return;
    }
    req.authUserId = user.id;
    req.authUserRole = user.role;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Your session has expired. Please sign in again." });
      return;
    }
    next(error);
  }
}
