"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messages_controller_1 = require("../controllers/messages.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Handles chat messages between matched users
// All routes require authentication
const router = (0, express_1.Router)();
// Get all messages for a specific match
router.get("/:matchId", auth_middleware_1.requireAuth, messages_controller_1.getMessages);
// Send a new message to a match
router.post("/:matchId", auth_middleware_1.requireAuth, messages_controller_1.sendMessage);
exports.default = router;
