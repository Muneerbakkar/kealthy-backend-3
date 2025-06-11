const express = require("express");
const router = express.Router();
const {
  moveOrderToRack,
  getRackOrders,
  assignRackOrder,
  deleteRackOrder,
} = require("../controllers/rackController");

router.post("/move", moveOrderToRack);
router.get("/orders", getRackOrders);
// New route for updating the RackOrder status to "Assigned"
router.post("/assign", assignRackOrder);
router.delete("/orders/:id", deleteRackOrder);

module.exports = router;
