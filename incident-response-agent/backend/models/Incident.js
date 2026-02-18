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