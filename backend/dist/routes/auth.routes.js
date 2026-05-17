"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
//handles user registration, loging and logout
const router = (0, express_1.Router)();
//Register  new user
router.post("/register", auth_controller_1.register);
//Login user and return JWT token
router.post("/login", auth_controller_1.login);
//Logout user (requires auth)
router.post("/logout", auth_middleware_1.requireAuth, auth_controller_1.logout);
exports.default = router;
