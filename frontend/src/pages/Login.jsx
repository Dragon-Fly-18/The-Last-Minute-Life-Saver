import { useState } from "react";

const styles = {
  root: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#1e1b2e",
    color: "#f0eeff",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    display: "flex",
    width: "900px",
    maxWidth: "100%",
    minHeight: "520px",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
  },
  left: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    minHeight: "400px",
  },
  leftBg: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(160deg, #2d1b6e 0%, #4a1a6b 35%, #6b2a8a 60%, #3d1060 100%)",
  },
  skyOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(20,10,50,0.9) 0%, rgba(60,20,90,0.6) 40%, rgba(80,30,100,0.3) 70%, transparent 100%)",
  },
  logo: {
    position: "absolute",
    top: 24,
    left: 28,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 2,
    color: "#fff",
    textTransform: "uppercase",
    zIndex: 2,
  },
  backBtn: {
    position: "absolute",
    top: 22,
    right: 20,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 20,
    padding: "5px 14px",
    zIndex: 2,
    cursor: "pointer",
    background: "transparent",
  },
  tagline: {
    position: "absolute",
    bottom: 52,
    left: 28,
    right: 28,
    zIndex: 2,
  },
  taglineText: {
    fontSize: 22,
    fontWeight: 600,
    lineHeight: 1.3,
    color: "#fff",
    textShadow: "0 2px 12px rgba(0,0,0,0.6)",
  },
  dots: {
    position: "absolute",
    bottom: 22,
    left: 28,
    display: "flex",
    gap: 6,
    zIndex: 2,
  },
  dot: {
    height: 3,
    borderRadius: 2,
    background: "rgba(255,255,255,0.35)",
    width: 20,
  },
  dotActive: {
    height: 3,
    borderRadius: 2,
    background: "rgba(255,255,255,0.85)",
    width: 28,
  },
  right: {
    width: 380,
    flexShrink: 0,
    background: "#26223a",
    padding: "48px 36px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtext: {
    fontSize: 12.5,
    color: "#9d97c4",
    marginBottom: 28,
  },
  link: {
    color: "#6c5ce7",
    textDecoration: "none",
    fontWeight: 500,
    cursor: "pointer",
  },
  fieldFull: {
    marginBottom: 12,
  },
  input: {
    width: "100%",
    background: "#2e2a42",
    border: "1px solid #3d3860",
    borderRadius: 8,
    padding: "11px 14px",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    color: "#f0eeff",
    outline: "none",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#6c5ce7",
    boxShadow: "0 0 0 3px rgba(108,92,231,0.25)",
  },
  passwordWrap: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b6690",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 20,
    marginTop: 4,
  },
  forgotLink: {
    fontSize: 12,
    color: "#6c5ce7",
    cursor: "pointer",
    textDecoration: "none",
  },
  btnPrimary: {
    width: "100%",
    padding: "12px",
    background: "#6c5ce7",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    marginBottom: 0,
  },
  orDivider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "18px 0",
    fontSize: 11,
    color: "#6b6690",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#3a3558",
  },
  row: {
    display: "flex",
    gap: 10,
  },
  btnSocial: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px",
    background: "#2e2a42",
    border: "1px solid #3d3860",
    borderRadius: 8,
    color: "#f0eeff",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    cursor: "pointer",
  },
};

const DesertScene = () => (
  <svg
    viewBox="0 0 460 560"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
  >
    <defs>
      <linearGradient id="lg-skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0f0520" />
        <stop offset="40%" stopColor="#2e0e50" />
        <stop offset="70%" stopColor="#5a1a70" />
        <stop offset="100%" stopColor="#7a2a8a" />
      </linearGradient>
      <linearGradient id="lg-dune1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4a2060" />
        <stop offset="100%" stopColor="#1a0830" />
      </linearGradient>
      <linearGradient id="lg-dune2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3a1850" />
        <stop offset="100%" stopColor="#120620" />
      </linearGradient>
      <linearGradient id="lg-dune3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2a1040" />
        <stop offset="100%" stopColor="#0c0418" />
      </linearGradient>
      <radialGradient id="lg-glow" cx="50%" cy="30%" r="40%">
        <stop offset="0%" stopColor="rgba(180,120,255,0.15)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="460" height="560" fill="url(#lg-skyGrad)" />
    <ellipse cx="230" cy="180" rx="200" ry="150" fill="url(#lg-glow)" />
    <g fill="white" opacity="0.7">
      <circle cx="40" cy="30" r="1" /><circle cx="80" cy="55" r="0.7" />
      <circle cx="130" cy="20" r="1.2" /><circle cx="180" cy="48" r="0.8" />
      <circle cx="220" cy="15" r="1" /><circle cx="260" cy="60" r="0.6" />
      <circle cx="310" cy="25" r="1.1" /><circle cx="360" cy="42" r="0.9" />
      <circle cx="400" cy="18" r="0.7" /><circle cx="440" cy="70" r="1" />
      <circle cx="60" cy="90" r="0.8" /><circle cx="150" cy="80" r="1.1" />
      <circle cx="280" cy="85" r="0.7" /><circle cx="420" cy="100" r="0.9" />
    </g>
    <path d="M0,340 C60,290 120,270 200,280 C280,290 320,260 380,270 C420,276 450,285 460,295 L460,560 L0,560 Z"
      fill="url(#lg-dune3)" opacity="0.9" />
    <path d="M0,390 C30,350 90,320 170,335 C250,350 290,310 380,325 C420,333 450,345 460,355 L460,560 L0,560 Z"
      fill="url(#lg-dune2)" />
    <path d="M0,390 C30,350 90,320 170,335 C250,350 290,310 380,325 C420,333 450,345 460,355"
      fill="none" stroke="rgba(200,150,255,0.18)" strokeWidth="1.5" />
    <path d="M0,450 C40,410 100,385 180,400 C240,412 280,380 360,395 C400,403 440,420 460,430 L460,560 L0,560 Z"
      fill="url(#lg-dune1)" />
    <path d="M0,450 C40,410 100,385 180,400 C240,412 280,380 360,395 C400,403 440,420 460,430"
      fill="none" stroke="rgba(220,160,255,0.25)" strokeWidth="2" />
    <rect x="0" y="490" width="460" height="70" fill="#0c0418" />
  </svg>
);

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function Login({ onSwitchToSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const inputStyle = (name) => ({
    ...styles.input,
    ...(focusedField === name ? styles.inputFocus : {}),
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", form);
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Left Panel */}
        <div style={styles.left}>
          <div style={styles.leftBg} />
          <DesertScene />
          <div style={styles.skyOverlay} />
          <div style={styles.logo}>AMU</div>
          <button style={styles.backBtn}>Back to website →</button>
          <div style={styles.tagline}>
            <p style={styles.taglineText}>Capturing Moments,<br />Creating Memories</p>
          </div>
          <div style={styles.dots}>
            <span style={styles.dotActive} />
            <span style={styles.dot} />
            <span style={styles.dot} />
          </div>
        </div>

        {/* Right Panel */}
        <div style={styles.right}>
          <h1 style={styles.heading}>Welcome back</h1>
          <p style={styles.subtext}>
            Don't have an account?{" "}
            <span style={styles.link} onClick={onSwitchToSignup}>Sign up</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div style={styles.fieldFull}>
              <input
                style={inputStyle("email")}
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div style={{ ...styles.fieldFull, ...styles.passwordWrap }}>
              <input
                style={{ ...inputStyle("password"), paddingRight: 38 }}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>

            <div style={styles.forgotRow}>
              <span style={styles.forgotLink}>Forgot password?</span>
            </div>

            <button type="submit" style={styles.btnPrimary}>Log in</button>
          </form>

          <div style={styles.orDivider}>
            <div style={styles.dividerLine} />
            or continue with
            <div style={styles.dividerLine} />
          </div>

          <div style={styles.row}>
            <button style={styles.btnSocial}>
              <GoogleIcon /> Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}