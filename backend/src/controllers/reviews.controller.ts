import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// Review controller for roommate ratings after accepted matches.

// Submit one review for the other user in an accepted match.
export async function submitReview(req: AuthenticatedRequest, res: Response) {
    const reviewerId = req.user!.id;
    const { reviewee_id, match_id, rating, comment, transaction_completed } = req.body;

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
        const { data: match, error: matchError } = await supabaseAdmin
        .from("matches")
        .select("id, post_id, requester_id, owner_id")
        .eq("id", match_id)
        .eq("status", "accepted")
        .or(`requester_id.eq.${reviewerId},owner_id.eq.${reviewerId}`)
        .maybeSingle();

        if (matchError || !match) {
        return res.status(403).json({ message: "You can only review someone you matched with." });
        }

        const actualRevieweeId =
            match.requester_id === reviewerId ? match.owner_id : match.requester_id;

        if (reviewee_id !== actualRevieweeId) {
            return res.status(403).json({ message: "Reviewee must be the other user in this match." });
        }

        // Check if already reviewed this match
        const { data: existing } = await supabaseAdmin
        .from("reviews")
        .select("id")
        .eq("match_id", match_id)
        .eq("reviewer_id", reviewerId)
        .maybeSingle();

        if (existing) {
        return res.status(400).json({ message: "You have already reviewed this match." });
        }

        // Insert the review
        const { data, error } = await supabaseAdmin
        .from("reviews")
        .insert({
            reviewer_id: reviewerId,
            reviewee_id,
            match_id,
            rating,
            comment,
            // Store whether this reviewer confirmed the deal is done.
            transaction_completed: Boolean(transaction_completed),
        })
        .select()
        .single();

        if (error) throw error;

        if (transaction_completed) {
            const { data: completionReviews, error: completionError } = await supabaseAdmin
                .from("reviews")
                .select("reviewer_id")
                .eq("match_id", match_id)
                .eq("transaction_completed", true);

            if (completionError) throw completionError;

            const completedByOwner = completionReviews.some(
                (review) => review.reviewer_id === match.owner_id
            );
            const completedByRequester = completionReviews.some(
                (review) => review.reviewer_id === match.requester_id
            );

            if (completedByOwner && completedByRequester) {
                const { error: closePostError } = await supabaseAdmin
                    .from("posts")
                    .update({ status: "closed" })
                    .eq("id", match.post_id);

                if (closePostError) throw closePostError;
            }
        }

        return res.status(201).json(data);
    } catch (err: any) {
        return res.status(500).json({ message: err.message || "Failed to submit review." });
    }
    }

// Return all public reviews for a user plus summary stats.
export async function getReviews(req: Request, res: Response) {
    const { userId } = req.params;

    try {
        const { data, error } = await supabaseAdmin
        .from("reviews")
        .select(`
            id, match_id, rating, comment, created_at,
            users!reviewer_id ( name, profile_photo )
        `)
        .eq("reviewee_id", userId)
        .order("created_at", { ascending: false });

        if (error) throw error;

        // Calculate average rating
        const averageRating = data.length > 0
        ? Math.round((data.reduce((sum, r) => sum + r.rating, 0) / data.length) * 10) / 10
        : 0;

        return res.json({
        reviews: data,
        average_rating: averageRating,
        total: data.length,
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message || "Failed to fetch reviews." });
    }
}
