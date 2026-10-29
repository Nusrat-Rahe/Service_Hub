import "dotenv/config";

import cors from "cors";
import express from "express";

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
    message: "ServiceHub API is running",
  });
});

const port = Number(process.env.PORT ?? 5000);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});