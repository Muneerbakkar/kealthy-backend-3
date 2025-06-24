// controllers/getLowStockProducts.js
const Product = require("../models/Product");
const Location = require("../models/Location");

const getLowStockProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({});
    const lowStockProducts = [];

    for (const product of allProducts) {
      const ean = product.ean;
      const limitQuantity = product.locations.reduce(
        (sum, loc) => sum + (loc.quantity || 0),
        0
      );

      const locationDoc = await Location.findOne({ ean });
      if (
        !locationDoc ||
        !locationDoc.batches ||
        locationDoc.batches.length === 0
      )
        continue;

      const currentStock = locationDoc.batches.reduce(
        (sum, batch) => sum + (batch.quantity || 0),
        0
      );

      const threshold = 0.2 * limitQuantity;

      if (currentStock <= threshold) {
        lowStockProducts.push({
          productName: product.productName,
          ean: product.ean,
          currentStock,
          limitQuantity,
        });
      }
    }

    // ✅ Sort by currentStock in ascending order
    lowStockProducts.sort((a, b) => a.currentStock - b.currentStock);

    return res.status(200).json({
      success: true,
      data: lowStockProducts,
    });
  } catch (error) {
    console.error("Error getting low stock products:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = getLowStockProducts;
