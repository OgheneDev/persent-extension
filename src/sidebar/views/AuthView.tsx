import { useState } from "react";
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const T = {
  bg: "#090e1a",
  surface: "#111827",
  inputBg: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.06)",
  accent: "#10b981",
  accentGlow: "rgba(16, 185, 129, 0.15)",
  textPrimary: "#ffffff",
  textSecondary: "#94a3b8",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.1)",
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
  
  .auth-root {
    font-family: 'Sora', sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: ${T.bg};
    color: ${T.textPrimary};
  }
  
  .glass-input {
    width: 100%;
    padding: 12px 42px;
    background: ${T.inputBg};
    border: 1px solid ${T.border};
    border-radius: 14px;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    color: white;
    transition: all 0.3s ease;
  }

  .glass-input:focus {
    border-color: ${T.accent};
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 20px ${T.accentGlow};
    outline: none;
  }

  .auth-btn {
    width: 100%;
    padding: 16px;
    border: none;
    background: ${T.accent};
    color: ${T.bg};
    font-family: 'Sora', sans-serif;
    font-weight: 600; /* Medium weight as requested */
    border-radius: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
  }

  .auth-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }

  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function AuthView({ onLogin, onRegister }: any) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await onLogin(email, password);
      else await onRegister(name, email, password);
    } catch (err: any) {
      setError(err.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <style>{globalCss}</style>

      {/* Header with Logo SVG (No Background) */}
      <div style={{ padding: "48px 32px 24px" }}>
        <div style={{ marginBottom: 20 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4.5 20.29C4.21 21 4.7 21.75 5.45 21.75H12V2Z"
              fill={T.accent}
            />
            <path
              d="M12 2L19.5 20.29C19.79 21 19.3 21.75 18.55 21.75H12V2Z"
              fill={T.accent}
              fillOpacity="0.4"
            />
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 4 }}>
          Outreach with{" "}
          <span style={{ color: T.accent, fontWeight: 500 }}>Persent</span>
        </p>
      </div>

      {/* Form Section */}
      <div
        style={{
          padding: "0 32px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {mode === "register" && (
          <div style={{ position: "relative" }}>
            <User
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: 13,
                color: T.textSecondary,
              }}
            />
            <input
              className="glass-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div style={{ position: "relative" }}>
          <Mail
            size={18}
            style={{
              position: "absolute",
              left: 14,
              top: 13,
              color: T.textSecondary,
            }}
          />
          <input
            className="glass-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ position: "relative" }}>
          <Lock
            size={18}
            style={{
              position: "absolute",
              left: 14,
              top: 13,
              color: T.textSecondary,
            }}
          />
          <input
            type={visible ? "text" : "password"}
            className="glass-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            style={{
              position: "absolute",
              right: 14,
              top: 13,
              background: "none",
              border: "none",
              color: T.textSecondary,
              cursor: "pointer",
            }}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              background: T.dangerDim,
              borderRadius: 12,
              border: `1px solid rgba(248,113,113,0.1)`,
            }}
          >
            <AlertCircle size={16} color={T.danger} />
            <span style={{ fontSize: 12, color: T.danger }}>{error}</span>
          </div>
        )}

        <button
          className="auth-btn"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin" />
              <span>Please wait...</span>
            </>
          ) : (
            <>
              <span>{mode === "login" ? "Sign In" : "Register"}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* Footer Switcher */}
      <div style={{ marginTop: "auto", padding: "32px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: T.textSecondary }}>
          {mode === "login" ? "Don't have an account?" : "Already a member?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: T.accent,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Sora",
            }}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
