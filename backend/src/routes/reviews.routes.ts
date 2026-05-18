import { Router } from "express";
import { getReviews, submitReview } from "../controllers/reviews.controller";
import { requireAuth } from "../middleware/auth.middleware";

// Review endpoints for roommate feedback after accepted matches.

const router = Router();

// Submit a review for the other user in an accepted match.
router.post("/", requireAuth, submitReview);

// Read public reviews for a given user profile.
router.get("/:userId", getReviews);

export default router;
