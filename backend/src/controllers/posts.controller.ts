import { Request, Response } from "express";
import { supabaseAdmin, supabaseServiceRole } from "../lib/supabaseAdmin";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// Post controller for browse, detail, create, update, and delete flows.

function toOptionalNumber(value: unknown) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : NaN;
}

function validatePostPayload(payload: {
    post_type?: unknown;
    district?: unknown;
    monthly_rent?: unknown;
    deposit?: unknown;
    available_from?: unknown;
    available_until?: unknown;
    description_en?: unknown;
    latitude?: unknown;
    longitude?: unknown;
}) {
    const monthlyRent = toOptionalNumber(payload.monthly_rent);
    const deposit = toOptionalNumber(payload.deposit);
    const latitude = toOptionalNumber(payload.latitude);
    const longitude = toOptionalNumber(payload.longitude);
    const availableFrom = typeof payload.available_from === "string" ? payload.available_from.trim() : "";
    const availableUntil = typeof payload.available_until === "string" ? payload.available_until.trim() : "";
    const descriptionEn = typeof payload.description_en === "string" ? payload.description_en.trim() : "";

    if (!payload.post_type || !payload.district) {
        return "Post type and district are required.";
    }

    if (monthlyRent === null || Number.isNaN(monthlyRent) || monthlyRent < 0) {
        return "Monthly rent must be a valid non-negative number.";
    }

    if (deposit !== null && (Number.isNaN(deposit) || deposit < 0)) {
        return "Deposit must be a valid non-negative number.";
    }

    if (!availableFrom) {
        return "Move-in date is required.";
    }

    if (!descriptionEn) {
        return "English description is required.";
    }

    if (availableUntil && new Date(availableUntil) < new Date(availableFrom)) {
        return "Move-out date must be on or after the move-in date.";
    }

    const hasLatitude = latitude !== null;
    const hasLongitude = longitude !== null;

    if (hasLatitude !== hasLongitude) {
        return "Latitude and longitude must be provided together.";
    }

    if (hasLatitude && (Number.isNaN(latitude) || Number.isNaN(longitude))) {
        return "Location coordinates must be valid numbers.";
    }

    return null;
}

// Return public active posts for the browse page.
export async function getAllPosts(req: Request, res: Response) {
    const { type, district, minRent, maxRent, gender } = req.query;

    try{
        let query = supabaseAdmin
            .from("posts")
            .select(`
                id,
                user_id,
                post_type,
                district,
                monthly_rent,
                deposit,
                available_from,
                gender_preference,
                lifestyle_tags,
                description_en,
                description_ko,
                photos,
                status,
                near_university,
                created_at,
                latitude,
                longitude,
                users (
                    id,
                    name,
                    university,
                    is_verified,
                    profile_photo,
                    nationality
                    )
                `)
            .eq("status", "active")
            .order("created_at", { ascending: false });

        //Apply filters if provided
        if (type)  query = query.eq("post_type", type as string);
        if (district) query = query.eq("district", district as string);
        if (minRent) query = query.gte("monthly_rent", Number(minRent));
        if (maxRent) query = query.lte("monthly_rent", Number(maxRent));
        if (gender) query = query.eq("gender_preference", gender as string);

        const { data, error} = await query;
    
        if (error) throw error;

        //never return full_address in browse - only district
        return res.json(data);
    }catch (error: any) {
        return res.status(400).json({ message: error.message || "Failed to fetch posts." });
        }
    }

// Return all posts created by the authenticated user for management views.
export async function getMyPosts(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;

    try {
        const { data, error } = await supabaseAdmin
            .from("posts")
            .select(`
                id,
                user_id,
                post_type,
                district,
                full_address,
                monthly_rent,
                deposit,
                available_from,
                available_until,
                gender_preference,
                lifestyle_tags,
                description_en,
                description_ko,
                photos,
                status,
                near_university,
                room_type,
                created_at,
                latitude,
                longitude,
                users (
                    id,
                    name,
                    university,
                    is_verified,
                    profile_photo,
                    nationality
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return res.json(data);
    } catch (error: any) {
        return res.status(400).json({ message: error.message || "Failed to fetch your posts." });
    }
}

// Return one post and reveal the full address only to authorized viewers.
export async function getPostById(req: Request, res: Response) {
    const { id } = req.params;

    try{
        const { data: post, error} = await supabaseAdmin
            .from("posts")
            .select(`
                *,
                users(
                    id, 
                    name, 
                    university , 
                    is_verified,
                    profile_photo, 
                    nationality, 
                    lifestyle_tags
                )
            `)
            .eq("id", id)
            .single();

        if (error || !post) {
            return res.status(404).json({ message: "Post not found." });
        }

        let canViewFullAddress = false;
        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.replace("Bearer ", "").trim();
            const {
                data: { user },
                error: authError,
            } = await supabaseAdmin.auth.getUser(token);

            if (!authError && user) {
                if (user.id === post.user_id) {
                    canViewFullAddress = true;
                } else {
                    const { data: acceptedMatch, error: matchError } = await supabaseAdmin
                        .from("matches")
                        .select("id")
                        .eq("post_id", id)
                        .eq("owner_id", post.user_id)
                        .eq("requester_id", user.id)
                        .eq("status", "accepted")
                        .maybeSingle();

                    if (!matchError && acceptedMatch) {
                        canViewFullAddress = true;
                    }
                }
            }
        }

        if (canViewFullAddress) {
            return res.json(post);
        }

        //hide full address by default
        const { full_address, ...safePost } = post;

        return res.json(safePost);
    }catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to fetch post." });
    }
}

// Return the editable version of a post for its owner only.
export async function getPostForEdit(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("posts")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (error || !data) {
            return res.status(404).json({ message: "Post not found or not authorized." });
        }

        return res.json(data);
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to fetch post for editing." });
    }
}

// Update only the status of a post owned by the authenticated user.
export async function updatePostStatus(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "active" && status !== "closed") {
        return res.status(400).json({ message: "Status must be either active or closed." });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("posts")
            .update({ status })
            .eq("id", id)
            .eq("user_id", userId)
            .select("id, status")
            .single();

        if (error || !data) {
            return res.status(404).json({ message: "Post not found or not authorized." });
        }

        return res.json(data);
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to update post status." });
    }
}

// Create a new post owned by the authenticated user.
export async function createPost(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const {
        post_type, 
        district, 
        full_address, 
        near_university,
        monthly_rent, 
        deposit, 
        deposit_negotiable, 
        room_type,
        furnished, 
        available_from, 
        available_until,
        gender_preference, 
        lifestyle_tags, 
        description_en, 
        description_ko, 
        photos,
        latitude,
        longitude,
    } = req.body;

    const validationError = validatePostPayload({
        post_type,
        district,
        monthly_rent,
        deposit,
        available_from,
        available_until,
        description_en,
        latitude,
        longitude,
    });

    if (validationError) {
        return res.status(400).json({
            message: validationError,
        });
    }
    try{
        const { data, error } = await supabaseAdmin
            .from("posts")
            .insert({
                user_id: userId,
                post_type, 
                district, 
                full_address,
                near_university,
                monthly_rent, 
                deposit, 
                deposit_negotiable, 
                room_type,
                furnished, 
                available_from, 
                available_until,
                gender_preference, 
                lifestyle_tags, 
                description_en, 
                description_ko, 
                photos,
                status: "active",
                latitude,
                longitude,
            })
            .select("*")
            .single();

        if (error) {
            if (error.message?.includes("row-level security")) {
                const message = supabaseServiceRole === "service_role"
                    ? "Post creation is blocked by Supabase RLS. Add an insert policy for posts or check if FORCE RLS is enabled."
                    : "Post creation is blocked by Supabase RLS because backend SUPABASE_SERVICE_ROLE_KEY is not a service_role key. Replace it with the Supabase service_role secret key in backend/.env.";

                return res.status(500).json({ message });
            }

            throw error;
        }

        return res.status(201).json(data);
        }catch (error: any) {
            return res.status(500).json({ message: error.message || "Failed to create post." });
        }
    }

// Update a post owned by the authenticated user.
export async function updatePost(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;
    const {
        post_type,
        district,
        full_address,
        near_university,
        monthly_rent,
        deposit,
        deposit_negotiable,
        room_type,
        furnished,
        available_from,
        available_until,
        gender_preference,
        lifestyle_tags,
        description_en,
        description_ko,
        photos,
        status,
        latitude,
        longitude,
    } = req.body;

    const validationError = validatePostPayload({
        post_type,
        district,
        monthly_rent,
        deposit,
        available_from,
        available_until,
        description_en,
        latitude,
        longitude,
    });

    if (validationError) {
        return res.status(400).json({ message: validationError });
    }
    
    try{
        const { data, error} = await supabaseAdmin
            .from("posts")
            .update({
                post_type,
                district,
                full_address,
                near_university,
                monthly_rent,
                deposit,
                deposit_negotiable,
                room_type,
                furnished,
                available_from,
                available_until,
                gender_preference,
                lifestyle_tags,
                description_en,
                description_ko,
                photos,
                status,
                latitude,
                longitude,
            })
            .eq("id", id)
            .eq("user_id", userId) // ensure only owner can update
            .select("*")
            .single();

        if (error || !data) {
            return res.status(404).json({ message: "Post not found or not authorized." });
        }

        return res.json(data);
    }catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to update post." });

    }
}

// Delete a post owned by the authenticated user.
export async function deletePost(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    try{
        const { data, error} = await supabaseAdmin
            .from("posts")
            .delete()
            .eq("id", id)
            .eq("user_id", userId) // ensure only owner can delete
            .select("id")
            .single();

        if (error || !data) {
            return res.status(404).json({ message: "Post not found or not authorized." });
        }

        return res.json({ message: "Post deleted successfully." });
    }catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to delete post." });
    } 
}
    
