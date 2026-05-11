import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";


// Extend the Express Request type to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    metadata?: {
      name?: string;
      university?: string;
      nationality?: string;
    };
  };
}

// Middleware to require authentication and populate req.user
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token." });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata ?? {},
    };

    next();
  } catch {
    return res.status(500).json({ message: "Authentication check failed." });
  }
}
