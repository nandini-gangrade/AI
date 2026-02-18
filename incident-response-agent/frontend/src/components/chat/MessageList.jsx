import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, typing }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
      {typing && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
          <div style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: "4px 18px 18px 18px", padding: "14px 18px", display: "flex", gap: 6, alignItems: "center" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", animation: `bounce 1.2s ${i*0.2}s infinite` }} />)}
          </div>
        </div>
      )}
      <div ref={bottomRef} />
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}