const mongoose = require("mongoose");

// Define subdocument schemas with timestamps
const zoneSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const aisleSchema = new mongoose.Schema(
  {
    aisle: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const baySchema = new mongoose.Schema(
  {
    bay: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const shelfSchema = new mongoose.Schema(
  {
    shelf: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const binSchema = new mongoose.Schema(
  {
    bin: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const palletSchema = new mongoose.Schema(
  { pallet: { type: String, required: true } },
  { timestamps: true, _id: false }
);

const bulkStorageSchema = new mongoose.Schema(
  { bulkStorage: { type: String, required: true } },
  { timestamps: true, _id: false }
);

// Main Inventory schema with arrays of subdocuments
const inventorySchema = new mongoose.Schema(
  {
    zones: [zoneSchema],
    aisles: [aisleSchema],
    bays: [baySchema],
    shelfs: [shelfSchema],
    bins: [binSchema],
    pallets: [palletSchema],
    bulkstorage: [bulkStorageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
