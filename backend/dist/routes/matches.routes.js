"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matches_controller_1 = require("../controllers/matches.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Match request endpoints between post owners and interested users.
const router = (0, express_1.Router)();
// Send a new interest request for a post.
router.post("/request", auth_middleware_1.requireAuth, matches_controller_1.requestMatch);
// Accept a pending match request as the post owner.
router.put("/:id/accept", auth_middleware_1.requireAuth, matches_controller_1.acceptMatch);
// Decline a pending match request as the post owner.
router.put("/:id/decline", auth_middleware_1.requireAuth, matches_controller_1.declineMatch);
// Cancel a pending request as the original requester.
router.put("/:id/cancel", auth_middleware_1.requireAuth, matches_controller_1.cancelMatch);
// List requests sent to the current user's posts.
router.get("/incoming", auth_middleware_1.requireAuth, matches_controller_1.getIncomingMatches);
// List requests created by the current user.
router.get("/outgoing", auth_middleware_1.requireAuth, matches_controller_1.getOutgoingMatches);
// List accepted matches for chat and review flows.
router.get("/accepted", auth_middleware_1.requireAuth, matches_controller_1.getAcceptedMatches);
exports.default = router;
