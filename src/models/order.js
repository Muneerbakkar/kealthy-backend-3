const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  phoneNumber: String,
  orderId: String,
  assignedTo: String,
  distance: Number,
  orderItems: [
    {
      item_EAN: String,
      item_price: Number,
      item_name: String,
      item_quantity: Number
    }
  ],
  Name: String,
  totalAmountToPay: Number,
  selectedLatitude: Number,
  selectedLongitude: Number,
  date: String, // Expected format "DD-MM-YYYY"
  time: String,
  ReceivedCOD: String
});

module.exports = mongoose.model('Order', orderSchema);
