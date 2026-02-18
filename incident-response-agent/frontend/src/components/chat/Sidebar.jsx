import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const HISTORY = [
  { id: "s1", title: "P0 CPU Spike Triage",  time: "Today" },
  { id: "s2", title: "DB Replication Lag",   time: "Today" },
  { id: "s3", title: "Payment SVC Errors",   time: "Yesterday" },
  { id: "s4", title: "K8s Node Memory",      time: "Yesterday" },
];

export default function Sidebar({ open, user, onNewChat, onSelectSession, activeSession }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  return (
    <div style={{ width: open ? 260 : 0, minWidth: open ? 260 : 0, background: "#09090f", borderRight: "1px solid #1e1e2e", display: "flex", flexDirection: "column", transition: "all 0.25s", overflow: "hidden" }}>
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1e1e2e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#f1f5f9", fontFamily: "'JetBrains Mono', monospace" }}>IRA DEVOPS</span>
        </div>
        <button onClick={onNewChat} style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", padding: "9px 0", fontSize: 11, letterSpacing: 1, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
          + NEW INCIDENT CHAT
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#374151", padding: "4px 8px 8px", fontFamily: "'JetBrains Mono', monospace" }}>RECENT CHATS</div>
        {HISTORY.map(c => (
          <div key={c.id} onClick={() => onSelectSession(c.id)} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: activeSession === c.id ? "#1e293b" : "transparent", border: activeSession === c.id ? "1px solid #334155" : "1px solid transparent" }}>
            <div style={{ fontSize: 12, color: activeSession === c.id ? "#e2e8f0" : "#6b7280", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'JetBrains Mono', monospace" }}>💬 {c.title}</div>
            <div style={{ fontSize: 10, color: "#374151", fontFamily: "'JetBrains Mono', monospace" }}>{c.time}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #1e1e2e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{user.avatar}</div>
          <div>
            <div style={{ fontSize: 12, color: "#f1f5f9", fontFamily: "'JetBrains Mono', monospace" }}>{user.name}</div>
            <div style={{ fontSize: 10, color: "#374151", fontFamily: "'JetBrains Mono', monospace" }}>{user.role}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} style={{ width: "100%", background: "transparent", border: "1px solid #1e293b", borderRadius: 7, color: "#4b5563", padding: "7px 0", fontSize: 10, letterSpacing: 1, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
          LOGOUT
        </button>
      </div>
    </div>
  );
}