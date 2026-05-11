import { createClient } from "@supabase/supabase-js";

// This client has elevated permissions and should only be used in server-side code
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
