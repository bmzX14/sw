"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Profile endpoints for reading and updating the current user.
const router = (0, express_1.Router)();
// Return the signed-in user's profile row.
router.get("/profile", auth_middleware_1.requireAuth, profile_controller_1.getMyProfile);
// Update editable profile fields for the signed-in user.
router.put("/profile", auth_middleware_1.requireAuth, profile_controller_1.updateMyProfile);
exports.default = router;
