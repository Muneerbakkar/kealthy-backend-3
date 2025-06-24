
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

