const router = require("express").Router();
const { sendMessage, getHistory } = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/",                  protect, sendMessage);
router.get("/history/:session",   protect, getHistory);

module.exports = router;