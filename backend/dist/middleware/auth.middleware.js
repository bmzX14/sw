"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing or invalid token." });
        }
        const token = authHeader.replace("Bearer ", "").trim();
        const { data: { user }, error, } = await supabaseAdmin_1.supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        req.user = {
            id: user.id,
            email: user.email,
        };
        next();
    }
    catch {
        return res.status(500).json({ message: "Authentication check failed." });
    }
}
