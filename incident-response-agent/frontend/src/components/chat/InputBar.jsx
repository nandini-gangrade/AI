import { useState } from "react";

export default function InputBar({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div style={{ padding: "12px 32px 24px" }}>
      <div style={{ display: "flex", gap: 10, background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: "4px 4px 4px 16px", alignItems: "flex-end" }}>
        <textarea
          rows={1}
          value={input}
          onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
          placeholder="Ask about incidents, alerts, runbooks..."
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", resize: "none", padding: "10px 0", lineHeight: 1.6, maxHeight: 120, overflowY: "auto" }}
        />
        <button onClick={send} disabled={!input.trim() || disabled} style={{ background: input.trim() && !disabled ? "linear-gradient(135deg,#1d4ed8,#7c3aed)" : "#1e293b", border: "none", borderRadius: 9, width: 40, height: 40, cursor: input.trim() && !disabled ? "pointer" : "not-allowed", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>↑</button>
      </div>
      <div style={{ textAlign: "center", fontSize: 10, color: "#1e293b", marginTop: 8, letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>PRESS ENTER TO SEND · SHIFT+ENTER FOR NEW LINE</div>
    </div>
  );
}