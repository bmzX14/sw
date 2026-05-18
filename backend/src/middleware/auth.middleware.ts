import { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

// Extend the Express request with the authenticated Supabase user snapshot.
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    authId?: string;
    email?: string;
    metadata?: {
      name?: string;
      full_name?: string;
      user_name?: string;
      nickname?: string;
      email?: string;
      avatar_url?: string;
      picture?: string;
      profile_image?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
      university?: string;
      nationality?: string;
      [key: string]: unknown;
    };
    identities?: Array<{
      provider?: string;
      identity_data?: Record<string, unknown>;
    }>;
  };
}

// Verify the bearer token and attach the current user to req.user.
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

    const normalizedEmail = user.email?.trim().toLowerCase() ?? "";
    let appUserId = user.id;

    const { data: userRowById, error: userRowByIdError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (userRowByIdError) {
      return res.status(500).json({ message: "Failed to resolve app user." });
    }

    if (userRowById?.id) {
      appUserId = userRowById.id;
    } else if (normalizedEmail) {
      const { data: userRowByEmail, error: userRowByEmailError } = await supabaseAdmin
        .from("users")
        .select("id")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (userRowByEmailError) {
        return res.status(500).json({ message: "Failed to resolve app user." });
      }

      if (userRowByEmail?.id) {
        appUserId = userRowByEmail.id;
      }
    }

    req.user = {
      id: appUserId,
      authId: user.id,
      email: user.email,
      metadata: user.user_metadata ?? {},
      identities: (user.identities ?? []).map((identity) => ({
        provider: identity.provider,
        identity_data:
          identity.identity_data &&
          typeof identity.identity_data === "object" &&
          !Array.isArray(identity.identity_data)
            ? (identity.identity_data as Record<string, unknown>)
            : {},
      })),
    };

    next();
  } catch {
    return res.status(500).json({ message: "Authentication check failed." });
  }
}
