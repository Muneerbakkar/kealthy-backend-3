const Inbound = require("../models/Inbound");
const Location = require("../models/Location");
const InboundRecord = require("../models/InboundRecords");

const moveProductQuantityToLocation = async (req, res) => {
  try {
    const {
      ean,
      name,
      perishable,         // ← new field
      batchNumber,
      quantity,
      zone,
      aisle,
      rack,
      shelf,
      bin,
      pallet,
      manufacturingDate,
      expiryDate,
    } = req.body;

    // Validate required fields.
    if (
      !ean ||
      !name ||
      perishable === undefined ||
      !batchNumber ||
      !quantity ||
      !manufacturingDate ||
      !expiryDate
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields (including perishable)" });
    }

    // ---- Update Inbound Record ----
    // Find the inbound record by EAN.
    const inboundRecord = await Inbound.findOne({ ean });
    if (!inboundRecord) {
      return res.status(404).json({ message: "Inbound record not found" });
    }

    // Find the specified batch within the inbound record.
    const batchIndexInbound = inboundRecord.batches.findIndex(
      (b) => b.batchNumber === batchNumber
    );
    if (batchIndexInbound === -1) {
      return res
        .status(404)
        .json({ message: "Batch not found in inbound record" });
    }

    // Check for sufficient quantity in the inbound batch.
    if (inboundRecord.batches[batchIndexInbound].quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity in inbound batch" });
    }

    // Subtract the moved quantity from the inbound batch.
    inboundRecord.batches[batchIndexInbound].quantity -= quantity;

    // If the updated batch quantity is zero, remove it.
    if (inboundRecord.batches[batchIndexInbound].quantity === 0) {
      inboundRecord.batches.splice(batchIndexInbound, 1);
    } else {
      // Otherwise, update the location and date details in the inbound record.
      inboundRecord.batches[batchIndexInbound].zone = zone;
      inboundRecord.batches[batchIndexInbound].aisle = aisle;
      inboundRecord.batches[batchIndexInbound].rack = rack;
      inboundRecord.batches[batchIndexInbound].shelf = shelf;
      inboundRecord.batches[batchIndexInbound].bin = bin;
      inboundRecord.batches[batchIndexInbound].pallet = pallet;
      inboundRecord.batches[batchIndexInbound].manufacturingDate = new Date(
        manufacturingDate
      );
      inboundRecord.batches[batchIndexInbound].expiryDate = new Date(
        expiryDate
      );
    }

    await inboundRecord.save();

    // ---- Update (or Create) Location Document ----
    // Now include `perishable` in the query
    let locationDoc = await Location.findOne({ ean, name, perishable });
    if (locationDoc) {
      // Look for a matching batch in locationDoc.batches.
      const existingIndex = locationDoc.batches.findIndex(
        (b) =>
          b.batchNumber === batchNumber &&
          b.zone === zone &&
          b.aisle === aisle &&
          b.rack === rack &&
          b.shelf === shelf &&
          b.bin === bin &&
          b.pallet === pallet
      );

      if (existingIndex !== -1) {
        // If found, add the moved quantity and update the dates.
        locationDoc.batches[existingIndex].quantity += quantity;
        locationDoc.batches[existingIndex].manufacturingDate = new Date(
          manufacturingDate
        );
        locationDoc.batches[existingIndex].expiryDate = new Date(expiryDate);
      } else {
        // If not found, push a new batch object.
        locationDoc.batches.push({
          batchNumber,
          quantity,
          zone,
          aisle,
          rack,
          shelf,
          bin,
          pallet,
          manufacturingDate: new Date(manufacturingDate),
          expiryDate: new Date(expiryDate),
        });
      }
    } else {
      // If no Location document exists, create one (including perishable).
      locationDoc = new Location({
        ean,
        name,
        perishable: Boolean(perishable),
        batches: [
          {
            batchNumber,
            quantity,
            zone,
            aisle,
            rack,
            shelf,
            bin,
            pallet,
            manufacturingDate: new Date(manufacturingDate),
            expiryDate: new Date(expiryDate),
          },
        ],
      });
    }

    await locationDoc.save();

    // ---- Save the move to InboundRecords (upsert) ----
    // Include perishable in the filter and $setOnInsert for first‐time creation.
    await InboundRecord.updateOne(
      { ean, name, perishable },
      {
        $setOnInsert: { ean, name, perishable },
        $push: {
          batches: {
            batchNumber,
            quantity,
            zone,
            aisle,
            rack,
            shelf,
            bin,
            pallet,
            manufacturingDate: new Date(manufacturingDate),
            expiryDate: new Date(expiryDate),
          },
        },
      },
      { upsert: true }
    );

    return res.status(200).json({
      message: "Product moved successfully",
      inboundRecord,
      locationDoc,
    });
  } catch (error) {
    console.error("Error moving product quantity:", error);
    return res
      .status(500)
      .json({ error: "Error moving product quantity" });
  }
};

module.exports = { moveProductQuantityToLocation };
