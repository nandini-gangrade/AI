import { useState, useRef, useEffect } from "react";
import { useAuth }        from "../context/AuthContext";
import Sidebar            from "../components/chat/Sidebar";
import Topbar             from "../components/shared/Topbar";
import MessageList        from "../components/chat/MessageList";
import InputBar           from "../components/chat/InputBar";
import SuggestionChips    from "../components/chat/SuggestionChips";
import { sendMessage, getChatHistory } from "../api";

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages]     = useState([{ id: 1, role: "bot", text: `Hey ${user.name.split(" ")[0]} 👋 I'm your Incident Response Agent.` }]);
  const [typing, setTyping]         = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [session, setSession]       = useState("default");

  const startNewChat = () => {
    const newSession = `session_${Date.now()}`;
    setSession(newSession);
    setMessages([{ id: Date.now(), role: "bot", text: "New session started. How can I help?" }]);
  };

  const loadSession = async (sessionId) => {
    setSession(sessionId);
    try {
      const { data } = await getChatHistory(sessionId);
      setMessages(data.length ? data.map(m => ({ id: m._id, role: m.role, text: m.text }))
        : [{ id: Date.now(), role: "bot", text: "No messages in this session yet." }]);
    } catch {
      setMessages([{ id: Date.now(), role: "bot", text: "Could not load history." }]);
    }
  };

  const send = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text, avatar: user.avatar }]);
    setTyping(true);
    try {
      const { data } = await sendMessage({ text, session });
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: "⚠ Error reaching server." }]);
    }
    setTyping(false);
  };

  return (
    <div style={{ height: "100vh", display: "flex", background: "#07070d", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden" }}>
      <Sidebar open={sidebarOpen} user={user} onNewChat={startNewChat} onSelectSession={loadSession} activeSession={session} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar onToggleSidebar={() => setSidebarOpen(p => !p)} />
        <MessageList messages={messages} typing={typing} />
        <SuggestionChips onSelect={send} />
        <InputBar onSend={send} disabled={typing} />
      </div>
    </div>
  );
}