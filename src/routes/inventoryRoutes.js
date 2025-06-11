// routes/inventoryRoutes.js
const express = require("express");
const {
  createInventory,
  getInventory,
  handleAddZone,
  handleEditZone,
  handleDeleteZone,
  handleAddAisle,
  handleEditAisle,
  handleDeleteAisle,
  handleAddBay,
  handleEditBay,
  handleDeleteBay,
  handleAddShelf,
  handleEditShelf,
  handleDeleteShelf,
  handleAddBin,
  handleEditBin,
  handleDeleteBin,
  handleAddPallet,
  handleEditPallet,
  handleDeletePallet,
  handleAddBulkStorage,
  handleEditBulkStorage,
  handleDeleteBulkStorage,
} = require("../controllers/inventoryController");
const router = express.Router();

// Inventory document endpoints
router.post("/", createInventory);
router.get("/", getInventory);

// Zone endpoints
router.post("/zones", handleAddZone);
router.put("/zones", handleEditZone);
router.delete("/zones/:zoneName", handleDeleteZone);

// Aisle endpoint (we assume only POST is needed here)
router.post("/aisles", handleAddAisle);
router.put("/aisles", handleEditAisle);
router.delete("/aisles/:aisleName", handleDeleteAisle);

// Bay endpoints
router.post("/bays", handleAddBay);
router.put("/bays", handleEditBay);
router.delete("/bays/:bayName", handleDeleteBay);

// Shelf endpoints
router.post("/shelfs", handleAddShelf);
router.put("/shelfs", handleEditShelf);
router.delete("/shelfs/:shelfName", handleDeleteShelf);

// New bin endpoints
router.post("/bins", handleAddBin);
router.put("/bins", handleEditBin);
router.delete("/bins/:binName", handleDeleteBin);

// Pallet endpoints
router.post("/pallets", handleAddPallet);
router.put("/pallets", handleEditPallet);
router.delete("/pallets/:palletName", handleDeletePallet);

// Bulk Storage endpoints
router.post("/bulkstorage", handleAddBulkStorage);
router.put("/bulkstorage", handleEditBulkStorage);
router.delete("/bulkstorage/:bulkStorageName", handleDeleteBulkStorage);

module.exports = router;
