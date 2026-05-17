"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("../controllers/reviews.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Handles submitting and getting reviews
// Submit requires auth, getting reviews is public
const router = (0, express_1.Router)();
// Submit a review after a match (auth required)
router.post("/", auth_middleware_1.requireAuth, reviews_controller_1.submitReview);
// Get all reviews for a specific user (public)
router.get("/:userId", reviews_controller_1.getReviews);
exports.default = router;
