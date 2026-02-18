const router = require("express").Router();
const { getIncidents, createIncident, updateIncident } = require("../controllers/incident.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/",       protect, getIncidents);
router.post("/",      protect, createIncident);
router.patch("/:id",  protect, updateIncident);

module.exports = router;