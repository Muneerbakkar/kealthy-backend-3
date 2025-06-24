const express = require("express");
const router = express.Router();
const getLowStockProducts = require("../controllers/getLowStockProducts");

router.get("/", getLowStockProducts); // GET /api/low-stock

module.exports = router;
