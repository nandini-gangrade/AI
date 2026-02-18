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