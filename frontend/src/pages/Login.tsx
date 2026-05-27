import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, loginWithSocialProvider } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "kakao" | null>(
    null
  );
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
      setError(err.response?.data?.message || "Email or password is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "kakao") => {
    setError("");
    setSocialLoading(provider);

    try {
      await loginWithSocialProvider(provider);
    } catch (err: any) {
      setError(
        err.message ||
          `Unable to start ${provider} login right now. Please try again.`
      );
      setSocialLoading(null);
    }
  };

  return (
    <div style={styles.page} className="roomies-responsive">
      <div style={styles.bgAccent}></div>

      <div style={styles.container} className="roomies-mobile-auth-shell">
        <div style={styles.leftPanel} className="roomies-mobile-auth-panel">
          <div>
            <p style={styles.brand}>roomies</p>
            <h1 style={styles.tagline}>Welcome Back.</h1>
            <p style={styles.subTagline}>
              Sign in with Google, Kakao, or your email and continue finding your perfect space in Korea.
            </p>
          </div>

          <div style={styles.stepIndicatorWrap}>
            <div style={styles.stepRow}>
              <div style={styles.activeDot}></div>
              <span style={styles.stepLabel}>Login</span>
            </div>
          </div>
        </div>

        <div style={styles.rightPanel} className="roomies-mobile-auth-panel">
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Sign in to your account</h2>
            <p style={styles.formSub}>
              Pick the easiest way to continue your Roomies journey.
            </p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.dividerRow}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>sign in with email</span>
              <div style={styles.dividerLine} />
            </div>

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
                disabled={loading || socialLoading !== null}
              >
                {loading ? "Signing in..." : "Login →"}
              </button>
            </div>

            <p style={styles.loginPrompt}>
              Don&apos;t have an account yet?{" "}
              <Link to="/register" style={styles.loginLink}>
                Create one with email
              </Link>
            </p>

            <div style={styles.socialSection}>
              <div style={styles.dividerRowBottom}>
                <div style={styles.dividerLine} />
                <span style={styles.dividerText}>or continue with</span>
                <div style={styles.dividerLine} />
              </div>

              <div style={styles.socialStack} className="roomies-mobile-grid-1">
                <SocialButton
                  provider="google"
                  label="Continue with Google"
                  onClick={() => handleSocialLogin("google")}
                  disabled={loading || socialLoading !== null}
                  loading={socialLoading === "google"}
                />

                <SocialButton
                  provider="kakao"
                  label="Continue with Kakao"
                  onClick={() => handleSocialLogin("kakao")}
                  disabled={loading || socialLoading !== null}
                  loading={socialLoading === "kakao"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialButton({
  provider,
  label,
  onClick,
  disabled,
  loading,
}: {
  provider: "google" | "kakao";
  label: string;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  const isGoogle = provider === "google";

  return (
    <button
      type="button"
      style={{
        ...styles.socialButton,
        ...(isGoogle ? styles.googleButton : styles.kakaoButton),
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
      onClick={onClick}
      disabled={disabled}
    >
      <span style={styles.socialLeading}>
        <span
          style={{
            ...styles.socialBadge,
            ...(isGoogle ? styles.googleBadge : styles.kakaoBadge),
          }}
        >
          {isGoogle ? <GoogleIcon /> : <KakaoIcon />}
        </span>

        <span style={styles.socialButtonTextWrap}>
          <span style={styles.socialButtonText}>
            {loading ? "Redirecting..." : label}
          </span>
          <span style={styles.socialButtonSubtext}>
            {/* {isGoogle
              ? "Use your Google account"
              : "Use your Kakao account"} */}
          </span>
        </span>
      </span>

      <span style={styles.socialArrow}>→</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7977 2.715v2.2582h2.9086c1.7018-1.5668 2.6855-3.8768 2.6855-6.6141Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1818l-2.9086-2.2582c-.806  .54-1.8368.8591-3.0478.8591-2.3441 0-4.3282-1.5832-5.0373-3.7105H.9577v2.3291A8.9987 8.9987 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.9627 10.7086A5.4106 5.4106 0 0 1 3.6805 9c0-.5932.1018-1.1691.2822-1.7086V4.9623H.9577A8.9982 8.9982 0 0 0 0 9c0 1.4523.3477 2.8273.9577 4.0377l3.005-2.3291Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4418 1.3459l2.5814-2.5813C13.4636.8918 11.43 0 9 0A8.9987 8.9987 0 0 0 .9577 4.9623l3.005 2.3291C4.6718 5.1627 6.6559 3.5795 9 3.5795Z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <span style={styles.kakaoLetter}>K</span>
  );
}

function Field({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
}: {
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
  socialStack: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  socialButton: {
    width: "100%",
    border: "1px solid #e6e1d8",
    background: "#fbfaf7",
    color: "#1a1a1a",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    fontSize: 14,
    fontFamily: "'Georgia', serif",
    borderRadius: 14,
    transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
    boxShadow: "0 8px 24px rgba(26,26,26,0.04)",
    textAlign: "left",
  },
  googleButton: {
    background: "#ffffff",
    border: "1px solid #e5e0d8",
  },
  kakaoButton: {
    background: "#fffdf9",
    border: "1px solid #e5e0d8",
  },
  socialBadge: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  googleBadge: {
    background: "#ffffff",
    border: "1px solid #ece7df",
    boxShadow: "0 2px 10px rgba(26,26,26,0.06)",
  },
  kakaoBadge: {
    background: "#191600",
    color: "#FEE500",
    boxShadow: "0 4px 12px rgba(25,22,0,0.18)",
  },
  socialLeading: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    minWidth: 0,
    flex: 1,
  },
  socialButtonTextWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 0,
  },
  socialButtonText: {
    letterSpacing: "0.01em",
    fontSize: 15,
    color: "#1f1f1f",
  },
  socialButtonSubtext: {
    fontSize: 11,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "#8e887f",
  },
  socialArrow: {
    fontSize: 18,
    color: "#6e675e",
    flexShrink: 0,
  },
  kakaoLetter: {
    fontSize: 19,
    fontWeight: 700,
    fontFamily: "'Georgia', serif",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  dividerRowBottom: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#ebe6dd",
  },
  dividerText: {
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#aaa",
    whiteSpace: "nowrap",
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
    borderRadius: 1,
  },
  loginPrompt: {
    marginTop: 28,
    fontSize: 13,
    color: "#aaa",
    fontFamily: "'Georgia', serif",
    textAlign: "center",
  },
  socialSection: {
    marginTop: 30,
  },
  loginLink: {
    color: "#1a1a1a",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};
