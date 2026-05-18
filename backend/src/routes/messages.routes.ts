import { Router } from "express";
import {
  deleteMessage,
  getMessages,
  sendMessage,
} from "../controllers/messages.controller";
import { requireAuth } from "../middleware/auth.middleware";

// Messaging endpoints for users inside accepted matches.

const router = Router();

// Read all messages in one accepted match.
router.get("/:matchId", requireAuth, getMessages);

// Send a new message into one accepted match.
router.post("/:matchId", requireAuth, sendMessage);

// Delete one of the current user's own messages.
router.delete("/:messageId", requireAuth, deleteMessage);

export default router;
