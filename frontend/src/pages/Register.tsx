
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UNIVERSITIES, NATIONALITIES } from "../lib/registerOptions";
import { registerUser } from "../services/authService";

import type { RegisterForm } from "../types/user";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    nationality: "",
  });

  // Handler for form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Handler for handling Student ID file change
//   const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];

//     if (!file) return;

//     const allowedTypes = [
//         "image/jpeg", 
//         "image/png", 
//         "image/webp", 
//         "application/pdf",
//     ];

//     if (!allowedTypes.includes(file.type)) {
//         setError("Student ID must be an image or PDF file.");
//         return;
//     }

//     if (file.size > 2 * 1024 * 1024) {
//         setError("Student ID file must be less than 2MB.");
//         return;
//     }

//     setStudentIdFile(file);
//     setError("");   
//     };

  // Validation for step 1
  const validateStep1 = () => {
    if (!form.name.trim()) return "Please enter your Full Name.";
    if (!form.email.trim()) return "Please enter your Email.";
    if (!form.password) return "Please enter a Password.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  // Validation for step 2
  const validateStep2 = () => {
    if (!form.university) return "Please select your University.";
    if (!form.nationality) return "Please select your Nationality.";
    return "";
  };

  // Handler for going to next step after validating step 1
  const handleNext = () => {
    const err = validateStep1();

    if (err) {
      setError(err);
      return;
    }

    setStep(2);
  };

  // Final submission handler
  const handleSubmit = async () => {
    const err = validateStep2();

    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return(
        <div style={styles.page}>
            {/*Background accent*/}
            <div style={styles.bgAccent}></div>
            <div style={styles.container}>
                {/*left panel*/}
                <div style={styles.leftPanel}>
                    <div>
                        <p style={styles.brand}>roomies</p>
                        <h1 style={styles.tagline}>
                            Find Your Perfect Space In Korea.
                        </h1>
                        <p style={styles.subTagline}>
                            Peer-to-peer room sharing for students - no agents, no hidden fees.
                        </p>
                    </div>

                    <div style={styles.stepIndicatorWrap}>
                        {[1,2].map((s)=>(
                            <div key={s} style={styles.stepRow}>
                                <div style={{
                                    ...styles.stepDot,
                                    background: step >=s ? "#1a1a1a" : "transparent",
                                    border: step >= s ? "2px solid #1a1a1a" : "2px solid #ccc",

                                }}>
                                    {step > s ? "✓" : s}
                                </div>
                                <span style={{ ...styles.stepLabel,color: step >= s ? "#1a1a1a" : "#aaa"}}>
                                    {s === 1 ? "Account Details": "Your Profile"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/*Right Panel form */}
                <div style={styles.rightPanel}>
                    <div style={styles.formCard}>
            <h2 style={styles.formTitle}>
                {step === 1 ? "Create your account" : "Tell us about yourself"}
                </h2>
                <p style={styles.formSub}>
                {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                </p>
    
                {error && (
                <div style={styles.errorBox}>
                    {error}
                </div>
                )}
    
                {step === 1 && (
                <div style={styles.fields}>
                    <Field label="Full Name" name="name" type="text"
                    value={form.name} onChange={handleChange} placeholder="e.g. Min-jun Lee" />
                    <Field label="Email Address" name="email" type="email"
                    value={form.email} onChange={handleChange} placeholder="you@university.ac.kr" />
                    <Field label="Password" name="password" type="password"
                    value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
                    <Field label="Confirm Password" name="confirmPassword" type="password"
                    value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />
    
                    <button style={styles.btn} onClick={handleNext}>
                    Continue →
                    </button>
                </div>
                )}
    
                {step === 2 && (
                <div style={styles.fields}>
                    <div style={styles.fieldGroup}>
                    <label style={styles.label}>University</label>
                    <select name="university" value={form.university}
                        onChange={handleChange} style={styles.select}>
                        <option value="">Select your university</option>
                        {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    </div>
    
                    <div style={styles.fieldGroup}>
                    <label style={styles.label}>Nationality</label>
                    <select name="nationality" value={form.nationality}
                        onChange={handleChange} style={styles.select}>
                        <option value="">Select your nationality</option>
                        {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    </div>
    
                    {/* <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                        Student ID <span style={styles.optional}>(optional but recommended)</span>
                    </label>
                    <label style={styles.uploadBox}>
                        <input type="file" accept="image/*,.pdf"
                        style={{ display: "none" }}
                        onChange={handleStudentIdChange}
                        />
                        <span style={styles.uploadIcon}>↑</span>
                        <span style={styles.uploadText}>
                        {studentIdFile ? studentIdFile.name : "Upload student ID or enrollment cert."}
                        </span>
                    </label>
                    <p style={styles.hint}>JPG, PNG, WEBP, or PDF. Max 2MB. Kept private.</p>
                    </div> */}
    
                    <div style={styles.btnRow}>
                    <button style={styles.btnOutline} onClick={() => setStep(1)}>
                        ← Back
                    </button>
                    <button style={{ ...styles.btn, flex: 1 }}
                        onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                    </div>
                </div>
                )}
    
                <p style={styles.loginPrompt}>
                Already have an account?{" "}
                <Link to="/login" style={styles.loginLink}>Sign in</Link>
                </p>
            </div>
                </div>
            </div>
        </div>
    );


}
function Field({ label, name, type, value, onChange, placeholder }: {
    label: string; name: string; type: string;
    value: string; onChange: any; placeholder: string;
    }) {
    return (
        <div style={styles.fieldGroup}>
        <label style={styles.label}>{label}</label>
        <input name={name} type={type} value={value}
            onChange={onChange} placeholder={placeholder} style={styles.input} />
        </div>
    );
}

const styles: Record<string, React.CSSProperties>={
    page: {
        minHeight: "100vh",
        background: "#fafaf8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia',serif",
        position: "relative",
        overflow: "hidden",
        padding: "40px 20px",
    },
    bgAccent: {
        position: "absolute",
        top: -200,
        right: -200,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, #e8e4dc 0%, transparent 70%)",
        pointerEvents: "none",
    },

    container: {
        display: "flex",
        width: "100%",
        maxWidth: 960,
        minHeight:580,
        background: "#ffffff",
        borderRadius: 2,
        boxShadow: "0 4px 40pz rgba(0,0,0,0.08)",
        overflow: "hidden",
    },

    leftPanel: {
        width: 320,
        background: "#f5f3ef",
        padding: "56px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #ebe9e4",
        flexShrink: 0,
    },

    brand: {
        fontSize: 13,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "#888",
        marginBottom: 32,
        fontFamily: " 'Georgia', serif",

    },

    tagline: {
        fontSize:28,
        fontWeight: 400,
        color: "#1a1a1a",
        lineHeight: 1.35,
        marginBottom: 16,
        fontFamily: " 'Georgia' , serif",

    },

    subTagline: {
        fontSize: 14,
        color: "#888",
        lineHeight: 1.7,
        fontFamily: " 'Georgia', serif",
    },
    stepIndicatorWrap: {
        display: "flex",
        flexDirection: "column",
        gap: 16,

    },

    stepRow: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },

    stepDot: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: "#1a1a1a",
        flexShrink: 0,
        transition: "all 0.3s ease",
    },

    stepLabel: {
        fontSize: 13,
        letterSpacing: "0.02em",
        fontFamily: " 'Georgia', serif",
        transition: "color 0.3s ease",

    },
    rightPanel: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 40px",

    },
    formCard:{
        width: "100%",
        maxWidth: 420,
    },

    formTitle: {
        fontSize: 24,
        fontWeight: 400,
        color: "#1a1a1a",
        marginBottom: 32,
        letterSpacing: "0.05em",
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
    fields: {
        display: "flex",
        flexDirection: "column",
        gap: 20,
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    label: {
        fontSize: 12,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#888",
        fontFamily: "'Georgia', serif",
    },
    optional: {
        textTransform: "none",
        letterSpacing: 0,
        color: "#bbb",
        fontSize: 11,
    },
    input: {
        border: "none",
        borderBottom: "1.5px solid #ddd",
        padding: "10px 0",
        fontSize: 15,
        fontFamily: "'Georgia', serif",
        color: "#1a1a1a",
        background: "transparent",
        outline: "none",
        transition: "border-color 0.2s ease",
        width: "100%",
    },
    select: {
        border: "none",
        borderBottom: "1.5px solid #ddd",
        padding: "10px 0",
        fontSize: 15,
        fontFamily: "'Georgia', serif",
        color: "#1a1a1a",
        background: "transparent",
        outline: "none",
        width: "100%",
        cursor: "pointer",
        appearance: "none",
    },
    uploadBox: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        border: "1.5px dashed #ddd",
        padding: "16px 20px",
        cursor: "pointer",
        transition: "border-color 0.2s ease",
        borderRadius: 2,
    },
    uploadIcon: {
        fontSize: 18,
        color: "#aaa",
    },
    uploadText: {
        fontSize: 13,
        color: "#888",
        fontFamily: "'Georgia', serif",
    },
    hint: {
        fontSize: 11,
        color: "#bbb",
        fontFamily: "'Georgia', serif",
        marginTop: 4,
    },
    btn: {
        background: "#1a1a1a",
        color: "#fff",
        border: "none",
        padding: "14px 24px",
        fontSize: 13,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        cursor: "pointer",
        fontFamily: "'Georgia', serif",
        transition: "background 0.2s ease",
        borderRadius: 1,
    },
    btnOutline: {
        background: "transparent",
        color: "#1a1a1a",
        border: "1.5px solid #ddd",
        padding: "14px 20px",
        fontSize: 13,
        letterSpacing: "0.08em",
        cursor: "pointer",
        fontFamily: "'Georgia', serif",
        borderRadius: 1,
    },
    btnRow: {
        display: "flex",
        gap: 12,
        marginTop: 4,
    },
    loginPrompt: {
        marginTop: 28,
        fontSize: 13,
        color: "#aaa",
        fontFamily: "'Georgia', serif",
        textAlign: "center",
    },
    loginLink: {
        color: "#1a1a1a",
        textDecoration: "underline",
        textUnderlineOffset: 3,
    },
}