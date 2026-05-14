import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messages.controller";
import { requireAuth } from "../middleware/auth.middleware";


// Handles chat messages between matched users
// All routes require authentication


const router = Router();

// Get all messages for a specific match
router.get("/:matchId", requireAuth, getMessages);

// Send a new message to a match
router.post("/:matchId", requireAuth, sendMessage);

export default router;