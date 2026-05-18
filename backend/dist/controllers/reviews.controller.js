"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReview = submitReview;
exports.getReviews = getReviews;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
// Handles submitting and getting reviews
// Users can only review someone they were matched with
// POST /api/reviews
// Submit a review after a match
async function submitReview(req, res) {
    const reviewerId = req.user.id;
    const { reviewee_id, match_id, rating, comment } = req.body;
    // Validate required fields
    if (!reviewee_id || !match_id || !rating) {
        return res.status(400).json({ message: "reviewee_id, match_id and rating are required." });
    }
    // Validate rating range
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }
    try {
        // Security: verify reviewer was part of this accepted match
        const { data: match, error: matchError } = await supabaseAdmin_1.supabaseAdmin
            .from("matches")
            .select("id, requester_id, owner_id")
            .eq("id", match_id)
            .eq("status", "accepted")
            .or(`requester_id.eq.${reviewerId},owner_id.eq.${reviewerId}`)
            .maybeSingle();
        if (matchError || !match) {
            return res.status(403).json({ message: "You can only review someone you matched with." });
        }
        const actualRevieweeId = match.requester_id === reviewerId ? match.owner_id : match.requester_id;
        if (reviewee_id !== actualRevieweeId) {
            return res.status(403).json({ message: "Reviewee must be the other user in this match." });
        }
        // Check if already reviewed this match
        const { data: existing } = await supabaseAdmin_1.supabaseAdmin
            .from("reviews")
            .select("id")
            .eq("match_id", match_id)
            .eq("reviewer_id", reviewerId)
            .maybeSingle();
        if (existing) {
            return res.status(400).json({ message: "You have already reviewed this match." });
        }
        // Insert the review
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("reviews")
            .insert({
            reviewer_id: reviewerId,
            reviewee_id,
            match_id,
            rating,
            comment,
        })
            .select()
            .single();
        if (error)
            throw error;
        return res.status(201).json(data);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Failed to submit review." });
    }
}
// GET /api/reviews/:userId
// Get all reviews for a specific user with average rating
async function getReviews(req, res) {
    const { userId } = req.params;
    try {
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("reviews")
            .select(`
            id, rating, comment, created_at,
            users!reviewer_id ( name, profile_photo )
        `)
            .eq("reviewee_id", userId)
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        // Calculate average rating
        const averageRating = data.length > 0
            ? Math.round((data.reduce((sum, r) => sum + r.rating, 0) / data.length) * 10) / 10
            : 0;
        return res.json({
            reviews: data,
            average_rating: averageRating,
            total: data.length,
        });
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Failed to fetch reviews." });
    }
}
