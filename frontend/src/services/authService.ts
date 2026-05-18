import axios from "axios";
import { API } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { RegisterForm, LoginForm } from "../types/user";


// Function to handle user registration
export async function registerUser(form: RegisterForm) {
  const { data } = await axios.post(`${API}/auth/register`, {
    name: form.name,
    email: form.email,
    password: form.password,
    university: form.university,
    nationality: form.nationality,
  });

  if (!data.user) {
    throw new Error("Signup failed.");
  }

  return data.user;
}

// Function to handle user login
export async function loginUser(form: LoginForm) {
  const { data } = await axios.post(`${API}/auth/login`, {
    email: form.email,
    password: form.password,
  });

  if (!data.access_token || !data.refresh_token || !data.user) {
    throw new Error("Login failed.");
  }

  await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data.user;
}

// Function to handle user logout
export async function logoutUser() {
  await supabase.auth.signOut();

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}
