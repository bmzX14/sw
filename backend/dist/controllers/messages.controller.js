"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
exports.deleteMessage = deleteMessage;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
// Messaging controller for accepted-match conversations.
// Return all messages for an accepted match that includes the current user.
async function getMessages(req, res) {
    const userId = req.user.id;
    const { matchId } = req.params;
    try {
        // Security: verify user is part of this match
        const { data: match, error: matchError } = await supabaseAdmin_1.supabaseAdmin
            .from("matches")
            .select("id, requester_id, owner_id, status")
            .eq("id", matchId)
            .eq("status", "accepted")
            .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
            .maybeSingle();
        if (matchError || !match) {
            return res.status(403).json({ message: "Not authorized to view these messages." });
        }
        // Fetch all messages for this match
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .select(`
            id, match_id, sender_id, content, created_at,
            users!sender_id ( name, profile_photo )
        `)
            .eq("match_id", matchId)
            .order("created_at", { ascending: true });
        if (error)
            throw error;
        return res.json(data);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Failed to fetch messages." });
    }
}
// Send a new message into an accepted match.
async function sendMessage(req, res) {
    const userId = req.user.id;
    const { matchId } = req.params;
    const { content } = req.body;
    // Validate message content
    if (!content?.trim()) {
        return res.status(400).json({ message: "Message content cannot be empty." });
    }
    try {
        // Security: verify user is part of this match and it's accepted
        const { data: match, error: matchError } = await supabaseAdmin_1.supabaseAdmin
            .from("matches")
            .select("id, status")
            .eq("id", matchId)
            .eq("status", "accepted") // Can only chat in accepted matches
            .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
            .maybeSingle();
        if (matchError || !match) {
            return res.status(403).json({ message: "Not authorized to send messages in this match." });
        }
        // Insert the message
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .insert({
            match_id: matchId,
            sender_id: userId,
            content: content.trim(),
        })
            .select()
            .single();
        if (error)
            throw error;
        // Supabase Realtime will automatically push this to subscribers
        return res.status(201).json(data);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Failed to send message." });
    }
}
// Delete one of the current user's own messages from an accepted match.
async function deleteMessage(req, res) {
    const userId = req.user.id;
    const { messageId } = req.params;
    try {
        const { data: message, error: messageError } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .select("id, match_id, sender_id")
            .eq("id", messageId)
            .maybeSingle();
        if (messageError)
            throw messageError;
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }
        const { data: match, error: matchError } = await supabaseAdmin_1.supabaseAdmin
            .from("matches")
            .select("id, requester_id, owner_id, status")
            .eq("id", message.match_id)
            .eq("status", "accepted")
            .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
            .maybeSingle();
        if (matchError || !match) {
            return res.status(403).json({ message: "Not authorized to delete this message." });
        }
        if (message.sender_id !== userId) {
            return res.status(403).json({ message: "You can only delete your own messages." });
        }
        const { error: deleteError } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .delete()
            .eq("id", messageId);
        if (deleteError)
            throw deleteError;
        return res.status(204).send();
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Failed to delete message." });
    }
}
