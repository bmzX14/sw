"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
const supabase_1 = require("../lib/supabase");
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
//handles user registration, loging and logout
//use Supase Auth for all authentication
//POST /api/auth/register 
async function register(req, res) {
    const { name, email, password, university, nationality } = req.body;
    //validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required." });
    }
    try {
        // Create auth user through normal Supabase sign-up so email verification is sent.
        const { data: authData, error: authError } = await supabase_1.supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`,
                data: { name, university, nationality },
            },
        });
        if (authError)
            throw authError;
        if (!authData.user)
            throw new Error("Failed to create user  .");
        // Insert the app profile row through the service client.
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
        if (dbError)
            throw dbError;
        return res.status(201).json({
            message: "Account created successfully. Please confirm your email before logging in.",
            user: authData.user,
        });
    }
    catch (error) {
        return res.status(400).json({ message: error.message || "Registration failed." });
    }
}
//POST /api/auth/login
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    try {
        const { data, error } = await supabaseAdmin_1.supabaseAdmin.auth.signInWithPassword({
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
//POST /api/auth/logout 
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
