// models/RackOrder.js
const mongoose = require('mongoose');

const RackOrderSchema = new mongoose.Schema({
  order: { type: Object, required: true },
  location: {
    rack: { type: Number, required: true, default: 1 }
  },
  // New field to track assignment status
  status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model('RackOrder', RackOrderSchema);
