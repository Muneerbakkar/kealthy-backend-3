const RackOrder = require("../models/RackOrder");
const PackingOrder = require("../models/PackingOrder");

async function getRackOrders(req, res) {
  try {
    // Fetch all rack orders
    const orders = await RackOrder.find({});
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching rack orders:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function moveOrderToRack(req, res) {
  const { order } = req.body;

  if (!order || !order.orderId) {
    return res.status(400).json({ message: "Invalid order details." });
  }

  try {
    // Directly assign the order to rack 1 (only the rack field is used)
    const location = { rack: 1 };

    // Save a new RackOrder record
    const rackOrder = new RackOrder({ order, location });
    await rackOrder.save();

    // Delete the corresponding PackingOrder document from the collection
    await PackingOrder.findOneAndDelete({ orderId: order.orderId });

    return res.status(201).json({
      message:
        "Order moved to rack successfully and removed from packing orders.",
      location,
    });
  } catch (error) {
    console.error("Error moving order to rack:", error);
    return res.status(500).json({ message: "Server error." });
  }
}

async function assignRackOrder(req, res) {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: "Invalid order id." });
  }
  try {
    // Find the RackOrder by matching the order.orderId and update its status to "Assigned"
    const rackOrder = await RackOrder.findOneAndUpdate(
      { "order.orderId": orderId },
      { status: "Assigned" },
      { new: true }
    );
    if (!rackOrder) {
      return res.status(404).json({ message: "Rack order not found." });
    }
    return res
      .status(200)
      .json({ message: "Rack order status updated to Assigned", rackOrder });
  } catch (error) {
    console.error("Error updating rack order status:", error);
    return res.status(500).json({ message: "Server error." });
  }
}

async function deleteRackOrder(req, res) {
  try {
    const { id } = req.params;
    const deletedOrder = await RackOrder.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Rack order not found." });
    }
    return res.status(200).json({
      message: "Rack order deleted successfully",
      order: deletedOrder,
    });
  } catch (error) {
    console.error("Error deleting rack order:", error);
    return res.status(500).json({ message: "Server error." });
  }
}

module.exports = {
  moveOrderToRack,
  getRackOrders,
  assignRackOrder,
  deleteRackOrder,
};
