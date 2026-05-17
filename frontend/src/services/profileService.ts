import axios from "axios";
import { API } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { UpdateUserProfileInput, UserProfile } from "../types/user";

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please login again.");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

// Function to get an empty profile object
export function getEmptyProfile(): UserProfile {
  return {
    id: "",
    name: "",
    email: "",
    university: "",
    nationality: "",
    budget_min: null,
    budget_max: null,
    profile_photo: null,
    student_id_doc: null,
    is_verified: false,
    lifestyle_tags: [],
    language_spoken: [],
  };
}


// Function to get the current user's profile
export async function getCurrentUserProfile() {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(`${API}/users/profile`, { headers });
  return data as UserProfile;
}


// Function to update user profile photo
export async function uploadProfilePhoto(userId: string, file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}.${fileExt}`;

  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, file, { 
        upsert: true, // Overwrite existing file if it exists
        contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("profile-photos") // Use the correct storage bucket name
    .getPublicUrl(fileName); // Get the public URL of the uploaded photo

  return `${data.publicUrl}?t=${Date.now()}`;  // return the public URL with a timestamp to prevent caching issues
}


// Function to upload student ID document
export async function uploadStudentIdCard(userId: string, file: File) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Student ID must be an image or PDF file.");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Student ID file must be less than 2MB.");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `student-ids/${userId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("student-id-docs")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return fileName;
}

// Function to update user profile
export async function updateUserProfile(input: UpdateUserProfileInput) {
  const { id: _id, ...updateData } = input;
  const headers = await getAuthHeaders();
  const { data } = await axios.put(`${API}/users/profile`, updateData, { headers });
  return data as UserProfile;
}

