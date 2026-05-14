import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

//handles user registration, loging and logout
//use Supase Auth for all authentication

//POST /api/auth/register 
export async function register(req: Request, res: Response) {
    const { name, email, password, university, nationality } = req.body;

    //validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required." });
    }

    try {
        //Create auth user in supabase auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({

            email,
            password,
            email_confirm: true, //auto confirm for now
            user_metadata: {name, university, nationality}
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user  .");

        //Insert user profile in users table
        const { error: dbError } = await supabaseAdmin.from("users").insert({
            id: authData.user.id,
            email,
            name,
            university,
            nationality,
            is_verified: false,
        });

        if (dbError) throw dbError;

        return res.status(201).json({ message: "Account created successfully." });
    }catch (error: any) {
        return res.status(400).json({ message: error.message  || "Registration failed." });
    }
}

//POST /api/auth/login
export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (!data.session) throw new Error("Login failed.");

        return res.json({
            access_token: data.session.access_token,
            user: data.user,
        });
    } catch (error: any) {
        return res.status(401).json({ message: error.message || "Invalid email or password." });
    }
    }
//POST /api/auth/logout 
export async function logout(req: AuthenticatedRequest, res: Response) {
    try{
        const { error } = await supabaseAdmin.auth.signOut();
        if (error) throw error;
        return res.json({ message: "Logged out successfully." });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Logout failed." });    
    }
}