const express = require("express");
const {
  getCurrentWeekOrders,
  getOrdersByDate,
  getTopProducts,
  getOrdersByHour,
  getTopOrderTimes,
  getProductSummary,
} = require("../controllers/orderController");

const router = express.Router();

console.log("Order routes are being mounted");

// GET /api/orders/current-week
router.get("/current-week", getCurrentWeekOrders);

router.get("/by-date", getOrdersByDate);

router.get("/products/top", getTopProducts);
router.get("/orders-by-hour", getOrdersByHour);
router.get('/top-times',  getTopOrderTimes);
router.get('/products/summary', getProductSummary);

module.exports = router;
