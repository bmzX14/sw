import { Router } from "express";
import {
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    getPostForEdit,
    updatePost,
} from "../controllers/posts.controller";
import { requireAuth } from "../middleware/auth.middleware";

// Post browsing is public; mutating post data requires authentication.

const router = Router();

// List active public posts for browse pages.
router.get("/", getAllPosts);

// Fetch the owner's editable post payload, including private fields.
router.get("/:id/edit", requireAuth, getPostForEdit);

// Fetch a single post, with address visibility decided by backend rules.
router.get("/:id", getPostById);

// Create a new post for the current user.
router.post("/", requireAuth, createPost);

// Update an existing post owned by the current user.
router.put("/:id", requireAuth, updatePost);

// Delete an existing post owned by the current user.
router.delete("/:id", requireAuth, deletePost);

export default router;
