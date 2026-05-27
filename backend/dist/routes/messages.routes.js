"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messages_controller_1 = require("../controllers/messages.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Messaging endpoints for users inside accepted matches.
const router = (0, express_1.Router)();
// Read all messages in one accepted match.
router.get("/:matchId", auth_middleware_1.requireAuth, messages_controller_1.getMessages);
// Send a new message into one accepted match.
router.post("/:matchId", auth_middleware_1.requireAuth, messages_controller_1.sendMessage);
// Mark all unread incoming messages in one accepted match as read.
router.patch("/:matchId/read", auth_middleware_1.requireAuth, messages_controller_1.markMessagesAsRead);
// Toggle the supported reaction on one message.
router.patch("/:messageId/reaction", auth_middleware_1.requireAuth, messages_controller_1.updateMessageReaction);
// Delete/unsend one of the current user's own messages.
router.delete("/:messageId", auth_middleware_1.requireAuth, messages_controller_1.unsendMessage);
exports.default = router;
