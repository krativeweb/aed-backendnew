require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const aedRoutes = require("./routes/aedRoutes");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());  // ✅ Enable CORS globally

// Connect to Database
connectDB();

// Routes
app.use("/api/aed", aedRoutes);

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
