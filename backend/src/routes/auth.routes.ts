import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

// Authentication endpoints: register, login, and logout.

const router = Router();

// Create a new account and trigger email verification.
router.post("/register", register);

// Exchange email/password for a Supabase session.
router.post("/login", login);

// Protected logout endpoint kept for future server-side session handling.
router.post("/logout", requireAuth, logout);

export default router;
