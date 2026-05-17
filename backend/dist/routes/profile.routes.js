"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
//Handles getting and updating user profiles
//all routes require authentication
const router = (0, express_1.Router)();
//get current user's profile
router.get("/profile", auth_middleware_1.requireAuth, profile_controller_1.getMyProfile);
//update current user's profile
router.put("/profile", auth_middleware_1.requireAuth, profile_controller_1.updateMyProfile);
exports.default = router;
