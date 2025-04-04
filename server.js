require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const aedRoutes = require("./routes/aedRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Fix CORS issue
app.use(
  cors({
    origin: "https://aed-ner.vercel.app", // ✅ Allow frontend
     // origin:  "https://aed-ner-aceu.vercel.app",
    credentials: true, // ✅ Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allowed request methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allowed headers
  })
);

// Connect to Database
connectDB();

// Routes
app.use("/api/aed", aedRoutes);
app.use("/api/auth", authRoutes);

// Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
