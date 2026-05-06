import { useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import type { LoginForm } from "../types/user";


export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState<LoginForm>({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

    if (err) {
        setError(err);
        return;
    }

    setLoading(true);
    setError("");

    try {
        await loginUser(form);
        navigate("/profile");
    } catch (err: any) {
        setError(err.message || "Invalid email or password.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={styles.page}>
            <div style={styles.bgAccent}></div>

            <div style={styles.container}>
                {/* Left Panel */}
                <div style={styles.leftPanel}>
                    <div>
                        <p style={styles.brand}>roomies</p>
                        <h1 style={styles.tagline}>
                            Welcome Back.
                        </h1>
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
                        <p style={styles.formSub}>Welcome back to Roomies</p>

                        {error && (
                            <div style={styles.errorBox}>
                                {error}
                            </div>
                        )}

                        <div style={styles.fields}>
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

                            <button
                                style={styles.btn}
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Login →"}
                            </button>
                        </div>

                        <p style={styles.loginPrompt}>
                            Don&apos;t have an account?{" "}
                            <Link to="/register" style={styles.loginLink}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, name, type, value, onChange, placeholder }: {
    label: string;
    name: string;
    type: string;
    value: string;
    onChange: any;
    placeholder: string;
}) {
    return (
        <div style={styles.fieldGroup}>
            <label style={styles.label}>{label}</label>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={styles.input}
            />
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
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
        width: 28,
        height: 28,
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
        marginBottom: 12,
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
