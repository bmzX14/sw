"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posts_controller_1 = require("../controllers/posts.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
//Handles all post CRUD operations
//Browse is public , create/edit/delete require auth
const router = (0, express_1.Router)();
//Get All Active posts ( public - no auth needed for browsing )
router.get("/", posts_controller_1.getAllPosts);
//get a single owned post for editing, including private fields
router.get("/:id/edit", auth_middleware_1.requireAuth, posts_controller_1.getPostForEdit);
//get a single post by id (public)
router.get("/:id", posts_controller_1.getPostById);
//create a new post (requires auth)
router.post("/", auth_middleware_1.requireAuth, posts_controller_1.createPost);
//update a post ( requires auth and only owner can update)
router.put("/:id", auth_middleware_1.requireAuth, posts_controller_1.updatePost);
//delete a post ( requires auth and only owner can delete)
router.delete("/:id", auth_middleware_1.requireAuth, posts_controller_1.deletePost);
exports.default = router;
