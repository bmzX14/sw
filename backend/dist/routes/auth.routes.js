"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Authentication endpoints: register, login, and logout.
const router = (0, express_1.Router)();
// Create a new account and trigger email verification.
router.post("/register", auth_controller_1.register);
// Exchange email/password for a Supabase session.
router.post("/login", auth_controller_1.login);
// Protected logout endpoint kept for future server-side session handling.
router.post("/logout", auth_middleware_1.requireAuth, auth_controller_1.logout);
exports.default = router;
