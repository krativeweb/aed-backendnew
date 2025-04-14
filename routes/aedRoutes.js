const express = require("express");
const AED = require("../models/aedModel");
const { upload } = require("../config/cloudinary");
const cors = require("cors");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();



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
   const aeds = await AED.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json(aeds);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching AED data", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const aed = await AED.findOne({ _id: req.params.id, isDeleted: false });
    if (!aed) {
      return res.status(404).json({ message: "❌ AED not found" });
    }
    res.status(200).json(aed);
  } catch (error) {
    console.error("Error fetching AED:", error);
    res.status(500).json({ message: "❌ Error fetching AED", details: error.message });
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
          maxDistance: 200 * 1000, // 200KM in meters
          spherical: true,
           query: { isDeleted: false } 
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
// DELETE: Remove AED by ID
router.delete("/:id", async (req, res) => {
  try {
    const aed = await AED.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!aed) {
      return res.status(404).json({ message: "AED record not found" });
    }

    res.status(200).json({ message: "AED record soft deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting AED:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
