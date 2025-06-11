const PackingOrder = require("../models/PackingOrder");

async function moveToPacking(req, res) {
  const { Name, orderId, orderItems, totalAmountToPay } = req.body;

  // Validate required fields
  if (!Name || !orderId || !orderItems) {
    return res.status(400).json({ message: "Missing required order details" });
  }

  try {
    const newPackingOrder = new PackingOrder({
      Name,
      orderId,
      orderItems,
      totalAmountToPay,
    });

    await newPackingOrder.save();

    return res.status(201).json({
      message: "Order moved to packing successfully",
      order: newPackingOrder,
    });
  } catch (error) {
    console.error("Error saving packing order:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getPackingOrders(req, res) {
  try {
    // Only fetch orders where the status field is "Packing"
    const orders = await PackingOrder.find({ status: "Packing" });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching packing orders:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { moveToPacking, getPackingOrders };
