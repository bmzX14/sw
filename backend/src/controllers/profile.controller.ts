import { Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

function isBlank(value: string | null | undefined) {
  return !value || !value.trim();
}

// Controller function to get the current user's profile
export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const metadata = req.user?.metadata ?? {};

  const baseProfile = {
    id: userId,
    email: req.user?.email ?? "",
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

  const { data: existingProfile, error: selectError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (selectError) {
    return res.status(400).json({ message: selectError.message });
  }

  if (!existingProfile) {
    const { data: createdProfile, error: createError } = await supabaseAdmin
      .from("users")
      .upsert(baseProfile, { onConflict: "id" })
      .select("*")
      .single();

    if (createError) {
      return res.status(400).json({ message: createError.message });
    }

    return res.json(createdProfile);
  }

  const hydratedProfile = {
    ...baseProfile,
    ...existingProfile,
    email: isBlank(existingProfile.email) ? baseProfile.email : existingProfile.email,
    name: isBlank(existingProfile.name) ? baseProfile.name : existingProfile.name,
    university: isBlank(existingProfile.university)
      ? baseProfile.university
      : existingProfile.university,
    nationality: isBlank(existingProfile.nationality)
      ? baseProfile.nationality
      : existingProfile.nationality,
  };

  const needsHydration =
    hydratedProfile.email !== existingProfile.email ||
    hydratedProfile.name !== existingProfile.name ||
    hydratedProfile.university !== existingProfile.university ||
    hydratedProfile.nationality !== existingProfile.nationality;

  if (!needsHydration) {
    return res.json(existingProfile);
  }

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from("users")
    .upsert(hydratedProfile, { onConflict: "id" })
    .select("*")
    .single();

  if (updateError) {
    return res.status(400).json({ message: updateError.message });
  }

  return res.json(updatedProfile);
}

// Controller function to update the current user's profile
export async function updateMyProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;

  const {
    name,
    university,
    nationality,
    budget_min,
    budget_max,
    lifestyle_tags,
    language_spoken,
    profile_photo,
    student_id_doc,
    is_verified,
  } = req.body;

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({
      name,
      university,
      nationality,
      budget_min,
      budget_max,
      lifestyle_tags,
      language_spoken,
      profile_photo,
      student_id_doc,
      is_verified,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.json(data);
}