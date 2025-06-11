// routes/inbound.js
const express = require("express");
const router = express.Router();
const {
  createOrUpdateInbound,
  // createInbound,
  getInboundByEan,
  updateInboundRecord,
  getAllInboundRecords,
  updateBatchRecord,
  getInboundHistory,
  getTodayInboundRecords
} = require("../controllers/inboundController");

router.post("/", createOrUpdateInbound);
// router.post("/", createInbound);
router.get("/ean/:ean", getInboundByEan);
router.get("/history/:ean", getInboundHistory);
router.get("/", getAllInboundRecords); // New route to fetch all inbound records.
router.put("/ean/:ean", updateInboundRecord);
router.put("/ean/:ean/batch/:batchId", updateBatchRecord);
router.get("/batches/today", getTodayInboundRecords);



module.exports = router;
