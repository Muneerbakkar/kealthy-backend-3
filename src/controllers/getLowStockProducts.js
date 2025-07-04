const Product = require("../models/Product");
const Location = require("../models/Location");

const getLowStockProducts = async (req, res) => {
  try {
    // Fetch everything upfront
    const [allProducts, allLocations] = await Promise.all([
      Product.find({}),
      Location.find({}),
    ]);

    // Create a map of location data by EAN
    const locationMap = new Map();
    allLocations.forEach((loc) => locationMap.set(loc.ean, loc));

    const lowStockProducts = [];

    for (const product of allProducts) {
      const ean = product.ean;
      const limitQuantity = product.locations.reduce(
        (sum, loc) => sum + (loc.quantity || 0),
        0
      );

      const locationDoc = locationMap.get(ean);

      if (
        !locationDoc ||
        !Array.isArray(locationDoc.batches) ||
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

    // Sort by current stock ascending
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
