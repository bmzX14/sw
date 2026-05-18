"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
// Verify the bearer token and attach the current user to req.user.
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
        const normalizedEmail = user.email?.trim().toLowerCase() ?? "";
        let appUserId = user.id;
        const { data: userRowById, error: userRowByIdError } = await supabaseAdmin_1.supabaseAdmin
            .from("users")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();
        if (userRowByIdError) {
            return res.status(500).json({ message: "Failed to resolve app user." });
        }
        if (userRowById?.id) {
            appUserId = userRowById.id;
        }
        else if (normalizedEmail) {
            const { data: userRowByEmail, error: userRowByEmailError } = await supabaseAdmin_1.supabaseAdmin
                .from("users")
                .select("id")
                .ilike("email", normalizedEmail)
                .maybeSingle();
            if (userRowByEmailError) {
                return res.status(500).json({ message: "Failed to resolve app user." });
            }
            if (userRowByEmail?.id) {
                appUserId = userRowByEmail.id;
            }
        }
        req.user = {
            id: appUserId,
            authId: user.id,
            email: user.email,
            metadata: user.user_metadata ?? {},
            identities: (user.identities ?? []).map((identity) => ({
                provider: identity.provider,
                identity_data: identity.identity_data &&
                    typeof identity.identity_data === "object" &&
                    !Array.isArray(identity.identity_data)
                    ? identity.identity_data
                    : {},
            })),
        };
        next();
    }
    catch {
        return res.status(500).json({ message: "Authentication check failed." });
    }
}
