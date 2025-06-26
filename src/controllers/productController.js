const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const {
      productName,
      ean,
      netWeight,
      netWeightUnit,
      perishable,
      locations,
    } = req.body;

    // If a product with the same name & EAN already exists, abort.
    const existing = await Product.findOne({ ean });
    if (existing) {
      return res.status(400).json({
        message: "A product with this EAN already exists.",
      });
    }

    // Otherwise, create a new product
    const product = new Product({
      productName,
      ean,
      netWeight,
      netWeightUnit,
      perishable,
      locations,
    });
    await product.save();

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const query = req.query.query || "";
    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { ean: { $regex: query, $options: "i" } },
      ],
    });
    res.json({ products });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      ean,
      locations,
      netWeight,
      netWeightUnit,
      perishable,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, ean, locations, netWeight, netWeightUnit, perishable },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// (Optional) Get all products
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getProductByEAN = async (req, res, next) => {
  try {
    const { ean } = req.params;
    if (!ean) {
      return res.status(400).json({ message: "EAN number is required" });
    }
    // Include netWeight and netWeightUnit fields in the projection.
    const product = await Product.findOne(
      { ean },
      "productName ean netWeight netWeightUnit locations perishable"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductByEAN,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
