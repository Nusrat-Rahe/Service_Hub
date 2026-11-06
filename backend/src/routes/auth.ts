import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/User";

const router = Router();
const cookieName = "servicehub_token";
const tokenLifetimeMs = 7 * 24 * 60 * 60 * 1000;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET must be at least 32 bytes long.");
  }
  return secret;
}

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
  };
}

function publicUser(user: {
  id: string;
  fullName: string;
  email: string;
  role: string;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

function setAuthCookie(res: Response, user: { id: string; role: string }) {
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
  res.cookie(cookieName, token, {
    ...cookieOptions(),
    maxAge: tokenLifetimeMs,
  });
}

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, password } = req.body as Record<string, unknown>;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({ message: "Name, email, and password are required." });
      return;
    }

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || normalizedName.length > 100) {
      res.status(400).json({ message: "Name must be between 1 and 100 characters." });
      return;
    }
    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      res.status(400).json({ message: "Enter a valid email address." });
      return;
    }
    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      res.status(400).json({
        message: "Password must be at least 8 characters and no more than 72 bytes.",
      });
      return;
    }

    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        fullName: normalizedName,
        email: normalizedEmail,
        passwordHash,
      });
      setAuthCookie(res, user);
      res.status(201).json({
        message: "Account created successfully.",
        user: publicUser(user),
      });
    } catch (error) {
      if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
      ) {
        res.status(409).json({ message: "An account with this email already exists." });
        return;
      }
      next(error);
    }
  },
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as Record<string, unknown>;
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    try {
      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      }).select("+passwordHash");

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ message: "Invalid email or password." });
        return;
      }

      setAuthCookie(res, user);
      res.json({
        message: "Signed in successfully.",
        user: publicUser(user),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.[cookieName];
    if (typeof token !== "string") {
      res.status(401).json({ message: "You are not signed in." });
      return;
    }

    let userId: string;
    try {
      const payload = jwt.verify(token, getJwtSecret());
      if (typeof payload === "string" || typeof payload.sub !== "string") {
        res.clearCookie(cookieName, cookieOptions());
        res.status(401).json({ message: "Your session is invalid. Please sign in again." });
        return;
      }
      userId = payload.sub;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.clearCookie(cookieName, cookieOptions());
        res.status(401).json({ message: "Your session has expired. Please sign in again." });
        return;
      }
      next(error);
      return;
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        res.clearCookie(cookieName, cookieOptions());
        res.status(401).json({ message: "Your account could not be found." });
        return;
      }
      res.json({ user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  },
);

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(cookieName, cookieOptions());
  res.json({ message: "Signed out successfully." });
});

export default router;
