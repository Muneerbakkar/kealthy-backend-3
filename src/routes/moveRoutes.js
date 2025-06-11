// routes/move.js
const express = require("express");
const router = express.Router();
const {
  moveProductQuantityToLocation,
} = require("../controllers/moveController");

// POST /api/move - Update the Location document's batches field.
router.post("/", moveProductQuantityToLocation);

module.exports = router;
