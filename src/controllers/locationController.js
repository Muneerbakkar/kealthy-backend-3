// controllers/locationController.js
const Location = require("../models/Location");

const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    return res.json(locations);
  } catch (error) {
    console.error("Error fetching location records:", error);
    return res.status(500).json({ error: "Error fetching location records" });
  }
};

// const getLocationByEAN = async (req, res) => {
//   try {
//     const { ean } = req.params;
//     // Find the location document by EAN
//     const locationDoc = await Location.findOne({ ean });
//     if (!locationDoc) {
//       return res
//         .status(404)
//         .json({ message: "Location not found for provided EAN" });
//     }
//     // Filter the batches array to only include those with zone "Zone 1"
//     const zone1Batches = locationDoc.batches.filter(
//       (batch) => batch.zone === "Zone 1"
//     );

//     // Return a new object with the same ean and name, but only zone1 batches.
//     res.status(200).json({
//       ean: locationDoc.ean,
//       name: locationDoc.name,
//       batches: zone1Batches,
//     });
//   } catch (error) {
//     console.error("Error fetching location:", error);
//     res.status(500).json({ message: "Server error fetching location" });
//   }
// };

const getLocationByEAN = async (req, res) => {
  try {
    const { ean } = req.params;
    // Find the location document by EAN
    const locationDoc = await Location.findOne({ ean });
    if (!locationDoc) {
      return res
        .status(404)
        .json({ message: "Location not found for provided EAN" });
    }

    // Return all batches for this location
    res.status(200).json({
      ean: locationDoc.ean,
      name: locationDoc.name,
      batches: locationDoc.batches, // <-- no filtering
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ message: "Server error fetching location" });
  }
};

// NEW: Fetch all locations/batches regardless of zone by EAN
const getAllLocationByEAN = async (req, res) => {
  try {
    const { ean } = req.params;

    const locationDoc = await Location.findOne({ ean });

    if (!locationDoc) {
      return res
        .status(404)
        .json({ message: "Location not found for provided EAN" });
    }

    res.status(200).json({
      ean: locationDoc.ean,
      name: locationDoc.name,
      batches: locationDoc.batches, // return all batches
    });
  } catch (error) {
    console.error("Error fetching location by EAN:", error);
    res.status(500).json({ message: "Server error fetching location" });
  }
};

// NEW: Function to reduce quantity for all batches that match the given storage details
const reduceStorageQuantity = async (req, res) => {
  try {
    const { ean, aisle, rack, shelf, bin } = req.params;
    const { reduceBy } = req.body;

    console.log(
      "PATCH request for EAN:",
      ean,
      "Storage:",
      `Aisle: ${aisle}, Rack: ${rack}, Shelf: ${shelf}, Bin: ${bin}`,
      "Reduce by:",
      reduceBy
    );

    // Find the location by its EAN
    const location = await Location.findOne({ ean });
    if (!location) {
      console.log("Location not found");
      return res.status(404).json({ message: "Location not found" });
    }

    // Update all batches that match the specified storage details
    const updatedBatches = [];
    location.batches.forEach((batch) => {
      if (
        batch.aisle === aisle &&
        batch.rack === rack &&
        batch.shelf === shelf &&
        batch.bin === bin
      ) {
        batch.quantity = Math.max(0, batch.quantity - reduceBy);
        updatedBatches.push(batch);
      }
    });

    if (updatedBatches.length === 0) {
      console.log("No batches found for the specified storage details");
      return res.status(404).json({
        message: "No batches found for the specified storage details",
      });
    }

    await location.save();
    console.log("Updated batches:", updatedBatches);
    res.status(200).json({
      message: "Storage quantities reduced successfully",
      updatedBatches,
    });
  } catch (error) {
    console.error("Error reducing storage quantity:", error);
    res.status(500).json({ message: "Server error reducing storage quantity" });
  }
};

const transferQuantity = async (req, res) => {
  try {
    const { ean } = req.params;
    const { fromZone, toZone, quantity } = req.body;

    if (!fromZone || !toZone || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid transfer details." });
    }

    // Find the location document
    const location = await Location.findOne({ ean });

    if (!location) {
      return res
        .status(404)
        .json({ message: "Location not found for provided EAN." });
    }

    // Find source batch
    const fromBatch = location.batches.find((batch) => batch.zone === fromZone);
    if (!fromBatch) {
      return res
        .status(404)
        .json({ message: `No batch found in ${fromZone}.` });
    }
    if (fromBatch.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Not enough stock in source location." });
    }

    // Find or create the destination batch
    let toBatch = location.batches.find((batch) => batch.zone === toZone);
    if (!toBatch) {
      // If destination batch doesn't exist, create a new one
      toBatch = {
        zone: toZone,
        quantity: 0, // Start with zero and increase
        aisle: fromBatch.aisle || null,
        rack: fromBatch.rack || null,
        shelf: fromBatch.shelf || null,
        bin: fromBatch.bin || null,
        pallet: fromBatch.pallet || null,
      };
      location.batches.push(toBatch);
    }

    // Transfer the quantity
    fromBatch.quantity -= quantity;
    toBatch.quantity += quantity;

    // Save the updated location data
    await location.save();

    res.status(200).json({
      message: `Successfully transferred ${quantity} from ${fromZone} to ${toZone}.`,
      updatedBatches: location.batches,
    });
  } catch (error) {
    console.error("Error transferring quantity:", error);
    res.status(500).json({ message: "Server error during transfer." });
  }
};

/**
 * GET /api/location?date=YYYY-MM-DD
 * Returns only records whose createdAt falls on that date.
 */
const getLocationsByDate = async (req, res) => {
  try {
    const filter = {};

    if (req.query.date) {
      const target = new Date(req.query.date);
      const startOfDay = new Date(target.setHours(0, 0, 0, 0));
      const endOfDay = new Date(target.setHours(23, 59, 59, 999));

      filter.batches = {
        $elemMatch: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      };
    }

    const locations = await Location.find(filter);
    return res.json(locations);
  } catch (error) {
    console.error("Error fetching dated batch locations:", error);
    return res
      .status(500)
      .json({ error: "Error fetching location records by batch date" });
  }
};

/**
 * GET /api/location/history/:ean
 * Returns the Location doc for that EAN (all batches), regardless of date.
 */
const getLocationHistory = async (req, res) => {
  try {
    const { ean } = req.params;
    const locationDoc = await Location.findOne({ ean });
    if (!locationDoc) {
      return res
        .status(404)
        .json({ message: "No location data found for that EAN" });
    }
    return res.json(locationDoc);
  } catch (error) {
    console.error("Error fetching location history:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching location history" });
  }
};

// DELETE /api/location/:id
const deleteLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Location.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Location not found" });
    }
    return res.json({ message: "Location deleted successfully" });
  } catch (err) {
    console.error("Error deleting location:", err);
    return res.status(500).json({ error: "Error deleting location" });
  }
};

// Handler for paginated stock across ALL zones
async function getAllZonesStockPaginated(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || "").trim();

    const match = {};
    if (search) {
      match.$or = [
        { ean: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const agg = await Location.aggregate([
      { $unwind: "$batches" },
      { $match: match },
      {
        $group: {
          _id: "$ean",
          name: { $first: "$name" },
          quantity: { $sum: "$batches.quantity" },
        },
      },
      { $project: { _id: 0, ean: "$_id", name: 1, quantity: 1 } },
      { $sort: { name: 1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    const metadata = agg[0].metadata[0] || { total: 0 };
    res.json({
      total: metadata.total,
      page,
      limit,
      data: agg[0].data,
    });
  } catch (error) {
    console.error("Error in getAllZonesStockPaginated:", error);
    res.status(500).json({ error: "Server error fetching all-zones stock" });
  }
}

const updateLocationById = async (req, res) => {
  try {
    const updates = req.body;
    const updated = await Location.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Location not found" });
    }
    return res.json(updated);
  } catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({ message: "Error updating location" });
  }
};

const searchLocations = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }
    const results = await Location.find({
      $or: [
        { ean: query }, // exact match on EAN
        { name: { $regex: query, $options: "i" } }, // partial, case-insensitive on Name
      ],
    });
    return res.json(results);
  } catch (error) {
    console.error("Error searching locations:", error);
    return res.status(500).json({ message: "Server error during search" });
  }
};

const getTotalExpiringCount = async (req, res) => {
  try {
    const now = new Date();

    // build your two targets
    const fourDaysOut = new Date(now);
    fourDaysOut.setDate(now.getDate() + 4);
    fourDaysOut.setHours(23, 59, 59, 999);

    const oneMonthOut = new Date(now);
    oneMonthOut.setMonth(now.getMonth() + 1);
    oneMonthOut.setHours(23, 59, 59, 999);

    // aggregate: unwind batches, then match either perishable ≤4d or non-perishable ≤1m
    const [{ count = 0 } = {}] = await Location.aggregate([
      { $unwind: '$batches' },
      {
        $match: {
          $or: [
            {
              perishable: true,
              'batches.expiryDate': { $gte: now, $lte: fourDaysOut }
            },
            {
              perishable: false,
              'batches.expiryDate': { $gte: now, $lte: oneMonthOut }
            }
          ]
        }
      },
      { $count: 'count' }
    ]);

    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching total expiring count:", error);
    return res
      .status(500)
      .json({ error: "Server error fetching total expiring count" });
  }
};

const getExpiringWithinFourDays = async (req, res) => {
  try {
    const now = new Date();
    const target = new Date(now);
    target.setDate(target.getDate() + 4);
    target.setHours(23, 59, 59, 999);

    const results = await Location.aggregate([
      // only perishable products
      { $match: { perishable: true } },
      { $unwind: "$batches" },
      {
        $match: {
          "batches.expiryDate": {
            $gte: now,
            $lte: target,
          },
        },
      },
      {
        $project: {
          _id: 0,
          ean: 1,
          name: 1,
          batch: "$batches",
        },
      },
    ]);

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching expiring products:", error);
    return res
      .status(500)
      .json({ error: "Server error fetching expiring products" });
  }
};

const getExpiringWithinOneMonth = async (req, res) => {
  try {
    const now = new Date();
    const target = new Date(now);
    target.setMonth(target.getMonth() + 1);
    target.setHours(23, 59, 59, 999);

    const results = await Location.aggregate([
      // only non-perishable products
      { $match: { perishable: false } },
      { $unwind: "$batches" },
      {
        $match: {
          "batches.expiryDate": {
            $gte: now,
            $lte: target,
          },
        },
      },
      {
        $project: {
          _id: 0,
          ean: 1,
          name: 1,
          batch: "$batches",
        },
      },
    ]);

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching expiring-in-1-month products:", error);
    return res
      .status(500)
      .json({ error: "Server error fetching expiring-in-1-month products" });
  }
};



module.exports = {
  getAllLocations,
  getLocationByEAN,
  reduceStorageQuantity,
  getAllLocationByEAN,
  transferQuantity,
  getLocationsByDate,
  getLocationHistory,
  deleteLocationById,
  getAllZonesStockPaginated,
  updateLocationById,
  searchLocations,
  getTotalExpiringCount,
  getExpiringWithinFourDays,
  getExpiringWithinOneMonth,
};
