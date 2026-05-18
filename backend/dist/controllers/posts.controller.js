"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPosts = getAllPosts;
exports.getPostById = getPostById;
exports.getPostForEdit = getPostForEdit;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
//handles all post CRUD operations
// full address is hidden until match is accepted
//GET /api/posts
//get all active post with optional filters
async function getAllPosts(req, res) {
    const { type, district, minRent, maxRent, gender } = req.query;
    try {
        let query = supabaseAdmin_1.supabaseAdmin
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
        if (type)
            query = query.eq("post_type", type);
        if (district)
            query = query.eq("district", district);
        if (minRent)
            query = query.gte("monthly_rent", Number(minRent));
        if (maxRent)
            query = query.lte("monthly_rent", Number(maxRent));
        if (gender)
            query = query.eq("gender_preference", gender);
        const { data, error } = await query;
        if (error)
            throw error;
        //never return full_address in browse - only district
        return res.json(data);
    }
    catch (error) {
        return res.status(400).json({ message: error.message || "Failed to fetch posts." });
    }
}
//GET /api/posts/:id
//Get a single post - hide full address unless matched
async function getPostById(req, res) {
    const { id } = req.params;
    try {
        const { data: post, error } = await supabaseAdmin_1.supabaseAdmin
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
        //hide full address by default
        const { full_address, ...safePost } = post;
        return res.json(safePost);
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to fetch post." });
    }
}
//GET /api/posts/:id/edit
//Get a post for editing - only the owner can read private fields
async function getPostForEdit(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("posts")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();
        if (error || !data) {
            return res.status(404).json({ message: "Post not found or not authorized." });
        }
        return res.json(data);
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to fetch post for editing." });
    }
}
// POST /api/posts
//create a new post( auth required)
async function createPost(req, res) {
    const userId = req.user.id;
    const { post_type, district, full_address, near_university, monthly_rent, deposit, deposit_negotiable, room_type, furnished, available_from, available_until, gender_preference, lifestyle_tags, description_en, description_ko, photos, } = req.body;
    //validate required fields
    if (!post_type || !district || !monthly_rent) {
        return res.status(400).json({
            message: "Post type, district and monthly rent are required."
        });
    }
    try {
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
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
        })
            .select("*")
            .single();
        if (error) {
            if (error.message?.includes("row-level security")) {
                const message = supabaseAdmin_1.supabaseServiceRole === "service_role"
                    ? "Post creation is blocked by Supabase RLS. Add an insert policy for posts or check if FORCE RLS is enabled."
                    : "Post creation is blocked by Supabase RLS because backend SUPABASE_SERVICE_ROLE_KEY is not a service_role key. Replace it with the Supabase service_role secret key in backend/.env.";
                return res.status(500).json({ message });
            }
            throw error;
        }
        return res.status(201).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to create post." });
    }
}
//PUT /api/posts/:id
//update a post - only owner can update
async function updatePost(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const { post_type, district, full_address, near_university, monthly_rent, deposit, deposit_negotiable, room_type, furnished, available_from, available_until, gender_preference, lifestyle_tags, description_en, description_ko, photos, status, } = req.body;
    try {
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
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
        })
            .eq("id", id)
            .eq("user_id", userId) // ensure only owner can update
            .select("*")
            .single();
        if (error || !data) {
            return res.status(404).json({ message: "Post not found or not authorized." });
        }
        return res.json(data);
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to update post." });
    }
}
//DELETE /api/posts/:id
//delete a post - only owner can delete
async function deletePost(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
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
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to delete post." });
    }
}
