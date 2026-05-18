"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("../controllers/reviews.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Review endpoints for roommate feedback after accepted matches.
const router = (0, express_1.Router)();
// Submit a review for the other user in an accepted match.
router.post("/", auth_middleware_1.requireAuth, reviews_controller_1.submitReview);
// Read public reviews for a given user profile.
router.get("/:userId", reviews_controller_1.getReviews);
exports.default = router;
