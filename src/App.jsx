import { useState, useRef, useEffect } from "react";

const MOCK_USERS = [
  { email: "ops@devteam.io", password: "Incident@123", name: "Ops Admin", role: "Senior SRE", avatar: "OA" },
  { email: "sre@devteam.io", password: "AlertNow#99", name: "Alex Chen", role: "DevOps Lead", avatar: "AC" },
];

const SUGGESTED = [
  "What's the current P0 incident status?",
  "Show me recent alert history",
  "How do I escalate a P1 incident?",
  "Generate an incident report",
];

const BOT_RESPONSES = {
  default: "I'm the Incident Response Agent. I can help you triage alerts, escalate incidents, pull runbooks, and generate reports. What do you need?",
  p0: "🔴 **P0 Active:** CPU spike on prod-cluster-07 (00:32s). Recommended action: Scale horizontally via `kubectl scale deployment app --replicas=6`. Runbook: RB-2041.",
  alert: "📋 **Recent Alerts:**\n- P0 · CPU spike — prod-cluster-07 · 32s ago\n- P1 · DB replication lag >5s — us-east-1 · 74s ago\n- P1 · API error rate 12% — payment-svc · 127s ago\n- P2 · Memory pressure — k8s node pool B · 295s ago",
  escalate: "📣 **Escalation Steps for P1:**\n1. Confirm impact scope\n2. Page on-call lead via PagerDuty\n3. Open war room in Slack #incident-p1\n4. Update status page within 10 min\n5. Assign incident commander",
  report: "📝 **Incident Report Draft:**\n**Title:** API Error Rate Spike\n**Severity:** P1\n**Start:** 2026-02-18 14:32 UTC\n**Impact:** 12% error rate on payment-svc\n**Root Cause:** TBD — under investigation\n**Next Steps:** Review logs, rollback v2.3.1",
};

function getBotReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes("p0") || m.includes("cpu") || m.includes("status")) return BOT_RESPONSES.p0;
  if (m.includes("alert") || m.includes("history") || m.includes("recent")) return BOT_RESPONSES.alert;
  if (m.includes("escalat")) return BOT_RESPONSES.escalate;
  if (m.includes("report")) return BOT_RESPONSES.report;
  return BOT_RESPONSES.default;
}

const CHAT_HISTORY = [
  { id: 1, title: "P0 CPU Spike Triage", time: "Today" },
  { id: 2, title: "DB Replication Lag", time: "Today" },
  { id: 3, title: "Payment SVC Errors", time: "Yesterday" },
  { id: 4, title: "K8s Node Memory", time: "Yesterday" },
  { id: 5, title: "Deployment Rollback", time: "Feb 16" },
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 20 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2 }}>⚡</div>
      )}
      <div style={{
        maxWidth: "72%",
        background: isUser ? "linear-gradient(135deg,#1d4ed8,#7c3aed)" : "#0d0d1a",
        border: isUser ? "none" : "1px solid #1e1e2e",
        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
        padding: "12px 16px",
        color: "#e2e8f0",
        fontSize: 13,
        lineHeight: 1.7,
        fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: "pre-line",
      }}>
        {msg.text}
      </div>
      {isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", flexShrink: 0, marginTop: 2 }}>
          {msg.avatar}
        </div>
      )}
    </div>
  );
}

function Chatbot({ user, onLogout }) {
  const [messages, setMessages] = useState([{ id: 1, role: "bot", text: `Hey ${user.name.split(" ")[0]} 👋 I'm your Incident Response Agent. Ask me anything about active incidents, alerts, runbooks, or escalations.` }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChat, setActiveChat] = useState(1);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: msg, avatar: user.avatar }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    setTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: getBotReply(msg) }]);
  };

  return (
    <div style={{ height: "100vh", display: "flex", background: "#07070d", fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        background: "#09090f",
        borderRight: "1px solid #1e1e2e",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s ease",
        overflow: "hidden",
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1e1e2e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>IRA DEVOPS</span>
          </div>
          <button onClick={() => { setMessages([{ id: Date.now(), role: "bot", text: "New session started. How can I help?" }]); }} style={{
            width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
            color: "#94a3b8", padding: "9px 0", fontSize: 11, letterSpacing: 1, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
          }}>+ NEW INCIDENT CHAT</button>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#374151", padding: "4px 8px 8px" }}>RECENT CHATS</div>
          {CHAT_HISTORY.map(c => (
            <div key={c.id} onClick={() => setActiveChat(c.id)} style={{
              padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
              background: activeChat === c.id ? "#1e293b" : "transparent",
              border: activeChat === c.id ? "1px solid #334155" : "1px solid transparent",
              transition: "all 0.15s",
            }}
              onMouseOver={e => { if (activeChat !== c.id) e.currentTarget.style.background = "#111827"; }}
              onMouseOut={e => { if (activeChat !== c.id) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ fontSize: 12, color: activeChat === c.id ? "#e2e8f0" : "#6b7280", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>💬 {c.title}</div>
              <div style={{ fontSize: 10, color: "#374151" }}>{c.time}</div>
            </div>
          ))}
        </div>

        {/* User Info */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1e1e2e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{user.avatar}</div>
            <div>
              <div style={{ fontSize: 12, color: "#f1f5f9" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "#374151" }}>{user.role}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: "100%", background: "transparent", border: "1px solid #1e293b", borderRadius: 7,
            color: "#4b5563", padding: "7px 0", fontSize: 10, letterSpacing: 1, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s",
          }}
            onMouseOver={e => { e.target.style.color = "#ff3b3b"; e.target.style.borderColor = "#ff3b3b33"; }}
            onMouseOut={e => { e.target.style.color = "#4b5563"; e.target.style.borderColor = "#1e293b"; }}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top Bar */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 14, background: "#09090f" }}>
          <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>☰</button>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>Incident Response Agent</span>
          <span style={{ fontSize: 10, color: "#374151", background: "#1e293b", padding: "2px 8px", borderRadius: 4, letterSpacing: 1 }}>AI ONLINE</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {messages.map(m => <Message key={m.id} msg={m} />)}
          {typing && (
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
              <div style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: "4px 18px 18px 18px", padding: "14px 18px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div style={{ padding: "0 32px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 20,
              color: "#6b7280", fontSize: 11, padding: "6px 14px", cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s",
            }}
              onMouseOver={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.color = "#93c5fd"; }}
              onMouseOut={e => { e.target.style.borderColor = "#1e1e2e"; e.target.style.color = "#6b7280"; }}>
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 32px 24px" }}>
          <div style={{ display: "flex", gap: 10, background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: "4px 4px 4px 16px", alignItems: "flex-end" }}>
            <textarea
              rows={1}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about incidents, alerts, runbooks..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#e2e8f0", fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                resize: "none", padding: "10px 0", lineHeight: 1.6, maxHeight: 120, overflowY: "auto",
              }}
            />
            <button onClick={() => send()} disabled={!input.trim() || typing} style={{
              background: input.trim() && !typing ? "linear-gradient(135deg,#1d4ed8,#7c3aed)" : "#1e293b",
              border: "none", borderRadius: 9, width: 40, height: 40, cursor: input.trim() && !typing ? "pointer" : "not-allowed",
              color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0, marginBottom: 2,
            }}>↑</button>
          </div>
          <div style={{ textAlign: "center", fontSize: 10, color: "#1e293b", marginTop: 8, letterSpacing: 1 }}>PRESS ENTER TO SEND · SHIFT+ENTER FOR NEW LINE</div>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#07070d} ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
      `}</style>
    </div>
  );
}

// ── Auth ──────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 8,
  padding: "12px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
};

export default function App() {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(MOCK_USERS);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "SRE Engineer" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  const handleLogin = async () => {
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const found = users.find(u => u.email === form.email && u.password === form.password);
    if (found) { setUser(found); }
    else setError("Invalid credentials.");
    setLoading(false);
  };

  const handleRegister = async () => {
    setError(""); setSuccess("");
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("All fields are required."); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError("Enter a valid email."); return; }
    if (form.password.length < 8) { setError("Password must be 8+ characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (users.find(u => u.email === form.email)) { setError("Email already registered."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const newUser = { email: form.email, password: form.password, name: form.name, role: form.role, avatar: form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) };
    setUsers(prev => [...prev, newUser]);
    setSuccess("Account created! Sign in now.");
    setMode("login");
    setForm(f => ({ ...f, name: "", password: "", confirm: "" }));
    setLoading(false);
  };

  if (user) return <Chatbot user={user} onLogout={() => { setUser(null); setForm({ name: "", email: "", password: "", confirm: "", role: "SRE Engineer" }); }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#07070d", display: "flex", flexDirection: "column", fontFamily: "'JetBrains Mono', monospace", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse,#1d4ed833 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</div>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1, color: "#f1f5f9" }}>IRA</span>
              <span style={{ fontSize: 10, color: "#374151", letterSpacing: 3, paddingTop: 4 }}>DEVOPS</span>
            </div>
            <div style={{ color: "#4b5563", fontSize: 12, letterSpacing: 1 }}>INCIDENT RESPONSE AGENT</div>
          </div>

          <div style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 32, boxShadow: "0 0 60px #1d4ed811" }}>
            <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "#07070d", borderRadius: 8, padding: 4, border: "1px solid #1e1e2e" }}>
              {["login", "register"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
                  flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 1, fontWeight: 700,
                  background: mode === m ? "#1e293b" : "transparent", color: mode === m ? "#e2e8f0" : "#374151", transition: "all 0.2s",
                }}>{m === "login" ? "SIGN IN" : "REGISTER"}</button>
              ))}
            </div>

            {error && <div style={{ background: "#1a0505", border: "1px solid #ff3b3b44", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#ff3b3b", fontSize: 12 }}>⚠ {error}</div>}
            {success && <div style={{ background: "#030f06", border: "1px solid #22c55e44", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#22c55e", fontSize: 12 }}>✓ {success}</div>}

            {mode === "register" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>FULL NAME</label>
                <input style={inputStyle} placeholder="Alex Chen" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onFocus={e => e.target.style.borderColor = "#3b82f6"} onBlur={e => e.target.style.borderColor = "#1e1e2e"} />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>EMAIL</label>
              <input style={inputStyle} type="email" placeholder="you@devteam.io" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onFocus={e => e.target.style.borderColor = "#3b82f6"} onBlur={e => e.target.style.borderColor = "#1e1e2e"} />
            </div>
            <div style={{ marginBottom: mode === "register" ? 14 : 22, position: "relative" }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>PASSWORD</label>
              <input style={inputStyle} type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onFocus={e => e.target.style.borderColor = "#3b82f6"} onBlur={e => e.target.style.borderColor = "#1e1e2e"} onKeyDown={e => e.key === "Enter" && mode === "login" && handleLogin()} />
              <button onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 12, top: 30, background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 13 }}>{showPass ? "🙈" : "👁"}</button>
            </div>
            {mode === "register" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>CONFIRM PASSWORD</label>
                  <input style={inputStyle} type="password" placeholder="••••••••" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} onFocus={e => e.target.style.borderColor = "#3b82f6"} onBlur={e => e.target.style.borderColor = "#1e1e2e"} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>ROLE</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {["SRE Engineer", "DevOps Lead", "Platform Engineer", "Security Engineer", "On-Call Manager"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </>
            )}
            <button onClick={mode === "login" ? handleLogin : handleRegister} disabled={loading} style={{
              width: "100%", padding: "13px 0", background: loading ? "#1e293b" : "linear-gradient(135deg,#1d4ed8,#7c3aed)",
              border: "none", borderRadius: 8, color: "#fff", fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13, fontWeight: 700, letterSpacing: 1.5, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "AUTHENTICATING..." : mode === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
            </button>
          </div>

          {mode === "login" && (
            <div style={{ marginTop: 14 }}>
              <button onClick={() => setShowCreds(p => !p)} style={{ width: "100%", background: "#0d0d1a", border: "1px dashed #1e293b", borderRadius: 10, padding: "10px 16px", color: "#374151", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: "pointer", letterSpacing: 1 }}>
                {showCreds ? "▲ HIDE" : "▼ SHOW"} MOCK CREDENTIALS
              </button>
              {showCreds && (
                <div style={{ background: "#0d0d1a", border: "1px solid #1e293b", borderRadius: 10, padding: 14, marginTop: 4 }}>
                  {MOCK_USERS.map(u => (
                    <div key={u.email} onClick={() => setForm(f => ({ ...f, email: u.email, password: u.password }))} style={{ marginBottom: 8, padding: "10px 12px", background: "#07070d", borderRadius: 8, border: "1px solid #111827", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "#3b82f6", fontSize: 12 }}>{u.name}</span>
                        <span style={{ fontSize: 10, color: "#4b5563", background: "#1e293b", padding: "1px 6px", borderRadius: 4 }}>{u.role}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{u.email} · {u.password}</div>
                      <div style={{ fontSize: 10, color: "#1d4ed8", marginTop: 4 }}>Click to autofill ↑</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
