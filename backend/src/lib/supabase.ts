import { createClient } from "@supabase/supabase-js";

// This client is intended for use in client-side code and has limited permissions
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
