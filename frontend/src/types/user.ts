// User-related types
// Form data for user registration
export type RegisterForm = {
  name: string; // User's full name
  email: string; // User's email address
  password: string; // Password
  confirmPassword: string; // Confirm password
  university: string; // University name
  nationality: string; // User's nationality
};

// Form data for user login
export type LoginForm = {
  email: string; // User's email
  password: string; // User's password
};

// Data for creating a user profile (backend)
export type CreateUserProfileInput = {
  id: string; // User ID
  email: string; // Email
  name: string; // Name
  university: string; // University
  nationality: string; // Nationality
  student_id_doc: string | null; // Student ID document (optional)
  is_verified: boolean; // Is the user verified?
};

// User profile data for frontend
export type UserProfile = {
  id: string; // User ID
  name: string; // Name
  email: string; // Email
  university: string; // University
  nationality: string; // Nationality
  budget_min: number | null; // Minimum budget (optional)
  budget_max: number | null; // Maximum budget (optional)
  profile_photo: string | null; // Profile photo URL (optional)
  student_id_doc: string | null; // Student ID document URL (optional)
  is_verified: boolean; // Is verified
  lifestyle_tags: string[]; // Lifestyle tags
  language_spoken: string[]; // Languages spoken
};

// Data for updating user profile
export type UpdateUserProfileInput = {
  id: string; // User ID
  name: string; // Name
  university: string; // University
  nationality: string; // Nationality
  budget_min: number | null; // Minimum budget (optional)
  budget_max: number | null; // Maximum budget (optional)
  lifestyle_tags: string[]; // Lifestyle tags
  language_spoken: string[]; // Languages spoken
  profile_photo: string | null; // Profile photo URL (optional)
  student_id_doc: string | null; // Student ID document URL (optional)
  is_verified?: boolean; // Verified? (only update if user upload student ID)
};