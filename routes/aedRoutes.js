const express = require("express");
const AED = require("../models/aedModel");
const { upload } = require("../config/cloudinary");
const cors = require("cors");

const router = express.Router();

// Enable CORS
router.use(cors());

// 🔹 Register AED (No Authentication)
router.post("/register-aed", upload.single("aedImage"), async (req, res) => {
  try {
    console.log("Received request:", req.body);

    // Extract form data
    let aedData = { ...req.body, aedImage: req.file?.path || null };

    // Ensure location is handled correctly (convert string to JSON)
    if (req.body.location) {
      const location = JSON.parse(req.body.location); // Parse GeoJSON
      if (location.type === "Point" && Array.isArray(location.coordinates)) {
        aedData.location = location; // Store as GeoJSON
      } else {
        return res.status(400).json({ message: "❌ Invalid location format" });
      }
    }

    // Save to database
    const newAED = await new AED(aedData).save();
    res.status(201).json({ message: "✅ AED registered successfully!", aed: newAED });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "❌ Error registering AED", details: error.message });
  }
});


// 🔹 Get All AEDs (No Authentication)
router.get("/aed-list", async (req, res) => {
  try {
    const aeds = await AED.find();
    res.status(200).json(aeds);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching AED data", details: error.message });
  }
});

router.post("/fetchnearby", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude are required." });
    }

    const nearbyAEDs = await AED.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: 500 * 1000, // 200KM in meters
          spherical: true,
        },
      },
    ]);

    console.log("Found AEDs:", nearbyAEDs); 
    res.json(Array.isArray(nearbyAEDs) ? nearbyAEDs : []);
  } catch (error) {
    console.error("Error fetching nearby AEDs:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
