"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const matches_routes_1 = __importDefault(require("./routes/matches.routes"));
const messages_routes_1 = __importDefault(require("./routes/messages.routes"));
const posts_routes_1 = __importDefault(require("./routes/posts.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const reviews_routes_1 = __importDefault(require("./routes/reviews.routes"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.get("/", (_req, res) => {
    res.json({ message: "RoomieKorea API is running!" });
});
exports.app.use("/api/auth", auth_routes_1.default);
exports.app.use("/api/users", profile_routes_1.default);
exports.app.use("/api/posts", posts_routes_1.default);
exports.app.use("/api/matches", matches_routes_1.default);
exports.app.use("/api/messages", messages_routes_1.default);
exports.app.use("/api/reviews", reviews_routes_1.default);
exports.app.use(error_middleware_1.errorHandler);
exports.default = exports.app;
