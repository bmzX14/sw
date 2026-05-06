import { supabase } from "../lib/supabase";
import type { RegisterForm, LoginForm } from "../types/user";
import { createUserProfile } from "./userService";


// Function to handle user registration
export async function registerUser(form: RegisterForm) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
  });

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error("Signup failed.");
  }

  await createUserProfile({
    id: authData.user.id,
    email: form.email,
    name: form.name,
    university: form.university,
    nationality: form.nationality,
    student_id_doc: null,
    is_verified: false,
  });

  return authData.user;
}

// Function to handle user login
export async function loginUser(form: LoginForm) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  });

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error("Login failed.");
  }

  localStorage.setItem("access_token", data.session.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data.user;
}

// Function to handle user logout
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}