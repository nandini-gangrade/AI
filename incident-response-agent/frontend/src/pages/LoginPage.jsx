import { useState } from "react";
import LoginForm    from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [success, setSuccess] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "#07070d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#f1f5f9", letterSpacing: 1 }}>IRA DEVOPS</span>
          </div>
          <div style={{ color: "#4b5563", fontSize: 11, letterSpacing: 2 }}>INCIDENT RESPONSE AGENT</div>
        </div>

        <div style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "#07070d", borderRadius: 8, padding: 4, border: "1px solid #1e1e2e", marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setSuccess(""); }} style={{
                flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 1, fontWeight: 700,
                background: mode === m ? "#1e293b" : "transparent", color: mode === m ? "#e2e8f0" : "#374151",
              }}>{m === "login" ? "SIGN IN" : "REGISTER"}</button>
            ))}
          </div>

          {success && <div style={{ background: "#030f06", border: "1px solid #22c55e44", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#22c55e", fontSize: 12 }}>✓ {success}</div>}

          {mode === "login"
            ? <LoginForm />
            : <RegisterForm onSuccess={() => { setSuccess("Account created! Sign in now."); setMode("login"); }} />
          }
        </div>
      </div>
    </div>
  );
}