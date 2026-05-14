import { Router } from "express";
import { getReviews, submitReview } from "../controllers/reviews.controller";
import { requireAuth } from "../middleware/auth.middleware";


// Handles submitting and getting reviews
// Submit requires auth, getting reviews is public


const router = Router();

// Submit a review after a match (auth required)
router.post("/", requireAuth, submitReview);

// Get all reviews for a specific user (public)
router.get("/:userId", getReviews);

export default router;