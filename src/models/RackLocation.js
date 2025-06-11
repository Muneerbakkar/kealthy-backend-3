const mongoose = require('mongoose');

const RackLocationSchema = new mongoose.Schema({
  rack: { type: Number, required: true, default: 1 }, // Only one rack (Rack 1)
  booked: { type: Boolean, default: false },          // Indicates if the location is booked
  orderId: { type: String, default: null }              // Reference to the order that booked this location
}, { timestamps: true });

module.exports = mongoose.model('RackLocation', RackLocationSchema);
