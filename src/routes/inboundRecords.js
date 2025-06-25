// routes/inboundRecords.js

const express = require("express");
const { getInboundRecords, getInboundSummary } = require("../controllers/inboundRecordController");
const router = express.Router();


/**
 * GET /api/inbound-records
 * Optional query strings: 
 *   • start=YYYY-MM-DD 
 *   • end=YYYY-MM-DD
 */
router.get("/", getInboundRecords);
router.get("/summary", getInboundSummary);

module.exports = router;
