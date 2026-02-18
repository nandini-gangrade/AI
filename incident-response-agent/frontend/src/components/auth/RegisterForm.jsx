import { useState } from "react";
import { registerUser } from "../../api";

const iStyle = { width: "100%", background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "12px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none", boxSizing: "border-box" };

export default function RegisterForm({ onSuccess }) {
  const [form, setForm]   = useState({ name: "", email: "", password: "", confirm: "", role: "SRE Engineer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("All fields required."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be 8+ characters."); return; }
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password, role: form.role });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value }) )});

  return (
    <div>
      {error && <div style={{ background: "#1a0505", border: "1px solid #ff3b3b44", borderRadius: 8, padding: "10px 14px", marginBottom: 14, color: "#ff3b3b", fontSize: 12 }}>⚠ {error}</div>}
      {[["name","FULL NAME","Alex Chen","text"],["email","EMAIL","you@devteam.io","email"],["password","PASSWORD","••••••••","password"],["confirm","CONFIRM PASSWORD","••••••••","password"]].map(([k, label, ph, type]) => (
        <div key={k} style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>{label}</label>
          <input style={iStyle} type={type} placeholder={ph} {...f(k)} />
        </div>
      ))}
      <div style={{ marginBottom: 22 }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>ROLE</label>
        <select style={{ ...iStyle, cursor: "pointer" }} {...f("role")}>
          {["SRE Engineer","DevOps Lead","Platform Engineer","Security Engineer","On-Call Manager"].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "13px 0", background: loading ? "#1e293b" : "linear-gradient(135deg,#1d4ed8,#7c3aed)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? "CREATING..." : "CREATE ACCOUNT →"}
      </button>
    </div>
  );
}