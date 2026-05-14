import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();



// Creates a Supabase client with the SERVICE ROLE KEY
// This bypasses RLS and has full database access
// NEVER use this key in the frontend!


const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
    autoRefreshToken: false,
    persistSession: false,
},
});