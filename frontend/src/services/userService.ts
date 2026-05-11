import { supabase } from "../lib/supabase";
import type { CreateUserProfileInput } from "../types/user";

export async function createUserProfile(input: CreateUserProfileInput) {
  const { error } = await supabase.from("users").insert(input);

  if (error) {
    throw error;
  }
}