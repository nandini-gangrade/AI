export default function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 20 }}>
      {!isUser && <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⚡</div>}
      <div style={{ maxWidth: "72%", background: isUser ? "linear-gradient(135deg,#1d4ed8,#7c3aed)" : "#0d0d1a", border: isUser ? "none" : "1px solid #1e1e2e", borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px", padding: "12px 16px", color: "#e2e8f0", fontSize: 13, lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-line" }}>
        {msg.text}
      </div>
      {isUser && <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", flexShrink: 0 }}>{msg.avatar}</div>}
    </div>
  );
}