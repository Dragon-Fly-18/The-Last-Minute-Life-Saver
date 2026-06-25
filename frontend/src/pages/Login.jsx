import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

/* ── SVG Icons ───────────────────────────────────────────── */
const DiamondIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4fc3f7" />
        <stop offset="50%" stopColor="#7c4dff" />
        <stop offset="100%" stopColor="#e040fb" />
      </linearGradient>
    </defs>
    <polygon points="24,4 44,18 24,44 4,18" fill="url(#dGrad)" opacity="0.9" />
    <polygon points="24,4 44,18 24,24 4,18" fill="rgba(255,255,255,0.25)" />
    <polygon points="4,18 24,24 24,44" fill="rgba(0,0,0,0.18)" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 8l10 6 10-6" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const SignInArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const DemoCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

/* ── Component ───────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setEmail("demo@malak.ai");
    setPassword("demo1234");
  };

  return (
    <div className="lm-root">
      {/* Ambient glow blobs */}
      <div className="lm-blob lm-blob-tl" />
      <div className="lm-blob lm-blob-br" />

      <div className="lm-card">
        {/* Logo */}
        <div className="lm-logo">
          <DiamondIcon />
        </div>

        {/* Brand */}
        <h1 className="lm-brand">
          Malak<span className="lm-brand-ai">AI</span>
        </h1>
        <p className="lm-tagline">Secure access to your intelligent wealth platform.</p>

        {/* Error */}
        {error && <div className="lm-error">{error}</div>}

        {/* Form */}
        <form className="lm-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="lm-field">
            <label className="lm-label">EMAIL ADDRESS</label>
            <div className={`lm-input-wrap ${focusedField === "email" ? "lm-focused" : ""}`}>
              <span className="lm-icon"><MailIcon /></span>
              <input
                id="lm-email"
                type="email"
                className="lm-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="lm-field">
            <div className="lm-label-row">
              <label className="lm-label">PASSWORD</label>
              <button type="button" className="lm-forgot">Forgot password?</button>
            </div>
            <div className={`lm-input-wrap ${focusedField === "password" ? "lm-focused" : ""}`}>
              <span className="lm-icon"><LockIcon /></span>
              <input
                id="lm-password"
                type={showPassword ? "text" : "password"}
                className="lm-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="lm-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Sign In */}
          <button
            id="lm-signin-btn"
            type="submit"
            className={`lm-btn-primary ${loading ? "lm-loading" : ""}`}
            disabled={loading}
          >
            <SignInArrow />
            {loading ? "Signing in…" : "Sign In to Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="lm-divider">
          <span className="lm-divider-line" />
          <span className="lm-divider-text">OR TEST PREVIEW</span>
          <span className="lm-divider-line" />
        </div>

        {/* Demo Account */}
        <button
          id="lm-demo-btn"
          type="button"
          className="lm-btn-demo"
          onClick={handleDemo}
        >
          <DemoCheckIcon />
          Use Demo Account (Alex Morgan)
        </button>

        {/* Footer */}
        <p className="lm-footer">
          Don't have an account?{" "}
          <Link to="/signup" className="lm-signup-link">Sign up now</Link>
        </p>
      </div>
    </div>
  );
}