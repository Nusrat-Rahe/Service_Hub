import "dotenv/config";

import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

app.use(express.json());

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

  await mongoose.connect(mongoUri);

  const port = Number(process.env.PORT ?? 5000);
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("MongoDB connection failed. Check MONGODB_URI and Atlas network access.");
  if (error instanceof Error) {
    const safeMessage = error.message.replace(
      /(mongodb(?:\+srv)?:\/\/)[^@\s]+@/gi,
      "$1[REDACTED]@",
    );
    console.error(`${error.name}: ${safeMessage}`);
  }
  process.exit(1);
});