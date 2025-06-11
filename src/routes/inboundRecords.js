// routes/inboundRecords.js

const express = require("express");
const { getInboundRecords } = require("../controllers/inboundRecordController");
const router = express.Router();


/**
 * GET /api/inbound-records
 * Optional query strings: 
 *   • start=YYYY-MM-DD 
 *   • end=YYYY-MM-DD
 */
router.get("/", getInboundRecords);

module.exports = router;
