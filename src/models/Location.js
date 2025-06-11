const mongoose = require("mongoose");

// Batch schema with timestamps
const BatchLocationSchema = new mongoose.Schema(
  {
    batchNumber: { type: String },
    quantity: { type: Number },
    zone: { type: String },
    aisle: { type: String },
    rack: { type: String },
    shelf: { type: String },
    bin: { type: String },
    pallet: { type: String },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },
  },
  { timestamps: true } // <-- This enables createdAt and updatedAt
);

// Parent location schema
const LocationSchema = new mongoose.Schema(
  {
    ean: { type: String, required: true },
    name: { type: String, required: true },
    perishable: { type: Boolean, required: true }, // ← added perishable flag
    batches: [BatchLocationSchema],
  },
  { timestamps: true } // This keeps timestamps on the main document too
);

module.exports = mongoose.model("Location", LocationSchema);
