import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);

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

  const port = Number(process.env.PORT ?? 5000);
  app.listen(port, () => {
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