// const mongoose = require("mongoose");

// // Sub-schema for bulkstorage in Zone 1
// const bulkstorageSchema = new mongoose.Schema(
//   {
//     value: { type: String, default: "" }, // Selected bulk storage option
//     bin: { type: String, default: "" }, // Selected bin for bulk storage
//     limit: { type: String, default: "" }, // Separate bulk storage limit
//   },
//   { _id: false, minimize: false }
// );

// // Sub-schema for Zone 1 (includes bulkstorage)
// const zone1Schema = new mongoose.Schema(
//   {
//     aisle: { type: String, default: "" },
//     bay: { type: String, default: "" },
//     shelf: { type: String, default: "" },
//     bin: { type: String, default: "" },
//     zoneLimit: { type: String, default: "" }, // renamed from "limit"
//     bulkstorage: { type: bulkstorageSchema, default: () => ({}) },
//   },
//   { _id: false, minimize: false }
// );

// // Sub-schema for Zone 2
// const zone2Schema = new mongoose.Schema(
//   {
//     pallet: { type: String, default: "" },
//     bin: { type: String, default: "" },
//     limit: { type: String, default: "" }, // Limit for Zone 2
//   },
//   { _id: false, minimize: false }
// );

// // Sub-schema for Zone 3
// const zone3Schema = new mongoose.Schema(
//   {
//     bulkStorage: { type: String, default: "" },
//     limit: { type: String, default: "" }, // Limit for Zone 3
//   },
//   { _id: false, minimize: false }
// );

// // Combined zones schema
// const zonesSchema = new mongoose.Schema(
//   {
//     zone1: { type: zone1Schema, default: () => ({}) },
//     zone2: { type: zone2Schema, default: () => ({}) },
//     zone3: { type: zone3Schema, default: () => ({}) },
//   },
//   { _id: false, minimize: false }
// );

// // Main Product Schema
// const productSchema = new mongoose.Schema(
//   {
//     type: { type: String, required: true },
//     name: { type: String, required: true, unique: true },
//     limit: String,
//     sku: String,
//     unit: String,
//     hsnCode: String,
//     taxPreference: String,
//     dimensions: String,
//     weight: String,
//     manufacturer: String,
//     brand: String,
//     upc: String,
//     mpn: String,
//     ean: String,
//     isbn: String,
//     sellingPrice: String,
//     salesAccount: String,
//     salesDescription: String,
//     costPrice: String,
//     purchaseAccount: String,
//     purchaseDescription: String,
//     preferredVendor: String,
//     images: [String], // Expecting URLs/paths
//     inventoryTracking: {
//       trackBin: { type: Boolean, default: false },
//       trackBatches: {
//         type: String,
//         enum: ["none", "track_batches"],
//         default: "none",
//       },
//       reorderPoint: { type: Number, default: 0 },
//       inventoryAccount: { type: String, default: "" },
//       valuationMethod: { type: String, default: "" },
//       zones: zonesSchema, // Embedded directly without a type wrapper
//       batches: [
//         {
//           batchRef: { type: String, default: "" },
//           mfrBatch: { type: String, default: "" },
//           manufacturedDate: { type: Date },
//           expiryDate: { type: Date },
//           quantity: { type: Number, default: 0 },
//           zone: { type: String, default: "" },
//           aisle: { type: String, default: "" },
//           bay: { type: String, default: "" },
//           shelf: { type: String, default: "" },
//           bin: { type: String, default: "" },
//         },
//       ],
//       warehouseStocks: [
//         {
//           warehouseName: { type: String, default: "" },
//           openingStock: { type: Number, default: 0 },
//           openingStockValue: { type: Number, default: 0 },
//         },
//       ],
//     },
//   },
//   { timestamps: true, strict: false, minimize: false }
// );

// // Pre-save hook to mark nested fields as modified
// productSchema.pre("save", function (next) {
//   this.markModified("inventoryTracking.zones.zone1");
//   next();
// });

// module.exports = mongoose.model("Product", productSchema);

// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    ean: { type: String, required: true },
    // New net weight fields added below:
    netWeight: { type: Number, required: true },
    netWeightUnit: { type: String, required: true },
    // New perishable field (boolean: true/false)
    perishable: { type: Boolean, required: true },
    locations: [
      {
        zone: { type: String },
        aisle: { type: String },
        bay: { type: String },
        shelf: { type: String },
        bin: { type: String },
        pallets: { type: String },
        bulkstorage: { type: String },
        quantity: { type: Number },
      },
    ],
  },
  { collection: "productCollection" }
);

module.exports = mongoose.model("Product", productSchema);

