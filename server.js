require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "aed_images", // Folder name in Cloudinary
    format: async (req, file) => "png", // Convert images to PNG
    public_id: (req, file) => `${Date.now()}_${file.originalname}`,
  },
});
const upload = multer({ storage });

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Mongoose Schema
const aedSchema = new mongoose.Schema({
  locationName: { type: String, required: true },
  aedPlacement: String,
  streetAddress: String,
  city: String,
  state: String,
  zipCode: String,
  county: String,
  businessPhone: String,
  aedPlaceType: String,
  responsibleParty: String,
  responsiblePhone: String,
  responsibleEmail: String,
  restrictedAccess: Boolean,
  notFixedLocation: Boolean,
  accessible24_7: Boolean,
  aedManufacturer: String,
  aedModel: String,
  aedAssetId: String,
  aedSerialNumber: String,
  aedInstallDate: Date,
  batteryExpirationDate: Date,
  electrodeExpirationDate: Date,
  pediatricElectrodeExpirationDate: Date,
  medicalDirection: String,
  accessCode: String,
  emergencySupplies: [String],
  aedImage: String, // Cloudinary URL
}, { timestamps: true });

const AED = mongoose.model("AED", aedSchema);

// API Routes
app.post("/register-aed", upload.single("aedImage"), async (req, res) => {
  try {
    const { body, file } = req;
    if (!body.locationName) {
      return res.status(400).json({ error: "Location Name is required" });
    }

    const aedData = {
      ...body,
      aedImage: file ? file.path : null, // Cloudinary URL
    };

    const newAED = new AED(aedData);
    await newAED.save();

    res.status(201).json({ message: "✅ AED registered successfully!", aed: newAED });
  } catch (error) {
    res.status(500).json({ error: "❌ Internal Server Error", details: error.message });
  }
});

// GET all AEDs
app.get("/aed-list", async (req, res) => {
  try {
    const aeds = await AED.find();
    res.status(200).json(aeds);
  } catch (error) {
    res.status(500).json({ error: "❌ Error fetching AED data", details: error.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
