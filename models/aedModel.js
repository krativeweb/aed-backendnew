const mongoose = require("mongoose");

const aedSchema = new mongoose.Schema(
  {
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
    aedImage: String,
    location: {
      type: { type: String, enum: ["Point"],  default: "Point" },
      coordinates: { type: [Number] }, // [longitude, latitude]
    },
      isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// **Create 2dsphere index for geospatial queries**
aedSchema.index({ location: "2dsphere" });

const AED = mongoose.model("AED", aedSchema);
module.exports = AED;
