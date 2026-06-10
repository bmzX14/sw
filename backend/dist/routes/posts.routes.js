"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posts_controller_1 = require("../controllers/posts.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Post browsing is public; mutating post data requires authentication.
const router = (0, express_1.Router)();
// List active public posts for browse pages.
router.get("/", posts_controller_1.getAllPosts);
// List posts created by the authenticated user for management pages.
router.get("/mine", auth_middleware_1.requireAuth, posts_controller_1.getMyPosts);
// Fetch the owner's editable post payload, including private fields.
router.get("/:id/edit", auth_middleware_1.requireAuth, posts_controller_1.getPostForEdit);
// Fetch a single post, with address visibility decided by backend rules.
router.get("/:id", posts_controller_1.getPostById);
// Create a new post for the current user.
router.post("/", auth_middleware_1.requireAuth, posts_controller_1.createPost);
// Update an existing post owned by the current user.
router.put("/:id", auth_middleware_1.requireAuth, posts_controller_1.updatePost);
// Update only the status of an existing post owned by the current user.
router.patch("/:id/status", auth_middleware_1.requireAuth, posts_controller_1.updatePostStatus);
// Delete an existing post owned by the current user.
router.delete("/:id", auth_middleware_1.requireAuth, posts_controller_1.deletePost);
exports.default = router;
