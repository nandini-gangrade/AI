export default function Topbar({ onToggleSidebar }) {
  return (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 14, background: "#09090f" }}>
      <button onClick={onToggleSidebar} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 18 }}>☰</button>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
      <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>Incident Response Agent</span>
      <span style={{ fontSize: 10, color: "#374151", background: "#1e293b", padding: "2px 8px", borderRadius: 4, letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>AI ONLINE</span>
    </div>
  );
}