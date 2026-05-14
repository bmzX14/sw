import { Router } from "express";
import { getMyProfile, updateMyProfile } from "../controllers/profile.controller";
import { requireAuth } from "../middleware/auth.middleware";
//Handles getting and updating user profiles
//all routes require authentication

const router = Router();

//get current user's profile 

router.get("/profile", requireAuth, getMyProfile);

//update current user's profile
router.put("/profile", requireAuth, updateMyProfile);

export default router;