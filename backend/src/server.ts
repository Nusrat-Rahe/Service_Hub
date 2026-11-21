import "dotenv/config";

import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Server } from "socket.io";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";
import categoriesRouter from "./routes/categories";
import reviewsRouter from "./routes/reviews";
import servicesRouter from "./routes/services";
import slotsRouter from "./routes/slots";
import supportRouter from "./routes/support";
import userRouter from "./routes/user";
import { User } from "./models/User";
import { configureSocketServer } from "./realtime";
import { seedServices } from "./seedServices";
import { seedCategories } from "./seedCategories";
import { expireBookingReservations } from "./bookingReservations";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});
configureSocketServer(io);

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie ?? "";
    const tokenCookie = cookieHeader.split(";").map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("servicehub_token="));
    if (!tokenCookie) {
      next(new Error("Admin sign-in is required."));
      return;
    }

    const token = decodeURIComponent(tokenCookie.slice("servicehub_token=".length));
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) {
      throw new Error("JWT_SECRET must be at least 32 bytes long.");
    }
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || typeof payload.sub !== "string" || payload.role !== "admin") {
      next(new Error("Administrator access is required."));
      return;
    }
    const admin = await User.findById(payload.sub).select("role status");
    if (!admin || admin.status === "Inactive" || admin.role !== "admin") {
      next(new Error("Administrator access is required."));
      return;
    }
    socket.join("admins");
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new Error("Admin sign-in is required."));
      return;
    }
    next(error instanceof Error ? error : new Error("Could not authorize the live connection."));
  }
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/slots", slotsRouter);
app.use("/api/support", supportRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "ServiceHub API is running successfully.",
  });
});

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to start the server.");
  }
  if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
    throw new Error("JWT_SECRET must be set to a random value at least 32 bytes long.");
  }

  await mongoose.connect(mongoUri);
  await seedServices();
  await seedCategories();
  await expireBookingReservations();
  const reservationCleanup = setInterval(() => {
    expireBookingReservations().catch((error: unknown) => {
      console.error("Could not release expired booking reservations.", error);
    });
  }, 60_000);
  reservationCleanup.unref();

  const port = Number(process.env.PORT ?? 5000);
  httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled request error:", error);
    res.status(500).json({ message: "An unexpected server error occurred." });
  },
);

startServer().catch((error: unknown) => {
  console.error("Server startup failed. Check required environment settings and Atlas access.");
  if (error instanceof Error) {
    const safeMessage = error.message.replace(
      /(mongodb(?:\+srv)?:\/\/)[^@\s]+@/gi,
      "$1[REDACTED]@",
    );
    console.error(`${error.name}: ${safeMessage}`);
  }
  process.exit(1);
});