const mongoose = require("mongoose");

const ZoneSchema = new mongoose.Schema(
  {
    zone1: [
      {
        ean: { type: String },
        name: { type: String },
        aisle: { type: String },
        bay: { type: String },
        shelf: { type: String },
        bin: { type: String },
        limit: { type: Number },
        quantity: { type: Number },
        batchNumber: { type: String },
        manufacturingDate: { type: Date },
        expiringDate: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Zone", ZoneSchema);
