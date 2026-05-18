import { Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// Profile controller for hydrating and updating the current user's profile.

function isBlank(value: string | null | undefined) {
    return !value || !value.trim();
    }

function pickFirstText(...values: unknown[]) {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return "";
}

function buildFallbackName(email: string) {
    const localPart = email.split("@")[0]?.trim();

    if (!localPart) {
        return "Roomies User";
    }

    const normalized = localPart.replace(/[._-]+/g, " ").trim();

    if (!normalized) {
        return "Roomies User";
    }

    return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

    // Return the current profile, creating a baseline row when needed.
    export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const metadata = req.user?.metadata ?? {};
    const emailFromAuth =
        pickFirstText(
            req.user?.email,
            metadata.email,
        );

    const socialIdentity = req.user?.identities?.find((identity) =>
        identity.provider === "google" || identity.provider === "kakao"
    );
    const identityData = socialIdentity?.identity_data ?? {};

    const nameFromAuth =
        pickFirstText(
            identityData.full_name,
            identityData.name,
            identityData.display_name,
            identityData.nickname,
            metadata.full_name,
            metadata.name,
            metadata.user_name,
            metadata.nickname,
        ) || buildFallbackName(emailFromAuth);

    const avatarFromAuth =
        pickFirstText(
            identityData.avatar_url,
            identityData.picture,
            identityData.profile_image,
            identityData.profile_image_url,
            identityData.thumbnail_image_url,
            identityData.photo_url,
            metadata.avatar_url,
            metadata.picture,
            metadata.profile_image,
            metadata.profile_image_url,
            metadata.thumbnail_image_url,
            metadata.photo_url,
        ) || null;

    const baseProfile = {
        id: userId,
        email: emailFromAuth,
        name: nameFromAuth,
        university: metadata.university ?? "",
        nationality: metadata.nationality ?? "",
        budget_min: null,
        budget_max: null,
        profile_photo: avatarFromAuth,
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
        profile_photo: isBlank(existingProfile.profile_photo)
        ? baseProfile.profile_photo
        : existingProfile.profile_photo,
    };

    const needsHydration =
        hydratedProfile.email !== existingProfile.email ||
        hydratedProfile.name !== existingProfile.name ||
        hydratedProfile.university !== existingProfile.university ||
        hydratedProfile.nationality !== existingProfile.nationality ||
        hydratedProfile.profile_photo !== existingProfile.profile_photo;

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

// Update editable profile fields for the current user.
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

    const { data: existingProfile, error: selectError } = await supabaseAdmin
        .from("users")
        .select("student_id_doc,is_verified")
        .eq("id", userId)
        .maybeSingle();

    if (selectError) {
        return res.status(400).json({ message: selectError.message });
    }

    const studentDocChanged =
        typeof student_id_doc === "string" &&
        student_id_doc.length > 0 &&
        student_id_doc !== existingProfile?.student_id_doc;

    const nextVerifiedStatus = studentDocChanged
        ? true
        : typeof is_verified === "boolean"
            ? is_verified
            : existingProfile?.is_verified ?? false;

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
            is_verified: nextVerifiedStatus,
    })
    .eq("id", userId)
    .select("*")
    .single();

    if (error) {
    return res.status(400).json({ message: error.message });
    }

    return res.json(data);
}
