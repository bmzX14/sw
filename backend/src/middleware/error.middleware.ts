import { NextFunction, Request, Response } from "express";

// Fallback error handler for unhandled Express errors.
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;

  res.status(status).json({
    message: err.message || "Internal server error",
  });
}
