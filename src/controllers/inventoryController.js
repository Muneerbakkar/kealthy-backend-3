// controllers/inventoryController.js
const Inventory = require("../models/Inventory");

// Create a new Inventory document
// Expects req.body: { zones, aisles, bays, shelfs, bins }
// Each should be an array of strings; we map them into subdocuments.
const createInventory = async (req, res, next) => {
  try {
    const { zones, aisles, bays, shelfs, bins } = req.body; // arrays of strings
    const inventory = new Inventory({
      zones: zones ? zones.map((z) => ({ zone: z })) : [],
      aisles: aisles ? aisles.map((a) => ({ aisle: a })) : [],
      bays: bays ? bays.map((b) => ({ bay: b })) : [],
      shelfs: shelfs ? shelfs.map((s) => ({ shelf: s })) : [],
      bins: bins ? bins.map((b) => ({ bin: b })) : [],
    });
    const savedInventory = await inventory.save();
    res.status(201).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Get the Inventory document (assumes one document)
const getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findOne({});
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }
    res.status(200).json(inventory);
  } catch (error) {
    next(error);
  }
};

/* --------------------------- ZONE ENDPOINTS --------------------------- */

// Add a new zone
const handleAddZone = async (req, res, next) => {
  try {
    const { zone } = req.body;
    if (!zone || !zone.trim()) {
      return res.status(400).json({ message: "Zone value is required" });
    }
    const zoneValue = zone.trim();
    let inventory = await Inventory.findOne({});
    if (!inventory) {
      inventory = new Inventory({
        zones: [{ zone: zoneValue }],
        aisles: [],
        bays: [],
        shelfs: [],
        bins: [],
      });
    } else {
      if (!inventory.zones || !Array.isArray(inventory.zones)) {
        inventory.zones = [];
      }
      if (inventory.zones.some((z) => z.zone === zoneValue)) {
        return res.status(400).json({ message: "Zone already exists" });
      }
      inventory.zones.push({ zone: zoneValue });
    }
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Edit a zone (expects JSON: { oldZone, newZone })
const handleEditZone = async (req, res, next) => {
  try {
    const { oldZone, newZone } = req.body;
    if (!oldZone || !newZone || !oldZone.trim() || !newZone.trim()) {
      return res
        .status(400)
        .json({ message: "Both oldZone and newZone values are required" });
    }
    const inventory = await Inventory.findOne({});
    if (!inventory || !inventory.zones) {
      return res.status(404).json({ message: "Inventory or zones not found" });
    }
    // Find index by comparing the subdocument property
    const index = inventory.zones.findIndex((z) => z.zone === oldZone.trim());
    if (index === -1) {
      return res.status(404).json({ message: "Zone not found" });
    }
    inventory.zones[index].zone = newZone.trim();
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Delete a zone (expects zoneName as a URL parameter)
const handleDeleteZone = async (req, res, next) => {
  try {
    const { zoneName } = req.params;
    if (!zoneName) {
      return res.status(400).json({ message: "Zone name is required" });
    }
    const inventory = await Inventory.findOne({});
    if (!inventory || !inventory.zones) {
      return res.status(404).json({ message: "Inventory or zones not found" });
    }
    // Filter using the subdocument property
    inventory.zones = inventory.zones.filter((z) => z.zone !== zoneName);
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

/* --------------------------- AISLE ENDPOINTS --------------------------- */

// Add a new aisle
const handleAddAisle = async (req, res, next) => {
  try {
    const { aisle } = req.body;
    if (!aisle || !aisle.trim()) {
      return res.status(400).json({ message: "Aisle value is required" });
    }
    const aisleValue = aisle.trim();
    let inventory = await Inventory.findOne({});
    if (!inventory) {
      inventory = new Inventory({
        zones: [],
        aisles: [{ aisle: aisleValue }],
        bays: [],
        shelfs: [],
        bins: [],
      });
    } else {
      if (!inventory.aisles || !Array.isArray(inventory.aisles)) {
        inventory.aisles = [];
      }
      if (inventory.aisles.some((a) => a.aisle === aisleValue)) {
        return res.status(400).json({ message: "Aisle already exists" });
      }
      inventory.aisles.push({ aisle: aisleValue });
    }
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Edit an existing aisle (expects JSON: { oldAisle, newAisle })
const handleEditAisle = async (req, res, next) => {
  try {
    const { oldAisle, newAisle } = req.body;
    if (!oldAisle || !newAisle || !oldAisle.trim() || !newAisle.trim()) {
      return res
        .status(400)
        .json({ message: "Both oldAisle and newAisle values are required" });
    }
    const inventory = await Inventory.findOne({});
    if (!inventory || !inventory.aisles) {
      return res.status(404).json({ message: "Inventory or aisles not found" });
    }
    const index = inventory.aisles.findIndex(
      (a) => a.aisle === oldAisle.trim()
    );
    if (index === -1) {
      return res.status(404).json({ message: "Aisle not found" });
    }
    inventory.aisles[index].aisle = newAisle.trim();
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Delete an aisle (expects aisleName as URL parameter)
const handleDeleteAisle = async (req, res, next) => {
  try {
    const { aisleName } = req.params;
    if (!aisleName) {
      return res.status(400).json({ message: "Aisle name is required" });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.aisles) {
      return res.status(404).json({ message: "Inventory or aisles not found" });
    }
    inventory.aisles = inventory.aisles.filter((a) => a.aisle !== aisleName);
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

/* --------------------------- BAY ENDPOINTS --------------------------- */

// Add a new bay
const handleAddBay = async (req, res, next) => {
  try {
    const { bay } = req.body;
    if (!bay || !bay.trim()) {
      return res.status(400).json({ message: "Bay value is required" });
    }
    const bayValue = bay.trim();
    let inventory = await Inventory.findOne({});
    if (!inventory) {
      inventory = new Inventory({
        zones: [],
        aisles: [],
        bays: [{ bay: bayValue }],
        shelfs: [],
        bins: [],
      });
    } else {
      if (!inventory.bays || !Array.isArray(inventory.bays)) {
        inventory.bays = [];
      }
      if (inventory.bays.some((b) => b.bay === bayValue)) {
        return res.status(400).json({ message: "Bay already exists" });
      }
      inventory.bays.push({ bay: bayValue });
    }
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Edit a bay (expects JSON: { oldBay, newBay })
const handleEditBay = async (req, res, next) => {
  try {
    const { oldBay, newBay } = req.body;
    if (!oldBay || !newBay || !oldBay.trim() || !newBay.trim()) {
      return res
        .status(400)
        .json({ message: "Both oldBay and newBay values are required" });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.bays) {
      return res.status(404).json({ message: "Inventory or bays not found" });
    }
    const index = inventory.bays.findIndex((b) => b.bay === oldBay.trim());
    if (index === -1) {
      return res.status(404).json({ message: "Bay not found" });
    }
    inventory.bays[index].bay = newBay.trim();
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Delete a bay (expects bayName as URL parameter)
const handleDeleteBay = async (req, res, next) => {
  try {
    const { bayName } = req.params;
    if (!bayName) {
      return res.status(400).json({ message: "Bay name is required" });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.bays) {
      return res.status(404).json({ message: "Inventory or bays not found" });
    }
    inventory.bays = inventory.bays.filter((b) => b.bay !== bayName);
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

/* --------------------------- SHELF ENDPOINTS --------------------------- */

// Add a new shelf
const handleAddShelf = async (req, res, next) => {
  try {
    const { shelf } = req.body;
    if (!shelf || !shelf.trim()) {
      return res.status(400).json({ message: "Shelf value is required" });
    }
    const shelfValue = shelf.trim();
    let inventory = await Inventory.findOne({});
    if (!inventory) {
      inventory = new Inventory({
        zones: [],
        aisles: [],
        bays: [],
        shelfs: [{ shelf: shelfValue }],
        bins: [],
      });
    } else {
      if (!inventory.shelfs || !Array.isArray(inventory.shelfs)) {
        inventory.shelfs = [];
      }
      if (inventory.shelfs.some((s) => s.shelf === shelfValue)) {
        return res.status(400).json({ message: "Shelf already exists" });
      }
      inventory.shelfs.push({ shelf: shelfValue });
    }
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Edit a shelf (expects JSON: { oldShelf, newShelf })
const handleEditShelf = async (req, res, next) => {
  try {
    const { oldShelf, newShelf } = req.body;
    if (!oldShelf || !newShelf || !oldShelf.trim() || !newShelf.trim()) {
      return res
        .status(400)
        .json({ message: "Both oldShelf and newShelf values are required" });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.shelfs) {
      return res.status(404).json({ message: "Inventory or shelfs not found" });
    }
    const index = inventory.shelfs.findIndex(
      (s) => s.shelf === oldShelf.trim()
    );
    if (index === -1) {
      return res.status(404).json({ message: "Shelf not found" });
    }
    inventory.shelfs[index].shelf = newShelf.trim();
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Delete a shelf (expects shelfName as URL parameter)
const handleDeleteShelf = async (req, res, next) => {
  try {
    const { shelfName } = req.params;
    if (!shelfName) {
      return res.status(400).json({ message: "Shelf name is required" });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.shelfs) {
      return res.status(404).json({ message: "Inventory or shelfs not found" });
    }
    inventory.shelfs = inventory.shelfs.filter((s) => s.shelf !== shelfName);
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

/* --------------------------- BIN ENDPOINTS --------------------------- */

// Add a new bin
const handleAddBin = async (req, res, next) => {
  try {
    const { bin } = req.body;
    if (!bin || !bin.trim()) {
      return res.status(400).json({ message: "Bin value is required" });
    }
    const binValue = bin.trim();
    let inventory = await Inventory.findOne({});
    if (!inventory) {
      inventory = new Inventory({
        zones: [],
        aisles: [],
        bays: [],
        bins: [{ bin: binValue }],
        shelfs: [],
      });
    } else {
      if (!inventory.bins || !Array.isArray(inventory.bins)) {
        inventory.bins = [];
      }
      if (inventory.bins.some((b) => b.bin === binValue)) {
        return res.status(400).json({ message: "Bin already exists" });
      }
      inventory.bins.push({ bin: binValue });
    }
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Edit a bin (expects JSON: { oldBin, newBin })
const handleEditBin = async (req, res, next) => {
  try {
    const { oldBin, newBin } = req.body;
    if (!oldBin || !newBin || !oldBin.trim() || !newBin.trim()) {
      return res
        .status(400)
        .json({ message: "Both oldBin and newBin values are required" });
    }
    const inventory = await Inventory.findOne({});
    if (!inventory || !inventory.bins) {
      return res.status(404).json({ message: "Inventory or bins not found" });
    }
    const index = inventory.bins.findIndex((b) => b.bin === oldBin.trim());
    if (index === -1) {
      return res.status(404).json({ message: "Bin not found" });
    }
    inventory.bins[index].bin = newBin.trim();
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Delete a bin (expects binName as URL parameter)
const handleDeleteBin = async (req, res, next) => {
  try {
    const { binName } = req.params;
    if (!binName) {
      return res.status(400).json({ message: "Bin name is required" });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.bins) {
      return res.status(404).json({ message: "Inventory or bins not found" });
    }
    inventory.bins = inventory.bins.filter((b) => b.bin !== binName);
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Add a new pallet
const handleAddPallet = async (req, res, next) => {
  try {
    const { pallet } = req.body;
    if (!pallet || !pallet.trim()) {
      return res.status(400).json({ message: "Pallet value is required" });
    }
    const palletValue = pallet.trim();
    let inventory = await Inventory.findOne({});
    if (!inventory) {
      inventory = new Inventory({
        zones: [],
        aisles: [],
        bays: [],
        shelfs: [],
        bins: [],
        pallets: [{ pallet: palletValue }],
      });
    } else {
      if (!inventory.pallets || !Array.isArray(inventory.pallets)) {
        inventory.pallets = [];
      }
      if (inventory.pallets.some((p) => p.pallet === palletValue)) {
        return res.status(400).json({ message: "Pallet already exists" });
      }
      inventory.pallets.push({ pallet: palletValue });
    }
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Edit a pallet (expects JSON: { oldPallet, newPallet })
const handleEditPallet = async (req, res, next) => {
  try {
    const { oldPallet, newPallet } = req.body;
    if (!oldPallet || !newPallet || !oldPallet.trim() || !newPallet.trim()) {
      return res
        .status(400)
        .json({ message: "Both oldPallet and newPallet values are required" });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.pallets) {
      return res
        .status(404)
        .json({ message: "Inventory or pallets not found" });
    }
    const index = inventory.pallets.findIndex(
      (p) => p.pallet === oldPallet.trim()
    );
    if (index === -1) {
      return res.status(404).json({ message: "Pallet not found" });
    }
    inventory.pallets[index].pallet = newPallet.trim();
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Delete a pallet (expects palletName as URL parameter)
const handleDeletePallet = async (req, res, next) => {
  try {
    const { palletName } = req.params;
    if (!palletName) {
      return res.status(400).json({ message: "Pallet name is required" });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.pallets) {
      return res
        .status(404)
        .json({ message: "Inventory or pallets not found" });
    }
    inventory.pallets = inventory.pallets.filter(
      (p) => p.pallet !== palletName
    );
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Bulk Storage Endpoints

// Add a new bulk storage entry
const handleAddBulkStorage = async (req, res, next) => {
  try {
    const { bulkStorage } = req.body;
    if (!bulkStorage || !bulkStorage.trim()) {
      return res
        .status(400)
        .json({ message: "Bulk storage value is required" });
    }
    const bulkStorageValue = bulkStorage.trim();
    let inventory = await Inventory.findOne({});
    if (!inventory) {
      inventory = new Inventory({
        zones: [],
        aisles: [],
        bays: [],
        shelfs: [],
        bins: [],
        pallets: [],
        bulkstorage: [{ bulkStorage: bulkStorageValue }],
      });
    } else {
      if (!inventory.bulkstorage || !Array.isArray(inventory.bulkstorage)) {
        inventory.bulkstorage = [];
      }
      if (
        inventory.bulkstorage.some((bs) => bs.bulkStorage === bulkStorageValue)
      ) {
        return res.status(400).json({ message: "Bulk storage already exists" });
      }
      inventory.bulkstorage.push({ bulkStorage: bulkStorageValue });
    }
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Edit a bulk storage entry
// Expects a JSON body: { oldBulkStorage: "Bulk Storage 1", newBulkStorage: "Bulk Storage 1 Updated" }
const handleEditBulkStorage = async (req, res, next) => {
  try {
    const { oldBulkStorage, newBulkStorage } = req.body;
    if (
      !oldBulkStorage ||
      !newBulkStorage ||
      !oldBulkStorage.trim() ||
      !newBulkStorage.trim()
    ) {
      return res.status(400).json({
        message: "Both oldBulkStorage and newBulkStorage values are required",
      });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.bulkstorage) {
      return res
        .status(404)
        .json({ message: "Inventory or bulk storage not found" });
    }
    const index = inventory.bulkstorage.findIndex(
      (bs) => bs.bulkStorage === oldBulkStorage.trim()
    );
    if (index === -1) {
      return res.status(404).json({ message: "Bulk storage entry not found" });
    }
    inventory.bulkstorage[index].bulkStorage = newBulkStorage.trim();
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

// Delete a bulk storage entry
// Expects bulkStorageName as a URL parameter.
const handleDeleteBulkStorage = async (req, res, next) => {
  try {
    const { bulkStorageName } = req.params;
    if (!bulkStorageName) {
      return res.status(400).json({ message: "Bulk storage name is required" });
    }
    let inventory = await Inventory.findOne({});
    if (!inventory || !inventory.bulkstorage) {
      return res
        .status(404)
        .json({ message: "Inventory or bulk storage not found" });
    }
    inventory.bulkstorage = inventory.bulkstorage.filter(
      (bs) => bs.bulkStorage !== bulkStorageName
    );
    const savedInventory = await inventory.save();
    res.status(200).json(savedInventory);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // ... other exports,
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
  // Bulk Storage endpoints:
  handleAddBulkStorage,
  handleEditBulkStorage,
  handleDeleteBulkStorage,
};

