const express = require("express");
const {
  createProduct,
  getProducts,
  getProductByEAN,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts); // Optional endpoint to list all products
// Endpoint to fetch product location details by EAN
router.get("/ean/:ean", getProductByEAN);
// Search products
router.get("/search", searchProducts);

// Get product details by ID
router.get("/:id", getProductById);

// Update product details
router.put("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;
