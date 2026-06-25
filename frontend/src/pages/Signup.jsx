import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./Login.css"; /* reuse the same design tokens */

/* ── SVG Icons ───────────────────────────────────────────── */
const DiamondIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dGradSu" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4fc3f7" />
        <stop offset="50%" stopColor="#7c4dff" />
        <stop offset="100%" stopColor="#e040fb" />
      </linearGradient>
    </defs>
    <polygon points="24,4 44,18 24,44 4,18" fill="url(#dGradSu)" opacity="0.9" />
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

const UserPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

/* ── Component ───────────────────────────────────────────── */
export default function Signup() {
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [focusedField, setFocusedField]     = useState(null);
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lm-root">
      {/* Ambient blobs */}
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
        <p className="lm-tagline">Create your intelligent wealth platform account.</p>

        {/* Error */}
        {error && <div className="lm-error">{error}</div>}

        {/* Form */}
        <form className="lm-form" onSubmit={handleSignup} noValidate>
          {/* Email */}
          <div className="lm-field">
            <label className="lm-label">EMAIL ADDRESS</label>
            <div className={`lm-input-wrap ${focusedField === "email" ? "lm-focused" : ""}`}>
              <span className="lm-icon"><MailIcon /></span>
              <input
                id="su-email"
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
            <label className="lm-label">PASSWORD</label>
            <div className={`lm-input-wrap ${focusedField === "password" ? "lm-focused" : ""}`}>
              <span className="lm-icon"><LockIcon /></span>
              <input
                id="su-password"
                type={showPassword ? "text" : "password"}
                className="lm-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="lm-field">
            <label className="lm-label">CONFIRM PASSWORD</label>
            <div className={`lm-input-wrap ${focusedField === "confirm" ? "lm-focused" : ""}`}>
              <span className="lm-icon"><LockIcon /></span>
              <input
                id="su-confirm"
                type={showConfirm ? "text" : "password"}
                className="lm-input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField("confirm")}
                onBlur={() => setFocusedField(null)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="lm-eye"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Create Account */}
          <button
            id="su-submit-btn"
            type="submit"
            className={`lm-btn-primary ${loading ? "lm-loading" : ""}`}
            disabled={loading}
          >
            <UserPlusIcon />
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="lm-footer">
          Already have an account?{" "}
          <Link to="/" className="lm-signup-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
