# IRA DevOps — Full Project Structure

```
incident-response-agent/
│
├── backend/
│   ├── server.js                  # Express entry point
│   ├── .env                       # Environment variables
│   ├── package.json
│   │
│   ├── config/
│   │   └── db.js                  # MongoDB/DB connection
│   │
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Incident.js            # Incident schema
│   │   └── Message.js             # Chat message schema
│   │
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth/login, /register
│   │   ├── incident.routes.js     # /api/incidents
│   │   └── chat.routes.js         # /api/chat
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── incident.controller.js
│   │   └── chat.controller.js
│   │
│   └── middleware/
│       └── auth.middleware.js     # JWT verification
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   │
│   └── src/
│       ├── main.jsx               # React entry
│       ├── App.jsx                # Root router
│       │
│       ├── api/
│       │   └── index.js           # Axios instance + API calls
│       │
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth state
│       │
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   └── ChatPage.jsx
│       │
│       └── components/
│           ├── auth/
│           │   ├── LoginForm.jsx
│           │   └── RegisterForm.jsx
│           ├── chat/
│           │   ├── Sidebar.jsx
│           │   ├── MessageList.jsx
│           │   ├── MessageBubble.jsx
│           │   ├── InputBar.jsx
│           │   └── SuggestionChips.jsx
│           └── shared/
│               └── Topbar.jsx
```

---

## BACKEND

---

### backend/package.json
```json
{
  "name": "ira-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

### backend/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ira_devops
JWT_SECRET=your_super_secret_key_here
```

---

### backend/server.js
```js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth",      require("./routes/auth.routes"));
app.use("/api/incidents", require("./routes/incident.routes"));
app.use("/api/chat",      require("./routes/chat.routes"));

app.get("/", (req, res) => res.send("IRA API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

### backend/config/db.js
```js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

### backend/models/User.js
```js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, default: "SRE Engineer" },
  avatar:    { type: String },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

---

### backend/models/Incident.js
```js
const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  severity:  { type: String, enum: ["P0", "P1", "P2", "P3"], default: "P2" },
  status:    { type: String, enum: ["active", "resolved", "investigating"], default: "active" },
  service:   { type: String },
  message:   { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Incident", incidentSchema);
```

---

### backend/models/Message.js
```js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role:    { type: String, enum: ["user", "bot"], required: true },
  text:    { type: String, required: true },
  session: { type: String }, // chat session ID
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
```

---

### backend/middleware/auth.middleware.js
```js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token, unauthorized" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

module.exports = { protect };
```

---

### backend/controllers/auth.controller.js
```js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    const avatar = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const user = await User.create({ name, email, password, role, avatar });
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

### backend/controllers/incident.controller.js
```js
const Incident = require("../models/Incident");

exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 }).populate("createdBy", "name");
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createIncident = async (req, res) => {
  const { title, severity, service, message } = req.body;
  try {
    const incident = await Incident.create({ title, severity, service, message, createdBy: req.user._id });
    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

### backend/controllers/chat.controller.js
```js
const Message = require("../models/Message");

// Simple bot logic — replace with OpenAI/Claude API call
const getBotReply = (text) => {
  const m = text.toLowerCase();
  if (m.includes("p0") || m.includes("status"))  return "🔴 P0 Active: CPU spike on prod-cluster-07. Runbook: RB-2041.";
  if (m.includes("alert") || m.includes("history")) return "📋 Recent alerts: P0 CPU spike, P1 DB lag, P1 API errors.";
  if (m.includes("escalat")) return "📣 Escalate P1: Page on-call, open #incident-p1 in Slack, update status page.";
  if (m.includes("report")) return "📝 Incident report drafted. Title: API Error Spike. Severity: P1.";
  return "I'm your Incident Response Agent. Ask me about alerts, escalations, or runbooks.";
};

exports.sendMessage = async (req, res) => {
  const { text, session } = req.body;
  try {
    // Save user message
    await Message.create({ user: req.user._id, role: "user", text, session });

    // Generate bot reply
    const botText = getBotReply(text);
    const botMsg = await Message.create({ user: req.user._id, role: "bot", text: botText, session });

    res.json({ reply: botMsg.text });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id, session: req.params.session }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

### backend/routes/auth.routes.js
```js
const router = require("express").Router();
const { login, register } = require("../controllers/auth.controller");

router.post("/login",    login);
router.post("/register", register);

module.exports = router;
```

---

### backend/routes/incident.routes.js
```js
const router = require("express").Router();
const { getIncidents, createIncident, updateIncident } = require("../controllers/incident.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/",       protect, getIncidents);
router.post("/",      protect, createIncident);
router.patch("/:id",  protect, updateIncident);

module.exports = router;
```

---

### backend/routes/chat.routes.js
```js
const router = require("express").Router();
const { sendMessage, getHistory } = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/",                  protect, sendMessage);
router.get("/history/:session",   protect, getHistory);

module.exports = router;
```

---

## FRONTEND

---

### frontend/package.json
```json
{
  "name": "ira-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

---

### frontend/vite.config.js
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
```

---

### frontend/src/api/index.js
```js
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ira_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const loginUser     = (data) => api.post("/auth/login", data);
export const registerUser  = (data) => api.post("/auth/register", data);
export const sendMessage   = (data) => api.post("/chat", data);
export const getChatHistory = (session) => api.get(`/chat/history/${session}`);
export const getIncidents  = ()     => api.get("/incidents");

export default api;
```

---

### frontend/src/context/AuthContext.jsx
```jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ira_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem("ira_token", token);
    localStorage.setItem("ira_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("ira_token");
    localStorage.removeItem("ira_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

### frontend/src/main.jsx
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
```

---

### frontend/src/App.jsx
```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ChatPage  from "./pages/ChatPage";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/chat"  element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="*"      element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
```

---

### frontend/src/pages/LoginPage.jsx
```jsx
import { useState } from "react";
import LoginForm    from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [success, setSuccess] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "#07070d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#f1f5f9", letterSpacing: 1 }}>IRA DEVOPS</span>
          </div>
          <div style={{ color: "#4b5563", fontSize: 11, letterSpacing: 2 }}>INCIDENT RESPONSE AGENT</div>
        </div>

        <div style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "#07070d", borderRadius: 8, padding: 4, border: "1px solid #1e1e2e", marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setSuccess(""); }} style={{
                flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 1, fontWeight: 700,
                background: mode === m ? "#1e293b" : "transparent", color: mode === m ? "#e2e8f0" : "#374151",
              }}>{m === "login" ? "SIGN IN" : "REGISTER"}</button>
            ))}
          </div>

          {success && <div style={{ background: "#030f06", border: "1px solid #22c55e44", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#22c55e", fontSize: 12 }}>✓ {success}</div>}

          {mode === "login"
            ? <LoginForm />
            : <RegisterForm onSuccess={() => { setSuccess("Account created! Sign in now."); setMode("login"); }} />
          }
        </div>
      </div>
    </div>
  );
}
```

---

### frontend/src/pages/ChatPage.jsx
```jsx
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
```

---

### frontend/src/components/auth/LoginForm.jsx
```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api";

const iStyle = { width: "100%", background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "12px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none", boxSizing: "border-box" };

export default function LoginForm() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.user, data.token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div>
      {error && <div style={{ background: "#1a0505", border: "1px solid #ff3b3b44", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#ff3b3b", fontSize: 12 }}>⚠ {error}</div>}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>EMAIL</label>
        <input style={iStyle} type="email" placeholder="you@devteam.io" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 22 }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#4b5563", marginBottom: 6 }}>PASSWORD</label>
        <input style={iStyle} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </div>
      <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "13px 0", background: loading ? "#1e293b" : "linear-gradient(135deg,#1d4ed8,#7c3aed)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? "SIGNING IN..." : "SIGN IN →"}
      </button>
    </div>
  );
}
```

---

### frontend/src/components/auth/RegisterForm.jsx
```jsx
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
```

---

### frontend/src/components/shared/Topbar.jsx
```jsx
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
```

---

### frontend/src/components/chat/Sidebar.jsx
```jsx
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
```

---

### frontend/src/components/chat/MessageList.jsx
```jsx
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
```

---

### frontend/src/components/chat/MessageBubble.jsx
```jsx
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
```

---

### frontend/src/components/chat/SuggestionChips.jsx
```jsx
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
```

---

### frontend/src/components/chat/InputBar.jsx
```jsx
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
```
