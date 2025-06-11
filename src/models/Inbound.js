// models/Inbound.js
const mongoose = require("mongoose");

// Batch schema with timestamps enabled
const BatchSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, required: true },
    manufacturingDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    limit: { type: Number, required: true },
  },
  { timestamps: true } // Enables createdAt and updatedAt for each batch
);

// Inbound schema with its own timestamps
const InboundSchema = new mongoose.Schema(
  {
    ean: { type: String, required: true },
    name: { type: String, required: true },
    netWeight: { type: Number, required: true },
    netWeightUnit: { type: String, required: true },
    perishable: { type: Boolean, required: true },
    batches: [BatchSchema], // Array of timestamped batches
  },
  { timestamps: true } // Enables timestamps for the parent inbound document
);

module.exports = mongoose.model("Inbound", InboundSchema);
