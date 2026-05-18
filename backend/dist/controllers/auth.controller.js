"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
const supabase_1 = require("../lib/supabase");
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
// Authentication controller for signup, login, and logout flows.
// Create a new Supabase auth user and the matching app profile row.
async function register(req, res) {
    const { name, email, password, university, nationality } = req.body;
    const supabase = (0, supabase_1.createSupabaseAuthClient)();
    //validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required." });
    }
    try {
        // Use the anon auth client so Supabase can send the verification email.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`,
                data: { name, university, nationality },
            },
        });
        if (authError) {
            if (authError.message?.toLowerCase().includes("already registered")) {
                return res.status(400).json({ message: "This email is already registered. Please login or use another email." });
            }
            throw authError;
        }
        if (!authData.user)
            throw new Error("Failed to create user  .");
        // Store app-specific profile data in the users table.
        const { error: dbError } = await supabaseAdmin_1.supabaseAdmin.from("users").upsert({
            id: authData.user.id,
            email,
            name,
            university,
            nationality,
            is_verified: false,
            lifestyle_tags: [],
            language_spoken: [],
        }, {
            onConflict: "id",
        });
        if (dbError) {
            if (dbError.code === "23505") {
                return res.status(400).json({ message: "This email is already registered. Please login or use another email." });
            }
            throw dbError;
        }
        return res.status(201).json({
            message: "Account created successfully. Please confirm your email before logging in.",
            user: authData.user,
        });
    }
    catch (error) {
        return res.status(400).json({ message: error.message || "Registration failed." });
    }
}
// Authenticate a user and return tokens for the frontend session.
async function login(req, res) {
    const { email, password } = req.body;
    const supabase = (0, supabase_1.createSupabaseAuthClient)();
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error)
            throw error;
        if (!data.session)
            throw new Error("Login failed.");
        return res.json({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        });
    }
    catch (error) {
        return res.status(401).json({ message: error.message || "Invalid email or password." });
    }
}
// Placeholder logout endpoint. Frontend currently signs out directly with Supabase.
async function logout(req, res) {
    try {
        const { error } = await supabaseAdmin_1.supabaseAdmin.auth.signOut();
        if (error)
            throw error;
        return res.json({ message: "Logged out successfully." });
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Logout failed." });
    }
}
