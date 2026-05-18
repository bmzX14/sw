import { Router } from "express";
import { getMyProfile, updateMyProfile } from "../controllers/profile.controller";
import { requireAuth } from "../middleware/auth.middleware";

// Profile endpoints for reading and updating the current user.

const router = Router();

// Return the signed-in user's profile row.
router.get("/profile", requireAuth, getMyProfile);

// Update editable profile fields for the signed-in user.
router.put("/profile", requireAuth, updateMyProfile);

export default router;
