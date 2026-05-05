import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const API = "http://localhost:5000/api";

const UNIVERSITIES = [
    "Yonsei University",
    "Seoul National University",
    "Korea University",
    "Ewha Womans University",
    "Hongik University",
    "Sogang University",
    "Hanyang University",
    "Sungkyunkwan University",
    "Myongji University",
    "Other",
];

const NATIONALITIES =[
    "Korean", "American", "Chinese", "Japanese", "Vietnamese",
    "French", "German", "British", "Canadian", "Australian",
    "Indian", "Brazilian", "Myanmar", "Other",
];

const LIFESTYLE_TAGS = [
    "Non-smoker","Smoker","Early bird","Night owl",
    "Quiet", "Social", "Pet-friendly", "No pets",
    "Clean", "Relaxed","Study-focused","Gym-goer",
];

const LANGUAGES =[
    "English", "Korean", "Chinese", "Japanese",
    "French", "Spanish", "Vietnamese", "German"
];

interface UserProfile{
    id: string;
    name: string;
    email: string;
    university: string;
    nationality: string;
    budget_min: number | null;
    budget_max: number | null;
    profile_photo: string | null;
    is_verified: boolean;
    lifestyle_tags: string[];
    languages_spoken: string[];
}
//helper to get auth token from supabase session
const getToken = async () =>{
    const {data: {session}} = await supabase.auth.getSession();
    return session?.access_token || "";
};

export default function Profile(){
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [photoFile,setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    
    const [profile, setProfile] = useState<UserProfile>({
        id: "",
        name: "",
        email: "",
        university: "",
        nationality: "",
        budget_min: null,
        budget_max: null,
        profile_photo: null,
        is_verified: false,
        lifestyle_tags: [],
        languages_spoken: [],
    });

    useEffect(() => {
        fetchProfile();
    },[]);

    const fetchProfile = async() => {
        setLoading(true);
        try{
            const token = await getToken();
            if (!token) {navigate("/login");return;}

            //fetch profile from backend
            const {data} = await axios.get(`${API}/users/profile`,{
                headers: {Authorization: `Bearer ${token}`},
            });
            setProfile(data);

        }catch(err : any){
            setError("Failed to load profile.");
        }finally{
            setLoading(false);
        }
    };
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };
    const toggleTag = (tag: string, field: "lifestyle_tags" | "languages_spoken")=>{
        setProfile((prev)=>{
            const current = prev[field] || [];
            const updated = current.includes(tag)
                ? current.filter((t)=> t !== tag)
                : [...current,tag];
            return { ...prev,[field]:updated};
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");

        try{
            const token = await getToken();

           //upload to Supabase Storage directly if there's a new photo
            let photoUrl = profile.profile_photo;
            if (photoFile){
                const fileExt = photoFile.name.split(".").pop();
                const fileName = `${profile.id}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("profile-photos")
                    .upload(fileName, photoFile, { upsert:true});

                if (!uploadError){
                    const { data: urlData} = supabase.storage
                        .from("profile-photos")
                        .getPublicUrl(fileName);
                    photoUrl = urlData.publicUrl;
                }
            }

            //send updated profile to backend
            await axios.put(
                `${API}/users/profile`,
                {
                    name: profile.name,
                    university: profile.university,
                    nationality: profile.nationality,
                    budget_min: profile.budget_min,
                    budget_max: profile.budget_max,
                    lifestyle_tags: profile.lifestyle_tags,
                    languages_spoken: profile.languages_spoken,
                    profile_photo: photoUrl,
                },
                {headers: { Authorization: `Bearer ${token}` } }
            );

            setProfile((prev) => ({ ...prev, profile_photo: photoUrl }));
            setSuccess("Profile updated successfully.");
            setEditing(false);
            setPhotoFile(null);
            setPhotoPreview(null);

        }catch(err:any){
            setError(err.response?.data?.error || "Failed to save profile.");
         
        }finally{
            setSaving(false);
        }
    };
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    if (loading){
        return(
            <div style={styles.loadingPage}>
                <p style={styles.loadingText}>Loading your profile...</p>
            </div>
        );
    }

    const avatarSrc = photoPreview || profile.profile_photo;

    return(
        <div style={styles.page}>
            <div style={styles.bgAccent}/>
            {/* Top Navigation */}
            <nav style={styles.nav}>
                <p style={styles.brand}>roomies</p>
                <div style={styles.navRight}>
                    <button style={styles.navLink} onClick={()=> navigate("/browse")}>Browse</button>
                    <button style={styles.navLink} onClick={handleLogout}>Sign Out</button>
                </div>
            </nav>
            <div style={styles.container}>
                {/*Left -avatar + identity*/}
                <div style={styles.leftPanel}>
                    <div style={styles.avatarWrap}>
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="Profile" style={styles.avatar}/>
                        ):(
                            <div style={styles.avatarPlaceholder}>
                                {profile.name ? profile.name[0].toUpperCase() : "?"}
                            </div>
                        )}
                        {editing && (
                            <label style={styles.photoUploadBtn}>
                                <input type="file" accept="image/*"
                                style={{ display: "none" }} onChange={handlePhotoChange} />
                                Change photo
                            </label>
                        )}
                    </div>
                    <h2 style={styles.profileName}>{profile.name || "Your Name"}</h2>
            <p style={styles.profileEmail}>{profile.email}</p>
    
            <div style={styles.verifiedBadge}>
            {profile.is_verified ? (
                <span style={{ ...styles.badge, background: "#f0faf4", color: "#27ae60", border: "1px solid #a8e6c1" }}>
                ✓ Verified Student
                </span>
            ) : (
                <span style={{ ...styles.badge, background: "#fdfaf0", color: "#b8860b", border: "1px solid #f0dc82" }}>
                ⏳ Pending Verification
                </span>
            )}
            </div>

            {profile.lifestyle_tags?.length > 0 && (
                <div style={styles.tagsWrap}>
                {profile.lifestyle_tags.map((tag) => (
                <span key={tag} style={styles.tag}>{tag}</span>
            ))}
                </div>
            )}
                </div>

        {/* Right — editable details */}
        <div style={styles.rightPanel}>
            <div style={styles.headerRow}>
            <div>
                <h2 style={styles.sectionTitle}>My Profile</h2>
                <p style={styles.sectionSub}>Manage your roommate preferences</p>
            </div>
            {!editing ? (
                <button style={styles.editBtn} onClick={() => setEditing(true)}>
                Edit Profile
                </button>
            ) : (
                <div style={styles.btnRow}>
                    <button style={styles.cancelBtn} onClick={() => { setEditing(false); setError(""); }}>
                    Cancel
                    </button>
                    <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            )}
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

          {/* Basic Info */}
            <div style={styles.section}>
                <p style={styles.sectionLabel}>Basic Information</p>
                <div style={styles.grid2}>
                <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                {editing ? (
                    <input style={styles.input} value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                ) : (
                    <p style={styles.value}>{profile.name || "—"}</p>
                )}
                </div>

                <div style={styles.fieldGroup}>
                    <label style={styles.label}>University</label>
                {editing ? (
                    <select style={styles.select} value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}>
                    <option value="">Select university</option>
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                ) : (
                    <p style={styles.value}>{profile.university || "—"}</p>
                )}
                </div>

                <div style={styles.fieldGroup}>
                <label style={styles.label}>Nationality</label>
                {editing ? (
                    <select style={styles.select} value={profile.nationality}
                    onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}>
                    <option value="">Select nationality</option>
                    {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                ) : (
                    <p style={styles.value}>{profile.nationality || "—"}</p>
                )}
                </div>
            </div>
            </div>

            <div style={styles.divider} />

          {/* Budget */}
            <div style={styles.section}>
            <p style={styles.sectionLabel}>Monthly Budget (KRW)</p>
                <div style={styles.grid2}>
                <div style={styles.fieldGroup}>
                <label style={styles.label}>Minimum</label>
                {editing ? (
                    <input style={styles.input} type="number" placeholder="e.g. 300000"
                    value={profile.budget_min || ""}
                    onChange={(e) => setProfile({ ...profile, budget_min: Number(e.target.value) })} />
                ) : (
                    <p style={styles.value}>
                    {profile.budget_min ? `₩${profile.budget_min.toLocaleString()}` : "—"}
                    </p>
                )}
                </div>

                <div style={styles.fieldGroup}>
                <label style={styles.label}>Maximum</label>
                {editing ? (
                    <input style={styles.input} type="number" placeholder="e.g. 700000"
                    value={profile.budget_max || ""}
                    onChange={(e) => setProfile({ ...profile, budget_max: Number(e.target.value) })} />
                ) : (
                    <p style={styles.value}>
                    {profile.budget_max ? `₩${profile.budget_max.toLocaleString()}` : "—"}
                    </p>
                )}
                </div>
            </div>
            </div>

            <div style={styles.divider} />

          {/* Lifestyle Tags */}
            <div style={styles.section}>
            <p style={styles.sectionLabel}>Lifestyle</p>
            <div style={styles.tagsGrid}>
                {LIFESTYLE_TAGS.map((tag) => {
                const active = profile.lifestyle_tags?.includes(tag);
                return (
                    <button key={tag} disabled={!editing}
                    onClick={() => toggleTag(tag, "lifestyle_tags")}
                    style={{
                        ...styles.tagBtn,
                        background: active ? "#1a1a1a" : "transparent",
                        color: active ? "#fff" : "#888",
                        border: active ? "1.5px solid #1a1a1a" : "1.5px solid #ddd",
                        cursor: editing ? "pointer" : "default",
                    }}>
                    {tag}
                    </button>
                );
                })}
            </div>
            </div>

            <div style={styles.divider} />

          {/* Languages */}
            <div style={styles.section}>
                <p style={styles.sectionLabel}>Languages Spoken</p>
                <div style={styles.tagsGrid}>
                {LANGUAGES.map((lang) => {
                    const active = profile.languages_spoken?.includes(lang);
                    return (
                    <button key={lang} disabled={!editing}
                        onClick={() => toggleTag(lang, "languages_spoken")}
                        style={{
                        ...styles.tagBtn,
                        background: active ? "#1a1a1a" : "transparent",
                        color: active ? "#fff" : "#888",
                        border: active ? "1.5px solid #1a1a1a" : "1.5px solid #ddd",
                        cursor: editing ? "pointer" : "default",
                        }}>
                        {lang}
                    </button>
                    );
                })}
                </div>
            </div>

                </div>
            </div>
        </div>
    );
}
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#fafaf8",
        fontFamily: "'Georgia', serif",
        position: "relative",
        overflow: "hidden",
    },
    bgAccent: {
        position: "fixed",
        top: -200,
        right: -200,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, #e8e4dc 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
    },
    loadingPage: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafaf8",
    },
    loadingText: {
        fontFamily: "'Georgia', serif",
        fontSize: 15,
        color: "#aaa",
        letterSpacing: "0.05em",
    },
    nav: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 48px",
        borderBottom: "1px solid #ebe9e4",
        background: "#fafaf8",
        position: "relative",
        zIndex: 1,
    },
    brand: {
        fontSize: 13,
        letterSpacing: "0.25em",
        textTransform: "uppercase" as const,
        color: "#888",
        fontFamily: "'Georgia', serif",
    },
    navRight: {
        display: "flex",
        gap: 24,
        alignItems: "center",
    },
    navLink: {
        background: "none",
        border: "none",
        fontSize: 13,
        color: "#888",
        cursor: "pointer",
        fontFamily: "'Georgia', serif",
        letterSpacing: "0.05em",
    },
    container: {
        display: "flex",
        maxWidth: 1100,
        margin: "48px auto",
        gap: 40,
        padding: "0 40px",
        position: "relative",
        zIndex: 1,
    },
    leftPanel: {
        width: 260,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
    },
    avatarWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: "50%",
        objectFit: "cover" as const,
        border: "3px solid #ebe9e4",
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: "#e8e4dc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 36,
        color: "#888",
        fontFamily: "'Georgia', serif",
        border: "3px solid #ebe9e4",
    },
    photoUploadBtn: {
        fontSize: 12,
        color: "#888",
        textDecoration: "underline",
        cursor: "pointer",
        fontFamily: "'Georgia', serif",
        letterSpacing: "0.05em",
    },
    profileName: {
        fontSize: 20,
        fontWeight: 400,
        color: "#1a1a1a",
        textAlign: "center" as const,
        fontFamily: "'Georgia', serif",
        marginTop: 4,
    },
    profileEmail: {
        fontSize: 12,
        color: "#aaa",
        textAlign: "center" as const,
        fontFamily: "'Georgia', serif",
    },
    verifiedBadge: {
        marginTop: 4,
    },
    badge: {
        fontSize: 11,
        padding: "4px 12px",
        borderRadius: 20,
        fontFamily: "'Georgia', serif",
        letterSpacing: "0.03em",
    },
    tagsWrap: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: 6,
        justifyContent: "center",
        marginTop: 8,
    },
    tag: {
        fontSize: 11,
        padding: "4px 10px",
        background: "#f0ede8",
        color: "#666",
        borderRadius: 20,
        fontFamily: "'Georgia', serif",
    },
    rightPanel: {
        flex: 1,
        background: "#ffffff",
        borderRadius: 2,
        boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
        padding: "40px 48px",
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 400,
        color: "#1a1a1a",
        fontFamily: "'Georgia', serif",
        marginBottom: 4,
    },
    sectionSub: {
        fontSize: 13,
        color: "#aaa",
        fontFamily: "'Georgia', serif",
    },
    editBtn: {
        background: "transparent",
        border: "1.5px solid #1a1a1a",
        padding: "10px 24px",
        fontSize: 12,
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        cursor: "pointer",
        fontFamily: "'Georgia', serif",
        color: "#1a1a1a",
        borderRadius: 1,
    },
    btnRow: {
        display: "flex",
        gap: 10,
    },
    cancelBtn: {
        background: "transparent",
        border: "1.5px solid #ddd",
        padding: "10px 20px",
        fontSize: 12,
        cursor: "pointer",
        fontFamily: "'Georgia', serif",
        color: "#888",
        borderRadius: 1,
    },
    saveBtn: {
        background: "#1a1a1a",
        border: "none",
        padding: "10px 24px",
        fontSize: 12,
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        cursor: "pointer",
        fontFamily: "'Georgia', serif",
        color: "#fff",
        borderRadius: 1,
    },
    errorBox: {
        background: "#fff5f5",
        border: "1px solid #fecaca",
        color: "#c0392b",
        padding: "12px 16px",
        borderRadius: 2,
        fontSize: 13,
        marginBottom: 20,
        fontFamily: "'Georgia', serif",
    },
    successBox: {
        background: "#f0faf4",
        border: "1px solid #a8e6c1",
        color: "#27ae60",
        padding: "12px 16px",
        borderRadius: 2,
        fontSize: 13,
        marginBottom: 20,
        fontFamily: "'Georgia', serif",
    },
    section: {
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 11,
        letterSpacing: "0.15em",
        textTransform: "uppercase" as const,
        color: "#aaa",
        marginBottom: 16,
        fontFamily: "'Georgia', serif",
    },
    grid2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    label: {
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        color: "#bbb",
        fontFamily: "'Georgia', serif",
    },
    input: {
        border: "none",
        borderBottom: "1.5px solid #ddd",
        padding: "8px 0",
        fontSize: 14,
        fontFamily: "'Georgia', serif",
        color: "#1a1a1a",
        background: "transparent",
        outline: "none",
        width: "100%",
    },
    select: {
        border: "none",
        borderBottom: "1.5px solid #ddd",
        padding: "8px 0",
        fontSize: 14,
        fontFamily: "'Georgia', serif",
        color: "#1a1a1a",
        background: "transparent",
        outline: "none",
        width: "100%",
        appearance: "none" as const,
        cursor: "pointer",
    },
    value: {
        fontSize: 15,
        color: "#1a1a1a",
        fontFamily: "'Georgia', serif",
        padding: "8px 0",
        borderBottom: "1.5px solid transparent",
    },
    divider: {
        height: 1,
        background: "#f0ede8",
        margin: "24px 0",
    },
    tagsGrid: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: 8,
    },
    tagBtn: {
        padding: "6px 14px",
        fontSize: 12,
        fontFamily: "'Georgia', serif",
        borderRadius: 20,
        transition: "all 0.2s ease",
        letterSpacing: "0.03em",
    },
};