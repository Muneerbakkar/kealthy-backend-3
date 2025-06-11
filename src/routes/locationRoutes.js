// routes/location.js
const express = require("express");
const {
  getLocationsByDate,
  getLocationHistory,
  getLocationByEAN,
  getAllLocationByEAN,
  deleteLocationById,
  getAllZonesStockPaginated,
  reduceStorageQuantity,
  transferQuantity,
  updateLocationById,
  searchLocations,
  getExpiringWithinFourDays,
  getExpiringWithinOneMonth,
  getTotalExpiringCount,
} = require("../controllers/locationController");

const router = express.Router();

// 1) Paginated & searchable Zone 2 stock
//    GET /api/location/zone2?page=1&limit=10&search=foo
router.get("/all", getAllZonesStockPaginated);

// 2) Full history by EAN (all batches)
//    GET /api/location/history/:ean
router.get("/history/:ean", getLocationHistory);

router.get("/search", searchLocations);

// 3) Fetch *all* batches for a product by EAN
//    GET /api/location/all/:ean
router.get("/:ean/all", getAllLocationByEAN);

// 4) Delete a location doc by its Mongo _id
//    DELETE /api/location/delete/:id
// Delete a location doc by its _id
router.delete("/:id", deleteLocationById);

// 5) Transfer between zones
//    POST /api/location/:ean/transfer
router.post("/:ean/transfer", transferQuantity);

// 6) Reduce storage in a specific slot
//    PATCH /api/location/:ean/storage/:aisle/:rack/:shelf/:bin/:pallet/reduce
router.patch(
  "/:ean/storage/:aisle/:rack/:shelf/:bin/reduce",
  reduceStorageQuantity
);

// 7) Today‑or‑date‑filtered list
//    GET /api/location?date=YYYY-MM-DD
router.get("/", getLocationsByDate);

router.get('/count',    getTotalExpiringCount);

router.get("/expiring-in-4-days", getExpiringWithinFourDays);

router.get("/expiring-in-1-month", getExpiringWithinOneMonth);

// 8) Single‑EAN lookup (Zone 1 filtered in your original getLocationByEAN)
//    GET /api/location/:ean
router.get("/:ean", getLocationByEAN);

router.put("/:id", updateLocationById);

module.exports = router;
