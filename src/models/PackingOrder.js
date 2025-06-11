// models/PackingOrder.js
const mongoose = require('mongoose');

const PackingOrderSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    orderId: { type: String, required: true },
    orderItems: { type: Array, required: true },
    totalAmountToPay: { type: Number, default: 0 },
    status: { type: String, default: "Packing" } // New field added
  },
  { timestamps: true }
);

module.exports = mongoose.model('PackingOrder', PackingOrderSchema);
