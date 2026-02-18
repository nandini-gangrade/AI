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