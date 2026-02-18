const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role:    { type: String, enum: ["user", "bot"], required: true },
  text:    { type: String, required: true },
  session: { type: String }, // chat session ID
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);