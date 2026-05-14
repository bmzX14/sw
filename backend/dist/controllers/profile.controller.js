"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProfile = getMyProfile;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
async function getMyProfile(req, res) {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    return res.json(data);
}
