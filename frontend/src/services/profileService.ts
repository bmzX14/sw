import { supabase } from "../lib/supabase";
import type { UpdateUserProfileInput, UserProfile } from "../types/user";

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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    return null;
  }

  const { data: existingProfile, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingProfile) {
    return existingProfile as UserProfile;
  }

  const metadata = user.user_metadata || {};

  const newProfile = {
    id: user.id,
    email: user.email ?? "",
    name: metadata.name ?? "",
    university: metadata.university ?? "",
    nationality: metadata.nationality ?? "",
    budget_min: null,
    budget_max: null,
    profile_photo: null,
    student_id_doc: null,
    is_verified: false,
    lifestyle_tags: [],
    language_spoken: [],
  };

  const { data: createdProfile, error: upsertError } = await supabase
    .from("users")
    .upsert(newProfile, { onConflict: "id" })
    .select("*")
    .single();

  if (upsertError) {
    throw upsertError;
  }

  return createdProfile as UserProfile;
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
  const { id, ...updateData } = input;

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

