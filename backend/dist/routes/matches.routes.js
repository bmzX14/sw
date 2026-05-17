"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matches_controller_1 = require("../controllers/matches.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
//All routes related to matching between users
//All routes require authetication
const router = (0, express_1.Router)();
//send a match request to a post
router.post("/request", auth_middleware_1.requireAuth, matches_controller_1.requestMatch);
//accept a match request ( post owner only)
router.put("/:id/accept", auth_middleware_1.requireAuth, matches_controller_1.acceptMatch);
//decline a match request (post owner only)
router.put("/:id/decline", auth_middleware_1.requireAuth, matches_controller_1.declineMatch);
//cancel a match request ( requester only)
router.put("/:id/cancel", auth_middleware_1.requireAuth, matches_controller_1.cancelMatch);
//get all incoming match requests (where i am the post owner)
router.get("/incoming", auth_middleware_1.requireAuth, matches_controller_1.getIncomingMatches);
//get all outgoing match requests (where i am the requester)
router.get("/outgoing", auth_middleware_1.requireAuth, matches_controller_1.getOutgoingMatches);
//get all accepted matches ( for chat access)
router.get("/accepted", auth_middleware_1.requireAuth, matches_controller_1.getAcceptedMatches);
exports.default = router;
