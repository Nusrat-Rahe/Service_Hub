import type { NextFunction, Request, Response } from "express";
import { requireAuth } from "./requireAuth";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  requireAuth(req, res, (error?: unknown) => {
    if (error) {
      next(error);
      return;
    }
    if (req.authUserRole !== "admin") {
      res.status(403).json({ message: "Administrator access is required." });
      return;
    }
    next();
  });
}
