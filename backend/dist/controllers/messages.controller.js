"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
exports.markMessagesAsRead = markMessagesAsRead;
exports.updateMessageReaction = updateMessageReaction;
exports.unsendMessage = unsendMessage;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
// Messaging controller for accepted-match conversations.
async function getAuthorizedMatch(matchId, userId) {
    const { data: match, error } = await supabaseAdmin_1.supabaseAdmin
        .from("matches")
        .select("id, requester_id, owner_id, status")
        .eq("id", matchId)
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return match;
}
function getRouteParam(value) {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
async function getAuthorizedMessage(messageId, userId) {
    const { data: message, error } = await supabaseAdmin_1.supabaseAdmin
        .from("messages")
        .select("id, sender_id, match_id, read_at, reaction")
        .eq("id", messageId)
        .maybeSingle();
    if (error) {
        throw error;
    }
    if (!message) {
        return { message: null, match: null };
    }
    const match = await getAuthorizedMatch(message.match_id, userId);
    return { message, match };
}
// GET /api/messages/:matchId
// Get all messages for a specific match
async function getMessages(req, res) {
    const userId = req.user.id;
    const matchId = getRouteParam(req.params.matchId);
    try {
        const match = await getAuthorizedMatch(matchId, userId);
        if (!match) {
            return res
                .status(403)
                .json({ message: "Not authorized to view these messages." });
        }
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .select(`
          id,
          match_id,
          sender_id,
          content,
          created_at,
          read_at,
          reaction,
          users!sender_id ( name, profile_photo )
        `)
            .eq("match_id", matchId)
            .order("created_at", { ascending: true });
        if (error) {
            throw error;
        }
        return res.json(data);
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: err.message || "Failed to fetch messages." });
    }
}
// POST /api/messages/:matchId
// Send a new message to a match
async function sendMessage(req, res) {
    const userId = req.user.id;
    const matchId = getRouteParam(req.params.matchId);
    const { content } = req.body;
    if (!content?.trim()) {
        return res
            .status(400)
            .json({ message: "Message content cannot be empty." });
    }
    try {
        const match = await getAuthorizedMatch(matchId, userId);
        if (!match) {
            return res
                .status(403)
                .json({ message: "Not authorized to send messages in this match." });
        }
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .insert({
            match_id: matchId,
            sender_id: userId,
            content: content.trim(),
        })
            .select("id, match_id, sender_id, content, created_at, read_at, reaction")
            .single();
        if (error) {
            throw error;
        }
        return res.status(201).json(data);
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: err.message || "Failed to send message." });
    }
}
// PATCH /api/messages/:matchId/read
// Mark all unread incoming messages in one conversation as read
async function markMessagesAsRead(req, res) {
    const userId = req.user.id;
    const matchId = getRouteParam(req.params.matchId);
    try {
        const match = await getAuthorizedMatch(matchId, userId);
        if (!match) {
            return res
                .status(403)
                .json({ message: "Not authorized to update these messages." });
        }
        const readAt = new Date().toISOString();
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .update({ read_at: readAt })
            .eq("match_id", matchId)
            .neq("sender_id", userId)
            .is("read_at", null)
            .select("id, match_id, sender_id, read_at");
        if (error) {
            throw error;
        }
        return res.json({
            updatedCount: data.length,
            messageIds: data.map((message) => message.id),
            readAt,
        });
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: err.message || "Failed to mark messages as read." });
    }
}
// PATCH /api/messages/:messageId/reaction
// Toggle the single supported message reaction for a conversation participant
async function updateMessageReaction(req, res) {
    const userId = req.user.id;
    const messageId = getRouteParam(req.params.messageId);
    const rawReaction = req.body?.reaction;
    if (rawReaction !== null &&
        rawReaction !== "" &&
        rawReaction !== undefined &&
        rawReaction !== "👍🏻") {
        return res
            .status(400)
            .json({ message: "Only the thumbs-up reaction is supported." });
    }
    try {
        const { message, match } = await getAuthorizedMessage(messageId, userId);
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }
        if (!match) {
            return res
                .status(403)
                .json({ message: "Not authorized to react to this message." });
        }
        const nextReaction = rawReaction === "👍🏻" ? "👍🏻" : null;
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .update({ reaction: nextReaction })
            .eq("id", messageId)
            .select("id, match_id, sender_id, content, created_at, read_at, reaction")
            .single();
        if (error) {
            throw error;
        }
        return res.json(data);
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: err.message || "Failed to update message reaction." });
    }
}
// DELETE /api/messages/:messageId
// Unsend - delete message from DB for everyone. Only the original sender can unsend.
async function unsendMessage(req, res) {
    const userId = req.user.id;
    const messageId = getRouteParam(req.params.messageId);
    try {
        const { message, match } = await getAuthorizedMessage(messageId, userId);
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }
        if (!match) {
            return res
                .status(403)
                .json({ message: "Not authorized to modify this message." });
        }
        if (message.sender_id !== userId) {
            return res
                .status(403)
                .json({ message: "You can only unsend your own message." });
        }
        const { error: deleteError } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .delete()
            .eq("id", messageId);
        if (deleteError) {
            throw deleteError;
        }
        return res.json({ message: "Message unsent successfully.", id: messageId });
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: err.message || "Failed to unsend message." });
    }
}
