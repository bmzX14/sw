"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const messages_controller_1 = require("./controllers/messages.controller");
const supabaseAdmin_1 = require("./lib/supabaseAdmin");
const auth_middleware_1 = require("./middleware/auth.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const matches_routes_1 = __importDefault(require("./routes/matches.routes"));
const messages_routes_1 = __importDefault(require("./routes/messages.routes"));
const posts_routes_1 = __importDefault(require("./routes/posts.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const reviews_routes_1 = __importDefault(require("./routes/reviews.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
const localOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
];
function isAllowedOrigin(origin) {
    if (!origin)
        return true;
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (localOrigins.includes(normalizedOrigin)) {
        return true;
    }
    if (frontendUrl && normalizedOrigin === frontendUrl) {
        return true;
    }
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)) {
        return true;
    }
    return false;
}
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ── Routes ──
app.get("/", (req, res) => {
    res.json({ message: "RoomieKorea API is running! 🏠" });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", profile_routes_1.default);
app.use("/api/posts", posts_routes_1.default);
app.use("/api/matches", matches_routes_1.default);
// app.use("/api/messages", messagesRoutes);
app.delete("/api/messages/:messageId", auth_middleware_1.requireAuth, (req, res, next) => {
    console.log("🔴 Direct DELETE hit!", req.params.messageId);
    next();
}, messages_controller_1.unsendMessage);
app.use("/api/messages", messages_routes_1.default);
console.log("Messages routes registered");
app.patch("/api/messages/:matchId/read", auth_middleware_1.requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { matchId } = req.params;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("match_id", matchId)
        .neq("sender_id", userId) // only mark opponent's messages as read
        .is("read_at", null)
        .select("id");
    if (error)
        return res.status(500).json({ message: error.message });
    return res.json({
        messageIds: data.map((m) => m.id),
        readAt: new Date().toISOString()
    });
});
app.patch("/api/messages/:messageId/reaction", auth_middleware_1.requireAuth, async (req, res) => {
    const { messageId } = req.params;
    const { reaction } = req.body;
    const userId = req.user.id;
    try {
        // Verify the message exists and user is part of the match
        const { data: message, error: msgError } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .select("id, sender_id, match_id")
            .eq("id", messageId)
            .maybeSingle();
        if (msgError || !message) {
            return res.status(404).json({ message: "Message not found." });
        }
        // Update reaction in DB
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from("messages")
            .update({ reaction: reaction || null })
            .eq("id", messageId)
            .select()
            .single();
        if (error)
            throw error;
        return res.json(data);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});
app.use("/api/reviews", reviews_routes_1.default);
app.use(error_middleware_1.errorHandler);
