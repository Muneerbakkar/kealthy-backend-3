const Zone = require("../models/Zone");

const createZoneEntry = async (req, res, next) => {
  try {
    const {
      ean,
      name,
      aisle,
      bay,
      shelf,
      bin,
      limit,
      quantity,
      batchNumber,
      manufacturingDate,
      expiringDate,
    } = req.body;

    // Build the new entry object (do not include a "zone" property if you don't want it stored)
    const newEntry = {
      ean,
      name,
      aisle,
      bay,
      shelf,
      bin,
      limit,
      quantity,
      batchNumber,
      manufacturingDate,
      expiringDate,
    };

    // Option: Either create a new document if none exists or update an existing one.
    // Here, we assume a single document that stores all zone entries.
    let zoneDoc = await Zone.findOne();
    if (!zoneDoc) {
      // No document exists; create one with the new entry as the first element in the zone1 array.
      zoneDoc = new Zone({ zone1: [newEntry] });
    } else {
      // Document exists; push the new entry into the zone1 array.
      zoneDoc.zone1.push(newEntry);
    }
    await zoneDoc.save();

    res
      .status(201)
      .json({ message: "Zone data stored successfully", data: zoneDoc });
  } catch (error) {
    next(error);
  }
};

module.exports = { createZoneEntry };
