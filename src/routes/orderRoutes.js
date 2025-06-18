const express = require("express");
const cors = require("cors");
const {
  getCurrentWeekOrders,
  getOrdersByDate,
  getTopProducts,
  getOrdersByHour,
  getTopOrderTimes,
  getProductSummary,
  transferSubscriptionToOrder,
} = require("../controllers/orderController");

const router = express.Router();

// GET /api/orders/current-week
router.get("/current-week", getCurrentWeekOrders);

router.get("/by-date", getOrdersByDate);

router.get("/products/top", getTopProducts);
router.get("/orders-by-hour", getOrdersByHour);
router.get('/top-times',  getTopOrderTimes);
router.get('/products/summary', getProductSummary);
// router.get("/generate-orders-from-subscription", transferSubscriptionToOrder);

module.exports = router;
