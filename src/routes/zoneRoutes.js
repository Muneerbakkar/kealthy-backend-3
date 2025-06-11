const express = require("express");
const { createZoneEntry } = require("../controllers/zoneController");

const router = express.Router();

router.post("/", createZoneEntry);

module.exports = router;
