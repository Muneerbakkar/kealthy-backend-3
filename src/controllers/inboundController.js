// controllers/inboundController.js
const Inbound = require("../models/Inbound");
const Location = require("../models/Location"); // Import the Location model

// const createInbound = async (req, res) => {
//   try {
//     const { ean, name, limit, batches } = req.body;

//     // Retrieve an existing inbound record for the given EAN.
//     const existingInbound = await Inbound.findOne({ ean });

//     // If an inbound record exists, check for duplicate batches.
//     if (existingInbound) {
//       for (const newBatch of batches) {
//         const newManufacturingDate = new Date(newBatch.manufacturingDate)
//           .toISOString()
//           .split("T")[0];
//         const newExpiryDate = new Date(newBatch.expiryDate)
//           .toISOString()
//           .split("T")[0];

//         const duplicate = existingInbound.batches.find((batch) => {
//           const existingManufacturingDate = new Date(batch.manufacturingDate)
//             .toISOString()
//             .split("T")[0];
//           const existingExpiryDate = new Date(batch.expiryDate)
//             .toISOString()
//             .split("T")[0];

//           return (
//             batch.batchNumber === newBatch.batchNumber &&
//             existingManufacturingDate === newManufacturingDate &&
//             existingExpiryDate === newExpiryDate
//           );
//         });

//         if (duplicate) {
//           return res.status(400).json({
//             error: `Batch ${newBatch.batchNumber} with the same manufacturing and expiry dates already exists.`,
//           });
//         }
//       }
//     }

//     // If no duplicate batch is found, create the inbound record.
//     const newInbound = new Inbound({ ean, name, limit, batches });
//     const savedInbound = await newInbound.save();
//     return res.status(201).json(savedInbound);
//   } catch (error) {
//     console.error("Error saving inbound data:", error);
//     return res.status(500).json({ error: "Error saving inbound data" });
//   }
// };

const getInboundByEan = async (req, res) => {
  try {
    const { ean } = req.params;
    const inboundData = await Inbound.find({ ean });
    if (!inboundData) {
      return res.status(404).json({ message: "Inbound record not found" });
    }
    return res.json(inboundData);
  } catch (error) {
    console.error("Error fetching inbound data:", error);
    return res.status(500).json({ error: "Error fetching inbound data" });
  }
};

// GET /api/inbound/history/:ean
const getInboundHistory = async (req, res) => {
  try {
    const { ean } = req.params;
    const records = await Inbound.find({ ean });
    if (!records.length) {
      return res.status(404).json({ message: "No records for this EAN." });
    }
    return res.json(records);
  } catch (error) {
    console.error("Error fetching inbound by EAN:", error);
    return res.status(500).json({ error: "Error fetching records" });
  }
};

const createOrUpdateInbound = async (req, res) => {
  try {
    const {
      ean,
      name,
      netWeight,
      netWeightUnit,
      perishable,   // ← frontend sends this
      batches,
    } = req.body;

    // Sanitize each incoming batch; if quantity is not provided, set it to 0.
    const sanitizedBatches = batches.map((batch) => ({
      ...batch,
      quantity: batch.quantity || 0,
    }));

    // --- Location Collection Check (unchanged) --- //
    for (const newBatch of sanitizedBatches) {
      const duplicateInLocation = await Location.findOne({
        ean,
        batches: {
          $elemMatch: {
            batchNumber: newBatch.batchNumber,
            manufacturingDate: new Date(newBatch.manufacturingDate),
            expiryDate: new Date(newBatch.expiryDate),
          },
        },
      });
      if (duplicateInLocation) {
        return res.status(400).json({
          error: `Batch ${newBatch.batchNumber} with the same manufacturing and expiry dates already exists in location.`,
        });
      }
    }
    // --- End Location Check --- //

    // Find an existing inbound record for this EAN
    let inboundRecord = await Inbound.findOne({ ean });

    if (inboundRecord) {
      // Check for duplicate batches based on batchNumber
      for (const newBatch of sanitizedBatches) {
        const duplicate = inboundRecord.batches.find(
          (batch) => batch.batchNumber === newBatch.batchNumber
        );
        if (duplicate) {
          return res.status(400).json({
            error: `Batch ${newBatch.batchNumber} already exists.`,
          });
        }
      }

      // Push the new batches
      inboundRecord.batches.push(...sanitizedBatches);

      // ** Update perishable, name, netWeight, netWeightUnit, etc. **
      inboundRecord.name = name;
      inboundRecord.netWeight = netWeight;
      inboundRecord.netWeightUnit = netWeightUnit;
      inboundRecord.perishable = Boolean(perishable);

      const savedInbound = await inboundRecord.save();
      return res.status(200).json(savedInbound);
    } else {
      // Create a new Inbound document including netWeight, perishable, etc.
      const newInbound = new Inbound({
        ean,
        name,
        netWeight,
        netWeightUnit,
        perishable: Boolean(perishable),
        limit: 0,            // or batchLimit? adjust to your schema
        batches: sanitizedBatches,
      });
      const savedInbound = await newInbound.save();
      return res.status(201).json(savedInbound);
    }
  } catch (error) {
    console.error("Error saving inbound data:", error);
    return res.status(500).json({ error: "Error saving inbound data" });
  }
};

const updateInboundRecord = async (req, res) => {
  try {
    // Expect both the product's EAN and the batch's ID in the URL.
    const { ean, batchId } = req.params;
    // The request body should include updated values for name, limit, and the updated batch details.
    const { name, limit, updatedBatch } = req.body;
    // Use the positional operator ($) to update only the batch that matches the provided batchId.
    const updatedInbound = await Inbound.findOneAndUpdate(
      { ean, "batches._id": batchId },
      {
        $set: {
          name,
          limit,
          "batches.$.batchNumber": updatedBatch.batchNumber,
          "batches.$.quantity": updatedBatch.quantity,
          "batches.$.manufacturingDate": updatedBatch.manufacturingDate,
          "batches.$.expiryDate": updatedBatch.expiryDate,
          "batches.$.limit": updatedBatch.limit,
        },
      },
      { new: true }
    );
    if (!updatedInbound) {
      return res
        .status(404)
        .json({ error: "Inbound record or batch not found" });
    }
    return res.json(updatedInbound);
  } catch (error) {
    console.error("Error updating inbound record:", error);
    return res.status(500).json({ error: "Error updating inbound record" });
  }
};

// New controller to update only a specific batch
const updateBatchRecord = async (req, res) => {
  try {
    const { ean, batchId } = req.params;
    const { updatedBatch } = req.body;
    // updatedBatch should contain the new values for:
    // batchNumber, quantity, manufacturingDate, expiryDate, and limit

    const updatedInbound = await Inbound.findOneAndUpdate(
      { ean, "batches._id": batchId },
      {
        $set: {
          "batches.$.batchNumber": updatedBatch.batchNumber,
          "batches.$.quantity": updatedBatch.quantity,
          "batches.$.manufacturingDate": updatedBatch.manufacturingDate,
          "batches.$.expiryDate": updatedBatch.expiryDate,
          "batches.$.limit": updatedBatch.limit,
        },
      },
      { new: true }
    );

    if (!updatedInbound) {
      return res
        .status(404)
        .json({ error: "Inbound record or batch not found" });
    }
    return res.json(updatedInbound);
  } catch (error) {
    console.error("Error updating batch record:", error);
    return res.status(500).json({ error: "Error updating batch record" });
  }
};

// const updateInboundRecord = async (req, res) => {
//   try {
//     const { ean } = req.params;
//     const { name, limit, batches } = req.body;
//     // Use upsert:true so that if no record exists, one is created.
//     const updatedInbound = await Inbound.findOneAndUpdate(
//       { ean },
//       { ean, name, limit, batches },
//       { new: true, upsert: true }
//     );
//     return res.json(updatedInbound);
//   } catch (error) {
//     console.error("Error updating inbound record:", error);
//     return res.status(500).json({ error: "Error updating inbound record" });
//   }
// };

// GET /api/inbound[?date=YYYY-MM-DD]
const getAllInboundRecords = async (req, res) => {
  try {
    // parse date from query or default to today
    const target = req.query.date ? new Date(req.query.date) : new Date();

    const startOfDay = new Date(target);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(target);
    endOfDay.setHours(23, 59, 59, 999);

    const inboundRecords = await Inbound.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    return res.json(inboundRecords);
  } catch (error) {
    console.error("Error fetching today's inbound records:", error);
    return res.status(500).json({ error: "Error fetching records" });
  }
};

const getTodayInboundRecords = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const inboundRecords = await Inbound.aggregate([
      {
        $match: {
          batches: {
            $elemMatch: {
              createdAt: { $gte: startOfDay, $lte: endOfDay },
            },
          },
        },
      },
    ]);

    return res.json(inboundRecords);
  } catch (error) {
    console.error("Error fetching today's batch records:", error);
    return res.status(500).json({ error: "Error fetching batch-level records" });
  }
};


module.exports = {
  // createInbound,
  getInboundByEan,
  updateInboundRecord,
  getAllInboundRecords,
  createOrUpdateInbound,
  updateBatchRecord,
  getInboundHistory,
  getTodayInboundRecords,
};
