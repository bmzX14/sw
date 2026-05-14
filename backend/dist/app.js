"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
// Security middleware
exports.app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable CSP for development; configure properly for production
}));
exports.app.use((0, morgan_1.default)("dev"));
exports.app.use(express_1.default.json());
//end points check server for testing
exports.app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
// Root endpoint for basic check
exports.app.get("/", (_req, res) => {
    res.send("Backend is running");
});
// API routes
exports.app.use("/api/profile", profile_routes_1.default);
exports.app.use("/api/posts", post_routes_1.default);
exports.app.use("/api/matches", match_routes_1.default);
exports.app.use("/api/messages", message_routes_1.default);
exports.app.use(error_middleware_1.errorHandler);
