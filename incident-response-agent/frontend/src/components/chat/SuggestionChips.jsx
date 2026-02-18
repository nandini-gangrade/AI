const SUGGESTIONS = [
  "What's the current P0 incident status?",
  "Show me recent alert history",
  "How do I escalate a P1 incident?",
  "Generate an incident report",
];

export default function SuggestionChips({ onSelect }) {
  return (
    <div style={{ padding: "0 32px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
      {SUGGESTIONS.map(s => (
        <button key={s} onClick={() => onSelect(s)} style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 20, color: "#6b7280", fontSize: 11, padding: "6px 14px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
          {s}
        </button>
      ))}
    </div>
  );
}