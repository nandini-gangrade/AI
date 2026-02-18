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