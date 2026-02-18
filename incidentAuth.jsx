import { useState, useEffect } from "react";

// Mock user database
const MOCK_USERS = [
  { email: "ops@devteam.io", password: "Incident@123", name: "Ops Admin", role: "Senior SRE", avatar: "OA" },
  { email: "sre@devteam.io", password: "AlertNow#99", name: "Alex Chen", role: "DevOps Lead", avatar: "AC" },
];

const SEVERITY_LABELS = ["P0", "P1", "P2", "P3"];
const LIVE_ALERTS = [
  { id: 1, msg: "CPU spike detected — prod-cluster-07", sev: "P0", time: "00:32" },
  { id: 2, msg: "DB replication lag > 5s — us-east-1", sev: "P1", time: "01:14" },
  { id: 3, msg: "API error rate 12% — payment-svc", sev: "P1", time: "02:07" },
  { id: 4, msg: "Memory pressure — k8s node pool B", sev: "P2", time: "04:55" },
];

const SEV_COLOR = { P0: "#ff3b3b", P1: "#ff8c00", P2: "#f5c518", P3: "#4caf50" };

function TickerBar() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LIVE_ALERTS.length), 3000);
    return () => clearInterval(t);
  }, []);
  const alert = LIVE_ALERTS[idx];
  return (
    <div style={{
      background: "#0a0a0f",
      borderBottom: "1px solid #1e1e2e",
      padding: "8px 24px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace",
      color: "#6b7280",
      position: "relative",
      overflow: "hidden",
    }}>
      <span style={{ color: "#3b82f6", fontWeight: 700, letterSpacing: 2, fontSize: 10 }}>● LIVE</span>
      <span style={{ color: SEV_COLOR[alert.sev], fontWeight: 700, padding: "1px 6px", border: `1px solid ${SEV_COLOR[alert.sev]}33`, borderRadius: 3 }}>{alert.sev}</span>
      <span style={{ color: "#9ca3af", flex: 1 }}>{alert.msg}</span>
      <span style={{ color: "#4b5563" }}>{alert.time}s ago</span>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [activeAlerts] = useState(LIVE_ALERTS);
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07070d",
      fontFamily: "'JetBrains Mono', monospace",
      color: "#e2e8f0",
    }}>
      <TickerBar />
      {/* Top Nav */}
      <nav style={{
        padding: "16px 32px",
        borderBottom: "1px solid #1e1e2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#09090f",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>INCIDENT RESPONSE AGENT</span>
          <span style={{ background: "#1e293b", color: "#64748b", fontSize: 10, padding: "2px 8px", borderRadius: 4, letterSpacing: 2 }}>DEVOPS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ color: "#4b5563", fontSize: 12 }}>{time.toUTCString().slice(0, -4)} UTC</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{user.avatar}</div>
            <div>
              <div style={{ fontSize: 12, color: "#f1f5f9" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "#4b5563" }}>{user.role}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ background: "transparent", border: "1px solid #1e293b", color: "#64748b", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
            onMouseOver={e => { e.target.style.borderColor = "#ff3b3b"; e.target.style.color = "#ff3b3b"; }}
            onMouseOut={e => { e.target.style.borderColor = "#1e293b"; e.target.style.color = "#64748b"; }}>
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Dashboard Body */}
      <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "ACTIVE INCIDENTS", val: "4", color: "#ff3b3b", sub: "2 critical" },
            { label: "MTTR (AVG)", val: "23m", color: "#f5c518", sub: "↑ 4m from yesterday" },
            { label: "SERVICES HEALTHY", val: "94%", color: "#22c55e", sub: "47 of 50 services" },
            { label: "ON-CALL NOW", val: "3", color: "#3b82f6", sub: "engineers active" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#0d0d1a",
              border: "1px solid #1e1e2e",
              borderRadius: 12,
              padding: "20px 24px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.7 }} />
              <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 2, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#374151" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Alert Table */}
        <div style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, letterSpacing: 2, color: "#94a3b8" }}>ACTIVE INCIDENTS</span>
            <span style={{ fontSize: 10, color: "#22c55e", background: "#052e16", padding: "3px 10px", borderRadius: 20, border: "1px solid #16a34a33" }}>● AUTO-REFRESHING</span>
          </div>
          {activeAlerts.map((a, i) => (
            <div key={a.id} style={{
              padding: "16px 24px",
              borderBottom: i < activeAlerts.length - 1 ? "1px solid #111827" : "none",
              display: "flex",
              alignItems: "center",
              gap: 16,
              transition: "background 0.15s",
              cursor: "pointer",
            }}
              onMouseOver={e => e.currentTarget.style.background = "#111827"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ color: SEV_COLOR[a.sev], fontWeight: 700, fontSize: 11, padding: "2px 8px", border: `1px solid ${SEV_COLOR[a.sev]}44`, borderRadius: 4, minWidth: 36, textAlign: "center" }}>{a.sev}</span>
              <span style={{ flex: 1, color: "#cbd5e1", fontSize: 13 }}>{a.msg}</span>
              <span style={{ fontSize: 11, color: "#374151" }}>{a.time}s ago</span>
              <button style={{ background: "#1e293b", border: "none", color: "#94a3b8", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>TRIAGE →</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, padding: "16px 24px", background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12, color: "#4b5563" }}>AI Agent is monitoring all systems. Last scan: <span style={{ color: "#22c55e" }}>2 seconds ago</span>. Runbooks loaded: <span style={{ color: "#3b82f6" }}>142</span>.</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("login"); // login | register | dashboard
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(MOCK_USERS);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "SRE Engineer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showCreds, setShowCreds] = useState(false);
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const found = users.find(u => u.email === form.email && u.password === form.password);
    if (found) { setUser(found); setMode("dashboard"); }
    else setError("Invalid credentials. Check email or password.");
    setLoading(false);
  };

  const handleRegister = async () => {
    setError(""); setSuccess("");
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("All fields are required."); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError("Enter a valid email address."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (users.find(u => u.email === form.email)) { setError("Email already registered."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const newUser = { email: form.email, password: form.password, name: form.name, role: form.role, avatar: form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) };
    setUsers(prev => [...prev, newUser]);
    setSuccess("Account created! You can now sign in.");
    setMode("login");
    setForm(f => ({ ...f, name: "", password: "", confirm: "" }));
    setLoading(false);
  };

  if (mode === "dashboard") return <Dashboard user={user} onLogout={() => { setUser(null); setMode("login"); setForm({ name: "", email: "", password: "", confirm: "", role: "SRE Engineer" }); }} />;

  const inputStyle = {
    width: "100%",
    background: "#0d0d1a",
    border: "1px solid #1e1e2e",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#e2e8f0",
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07070d",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'JetBrains Mono', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      {/* Glow */}
      <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, #1d4ed833 0%, transparent 70%)", pointerEvents: "none" }} />

      <TickerBar />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18 }}>⚡</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1, color: "#f1f5f9" }}>IRA</span>
              <span style={{ fontSize: 10, color: "#374151", letterSpacing: 3, paddingTop: 4 }}>DEVOPS</span>
            </div>
            <div style={{ color: "#4b5563", fontSize: 12, letterSpacing: 1 }}>INCIDENT RESPONSE AGENT</div>
          </div>

          {/* Card */}
          <div style={{
            background: "#0d0d1a",
            border: "1px solid #1e1e2e",
            borderRadius: 16,
            padding: "32px",
            boxShadow: "0 0 60px #1d4ed811",
          }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "#07070d", borderRadius: 8, padding: 4, border: "1px solid #1e1e2e" }}>
              {["login", "register"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  letterSpacing: 1,
                  fontWeight: 700,
                  transition: "all 0.2s",
                  background: mode === m ? "#1e293b" : "transparent",
                  color: mode === m ? "#e2e8f0" : "#374151",
                }}>
                  {m === "login" ? "SIGN IN" : "REGISTER"}
                </button>
              ))}
            </div>

            {error && (
              <div style={{ background: "#1a0505", border: "1px solid #ff3b3b44", borderRadius: 8, padding: "10px 14px", marginBottom: 20, color: "#ff3b3b", fontSize: 12 }}>
                ⚠ {error}
              </div>
            )}
            {success && (
              <div style={{ background: "#030f06", border: "1px solid #22c55e44", borderRadius: 8, padding: "10px 14px", marginBottom: 20, color: "#22c55e", fontSize: 12 }}>
                ✓ {success}
              </div>
            )}

            {mode === "register" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>FULL NAME</label>
                <input style={inputStyle} placeholder="Alex Chen" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "#1e1e2e"} />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>EMAIL</label>
              <input style={inputStyle} type="email" placeholder="you@devteam.io" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "#1e1e2e"} />
            </div>

            <div style={{ marginBottom: mode === "register" ? 16 : 24, position: "relative" }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>PASSWORD</label>
              <input style={inputStyle} type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "#1e1e2e"}
                onKeyDown={e => e.key === "Enter" && mode === "login" && handleLogin()} />
              <button onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 12, top: 32, background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 13 }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>

            {mode === "register" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>CONFIRM PASSWORD</label>
                  <input style={inputStyle} type="password" placeholder="••••••••" value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = "#3b82f6"}
                    onBlur={e => e.target.style.borderColor = "#1e1e2e"} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>ROLE</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {["SRE Engineer", "DevOps Lead", "Platform Engineer", "Security Engineer", "On-Call Manager"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </>
            )}

            <button onClick={mode === "login" ? handleLogin : handleRegister} disabled={loading} style={{
              width: "100%",
              padding: "13px 0",
              background: loading ? "#1e293b" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.5,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "AUTHENTICATING..." : mode === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
            </button>
          </div>

          {/* Mock Credentials */}
          {mode === "login" && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => setShowCreds(p => !p)} style={{
                width: "100%",
                background: "#0d0d1a",
                border: "1px dashed #1e293b",
                borderRadius: 10,
                padding: "10px 16px",
                color: "#374151",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                cursor: "pointer",
                letterSpacing: 1,
              }}>
                {showCreds ? "▲ HIDE" : "▼ SHOW"} MOCK CREDENTIALS
              </button>
              {showCreds && (
                <div style={{ background: "#0d0d1a", border: "1px solid #1e293b", borderRadius: 10, padding: 16, marginTop: 4 }}>
                  <div style={{ fontSize: 10, color: "#374151", letterSpacing: 2, marginBottom: 12 }}>TEST ACCOUNTS</div>
                  {MOCK_USERS.map(u => (
                    <div key={u.email} style={{ marginBottom: 10, padding: "10px 12px", background: "#07070d", borderRadius: 8, border: "1px solid #111827", cursor: "pointer" }}
                      onClick={() => { setForm(f => ({ ...f, email: u.email, password: u.password })); }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ color: "#3b82f6", fontSize: 12 }}>{u.name}</span>
                        <span style={{ fontSize: 10, color: "#4b5563", background: "#1e293b", padding: "1px 6px", borderRadius: 4 }}>{u.role}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        <span style={{ color: "#94a3b8" }}>{u.email}</span>
                        <span style={{ color: "#374151", margin: "0 8px" }}>|</span>
                        <span style={{ color: "#94a3b8" }}>{u.password}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#1d4ed8", marginTop: 4 }}>Click to autofill ↑</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 20, color: "#1e293b", fontSize: 10, letterSpacing: 1 }}>
            SECURED · TLS 1.3 · SOC2 COMPLIANT
          </div>
        </div>
      </div>
    </div>
  );
}
