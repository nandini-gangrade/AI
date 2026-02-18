import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api";

const iStyle = { width: "100%", background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "12px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none", boxSizing: "border-box" };

export default function LoginForm() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.user, data.token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div>
      {error && <div style={{ background: "#1a0505", border: "1px solid #ff3b3b44", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#ff3b3b", fontSize: 12 }}>⚠ {error}</div>}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>EMAIL</label>
        <input style={iStyle} type="email" placeholder="you@devteam.io" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 22 }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>PASSWORD</label>
        <input style={iStyle} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </div>
      <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "13px 0", background: loading ? "#1e293b" : "linear-gradient(135deg,#1d4ed8,#7c3aed)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? "SIGNING IN..." : "SIGN IN →"}
      </button>
    </div>
  );
}