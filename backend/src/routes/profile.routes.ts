import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getMyProfile } from "../controllers/profile.controller";

const router = Router();

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, getMyProfile);

export default router;
