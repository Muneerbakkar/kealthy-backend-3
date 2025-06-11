const express = require("express");
const {
  moveToPacking,
  getPackingOrders,
} = require("../controllers/packingController");
const router = express.Router();

// POST /api/packing - Add order details to the packing collection
router.post("/", moveToPacking);

// GET endpoint to fetch packing orders
router.get("/", getPackingOrders);

module.exports = router;
