import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const API = "http://localhost:5000/api";

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const validateLogin = () => {
        if (!form.email.trim()) return "Please enter your Email.";
        if (!form.password) return "Please enter your Password.";
        return "";
    };

    const handleLogin = async () => {
        const err = validateLogin();
        if (err) { setError(err); return; }

        setLoading(true);
        setError("");

        try {
            // Send to  backend
            const { data } = await axios.post(`${API}/auth/login`, {
                email: form.email,
                password: form.password,
            });

            // Store token from backend response
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/profile");
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: "google" | "kakao") => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin + "/profile" },
        });
        if (error) setError(error.message);
    };

    return (
        <div style={styles.page}>
            <div style={styles.bgAccent}></div>

            <div style={styles.container}>
                {/* Left Panel */}
                <div style={styles.leftPanel}>
                    <div>
                        <p style={styles.brand}>roomie</p>
                        <h1 style={styles.tagline}>Welcome Back.</h1>
                        <p style={styles.subTagline}>
                            Sign in and continue finding your perfect space in Korea.
                        </p>
                    </div>

                    <div style={styles.stepIndicatorWrap}>
                        <div style={styles.stepRow}>
                            <div style={styles.activeDot}></div>
                            <span style={styles.stepLabel}>Login</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div style={styles.rightPanel}>
                    <div style={styles.formCard}>
                        <h2 style={styles.formTitle}>Sign in to your account</h2>
                        <p style={styles.formSub}>Welcome back to Roomie</p>

                        {error && <div style={styles.errorBox}>{error}</div>}

                        <div style={styles.fields}>
                            {/* Social login */}
                            <div style={styles.socialWrap}>
                                <button style={styles.googleBtn} onClick={() => handleSocialLogin("google")}>
                                    <img src="https://www.google.com/favicon.ico" width={16} height={16} alt="Google" />
                                    Continue with Google
                                </button>
                                <button style={styles.kakaoBtn} onClick={() => handleSocialLogin("kakao")}>
                                    <span style={{ fontSize: 16 }}>💬</span>
                                    Continue with Kakao
                                </button>
                            </div>

                            <div style={styles.divider}>
                                <span style={styles.dividerLine} />
                                <span style={styles.dividerText}>or</span>
                                <span style={styles.dividerLine} />
                            </div>

                            <Field
                                label="Email Address"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@university.ac.kr"
                            />

                            <Field
                                label="Password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                            />

                            <div style={styles.forgotWrap}>
                                <Link to="/forgot-password" style={styles.loginLink}>
                                    Forgot password?
                                </Link>
                            </div>

                            <button style={styles.btn} onClick={handleLogin} disabled={loading}>
                                {loading ? "Signing in..." : "Sign in →"}
                            </button>
                        </div>

                        <p style={styles.loginPrompt}>
                            Don&apos;t have an account?{" "}
                            <Link to="/register" style={styles.loginLink}>Sign up</Link>
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
            <input
                name={name} type={type} value={value}
                onChange={onChange} placeholder={placeholder}
                style={styles.input}
            />
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#fafaf8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        position: "relative",
        overflow: "hidden",
        padding: "40px 20px",
    },
    bgAccent: {
        position: "absolute",
        top: -200, right: -200,
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, #e8e4dc 0%, transparent 70%)",
        pointerEvents: "none",
    },
    container: {
        display: "flex",
        width: "100%",
        maxWidth: 960,
        minHeight: 580,
        background: "#ffffff",
        borderRadius: 2,
        boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
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
        fontFamily: "'Georgia', serif",
    },
    tagline: {
        fontSize: 28,
        fontWeight: 400,
        color: "#1a1a1a",
        lineHeight: 1.35,
        marginBottom: 16,
        fontFamily: "'Georgia', serif",
    },
    subTagline: {
        fontSize: 14,
        color: "#888",
        lineHeight: 1.7,
        fontFamily: "'Georgia', serif",
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
    activeDot: {
        width: 28, height: 28,
        borderRadius: "50%",
        background: "#1a1a1a",
        flexShrink: 0,
    },
    stepLabel: {
        fontSize: 13,
        letterSpacing: "0.02em",
        fontFamily: "'Georgia', serif",
        color: "#1a1a1a",
    },
    rightPanel: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 40px",
    },
    formCard: {
        width: "100%",
        maxWidth: 420,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 400,
        color: "#1a1a1a",
        marginBottom: 4,
        letterSpacing: "0.05em",
    },
    formSub: {
        fontSize: 13,
        color: "#aaa",
        marginBottom: 32,
        fontFamily: "'Georgia', serif",
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
    socialWrap: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },
    googleBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "12px 20px",
        border: "1.5px solid #ddd",
        background: "#fff",
        fontSize: 13,
        cursor: "pointer",
        letterSpacing: "0.05em",
        borderRadius: 1,
        fontFamily: "'Georgia', serif",
    },
    kakaoBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "12px 20px",
        border: "none",
        background: "#FEE500",
        fontSize: 13,
        cursor: "pointer",
        letterSpacing: "0.05em",
        borderRadius: 1,
        color: "#1a1a1a",
        fontFamily: "'Georgia', serif",
    },
    divider: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    dividerLine: {
        flex: 1, height: 1,
        background: "#eee",
        display: "block",
    },
    dividerText: {
        fontSize: 12, color: "#bbb",
        letterSpacing: "0.1em",
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
    forgotWrap: {
        textAlign: "right",
        marginTop: -8,
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
};