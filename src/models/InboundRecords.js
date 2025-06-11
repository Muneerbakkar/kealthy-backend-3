const mongoose = require("mongoose");

const InboundRecordBatchSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true },
    zone: { type: String },
    aisle: { type: String },
    rack: { type: String },
    shelf: { type: String },
    bin: { type: String },
    pallet: { type: String },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

const InboundRecordSchema = new mongoose.Schema(
  {
    ean: { type: String, required: true },
    name: { type: String, required: true },
    perishable: { type: Boolean, required: true }, // ← added perishable
    batches: [InboundRecordBatchSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("InboundRecord", InboundRecordSchema);
