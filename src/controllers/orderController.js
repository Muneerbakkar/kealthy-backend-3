const moment = require("moment");
const Order = require("../models/order");
const db = require("../config/firebase");

/**
 * Build a MongoDB aggregation $match stage for date filtering.
 * If startDate/endDate ("DD-MM-YYYY") are provided in query, use them;
 * otherwise default to current ISO week clipped to current month.
 */
// Build match stage based on date range
const buildDateMatchStage = (startDate, endDate) => {
  let start, end;

  if (startDate && endDate) {
    const formats = ["DD-MM-YYYY", "D-M-YYYY"];
    start = moment(startDate, formats, true).startOf("day").toDate();
    end = moment(endDate, formats, true).endOf("day").toDate();
  } else {
    const weekStart = moment().startOf("isoWeek");
    const weekEnd = moment().endOf("isoWeek");
    const monthStart = moment().startOf("month");
    const monthEnd = moment().endOf("month");

    start = (weekStart.isBefore(monthStart) ? monthStart : weekStart).toDate();
    end = (weekEnd.isAfter(monthEnd) ? monthEnd : weekEnd).toDate();
  }

  return {
    $match: {
      $expr: {
        $and: [
          {
            $gte: [
              { $dateFromString: { dateString: "$date", format: "%d-%m-%Y" } },
              start,
            ],
          },
          {
            $lte: [
              { $dateFromString: { dateString: "$date", format: "%d-%m-%Y" } },
              end,
            ],
          },
        ],
      },
    },
  };
};

/**
 * Aggregation pipeline to list or group order items by date + product EAN.
 *
 * @returns {Array} Aggregation pipeline stages.
 */
const buildItemAggregationStages = () => [
  { $unwind: "$orderItems" },

  {
    $addFields: {
      time: {
        $dateToString: {
          format: "%H:%M:%S", // 24-hour format
          date: "$createdAt",
          timezone: "Asia/Kolkata", // adjust based on your locale
        },
      },
    },
  },

  {
    $group: {
      _id: {
        date: "$date",
        time: "$time", // from createdAt
        name: "$orderItems.item_name",
        unitPrice: "$orderItems.item_price",
        EAN: "$orderItems.item_EAN",
        customer: "$Name",
        totalAmountToPay: "$totalAmountToPay",
      },
      quantity: { $sum: "$orderItems.item_quantity" },
    },
  },

  {
    $project: {
      _id: 0,
      date: "$_id.date",
      time: "$_id.time",
      name: "$_id.name",
      customer: "$_id.customer",
      unitPrice: "$_id.unitPrice",
      EAN: "$_id.EAN",
      quantity: 1,
      totalAmountToPay: "$_id.totalAmountToPay",
    },
  },

  { $sort: { date: 1, time: 1, name: 1 } },
];

/**
 * GET /orders/week
 * List aggregated order-items for current week (Monday–Sunday, clipped to month).
 */
const getCurrentWeekOrders = async (req, res) => {
  try {
    const matchStage = buildDateMatchStage();
    const pipeline = [matchStage, ...buildItemAggregationStages()];
    const data = await Order.aggregate(pipeline);
    res.json(data);
  } catch (error) {
    console.error("Error fetching current week orders:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * GET /orders
 * Query params: startDate, endDate (both "DD-MM-YYYY").
 * List aggregated order-items in custom date range.
 */
const getOrdersByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        message:
          "Please provide both 'startDate' and 'endDate' in DD-MM-YYYY format.",
      });
    }

    const matchStage = buildDateMatchStage(startDate, endDate);
    const pipeline = [matchStage, ...buildItemAggregationStages()];
    const data = await Order.aggregate(pipeline);
    res.json(data);
  } catch (error) {
    console.error("Error fetching orders by date:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * GET /products/top
 * Optional query: startDate, endDate (DD-MM-YYYY).
 * Returns the top-selling product (highest quantity) in period.
 */

const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const pipeline = [
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.item_name",
          totalQuantity: { $sum: "$orderItems.item_quantity" },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$orderItems.item_price",
                "$orderItems.item_quantity",
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ];

    const topProducts = await Order.aggregate(pipeline);
    res.json(topProducts);
  } catch (error) {
    console.error("Error in getTopProducts:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * GET /orders/hourly
 * Returns count of orders grouped by hour of creation.
 */
const getOrdersByHour = async (req, res) => {
  try {
    const pipeline = [
      // Optionally add date filter here
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          hour: { $concat: [{ $toString: "$_id" }, ":00"] },
          count: 1,
        },
      },
      { $sort: { hour: 1 } },
    ];

    const data = await Order.aggregate(pipeline);
    res.json(data);
  } catch (error) {
    console.error("Error in getOrdersByHour:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * GET /orders/top-times
 * Returns the top 10 busiest hours in 12-hour format (e.g. "3:00 PM").
 */
const getTopOrderTimes = async (req, res) => {
  try {
    const pipeline = [
      // 1) Only include docs where `time` matches "HH:MM:SS"
      {
        $match: {
          time: { $regex: /^([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d$/ },
        },
      },

      // 2) Group by the hour substring ("HH")
      {
        $group: {
          _id: { $substr: ["$time", 0, 2] },
          count: { $sum: 1 },
        },
      },

      // 3) Convert the "_id" (string) to an integer field `hourInt`
      {
        $project: {
          hourInt: { $toInt: "$_id" },
          count: 1,
        },
      },

      // 4) Build the 12-hour formatted label and keep the count
      {
        $project: {
          _id: 0,
          hour: {
            $let: {
              vars: {
                modHour: { $mod: ["$hourInt", 12] },
                suffix: {
                  $cond: [{ $lt: ["$hourInt", 12] }, " AM", " PM"],
                },
              },
              in: {
                $concat: [
                  {
                    $toString: {
                      $cond: [
                        { $eq: ["$$modHour", 0] }, // if modHour is 0 → display 12
                        12,
                        "$$modHour",
                      ],
                    },
                  },
                  ":00",
                  "$$suffix",
                ],
              },
            },
          },
          count: 1,
        },
      },

      // 5) Sort by count desc, then limit to top 10
      { $sort: { count: -1 } },
      { $limit: 10 },
    ];

    const topTimes = await Order.aggregate(pipeline);
    res.json(topTimes);
  } catch (error) {
    console.error("Error in getTopOrderTimes:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Controller function
const getProductSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateMatchStage = buildDateMatchStage(startDate, endDate);

    const pipeline = [
      dateMatchStage,

      {
        $unwind: "$orderItems",
      },

      {
        $addFields: {
          ean: {
            $ifNull: ["$orderItems.item_EAN", "$orderItems.item_ean"],
          },
          item_name: "$orderItems.item_name",
          item_price: "$orderItems.item_price",
          item_quantity: "$orderItems.item_quantity",
          orderId: "$orderId",
        },
      },

      {
        $group: {
          _id: {
            orderId: "$orderId",
            ean: "$ean",
          },
          Name: { $first: "$Name" },
          date: { $first: "$date" },
          time24: {
            $first: {
              $dateToString: {
                format: "%H:%M:%S",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
          },
          createdAt: { $first: "$createdAt" },
          item_name: { $first: "$item_name" },
          item_price: { $first: "$item_price" },
          item_quantity: { $sum: "$item_quantity" },
          totalAmountToPay: { $first: "$totalAmountToPay" },
          ReceivedCOD: { $first: "$ReceivedCOD" },
          ean: { $first: "$ean" },
        },
      },

      {
        $lookup: {
          from: "locations",
          localField: "ean",
          foreignField: "ean",
          as: "locs",
        },
      },
      {
        $unwind: {
          path: "$locs",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          stock: {
            $reduce: {
              input: { $ifNull: ["$locs.batches", []] },
              initialValue: 0,
              in: { $add: ["$$value", "$$this.quantity"] },
            },
          },
        },
      },
      { $project: { locs: 0 } },

      {
        $lookup: {
          from: "productCollection",
          localField: "ean",
          foreignField: "ean",
          as: "prod",
        },
      },
      {
        $unwind: {
          path: "$prod",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          netWeight: "$prod.netWeight",
          netWeightUnit: "$prod.netWeightUnit",
        },
      },
      { $project: { prod: 0 } },

      {
        $sort: { date: 1, time24: 1 },
      },
    ];

    const rawSummary = await Order.aggregate(pipeline);

    const summary = rawSummary.map((item) => ({
      ...item,
      time: moment(item.time24, "HH:mm:ss").format("hh:mm A"),
    }));

    res.json(summary);
  } catch (error) {
    console.error("Error fetching product summary:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const transferSubscriptionToOrder = async (req, res) => {
  try {
    const snapshot = await db.ref("subscriptions").once("value");
    const subscriptions = snapshot.val();

    if (!subscriptions) {
      return res.status(404).json({ message: "No subscriptions found." });
    }

    // ✅ Correctly parse date strings and force local "YYYY-MM-DD"
    const extractDateOnly = (d) => {
      if (!d) return "";
      const date = new Date(d);
      if (isNaN(date)) return "";

      // Adjust timezone offset to get accurate local date
      const offset = date.getTimezoneOffset() * 60000;
      const localISO = new Date(date.getTime() - offset).toISOString();
      return localISO.split("T")[0];
    };

    const todayStr = extractDateOnly(new Date()); // e.g. "2025-06-25"

    const tasks = Object.entries(subscriptions).map(async ([id, sub]) => {
      const startStr = extractDateOnly(sub.startDate);
      const endStr = extractDateOnly(sub.endDate);

      if (!startStr || !endStr) {
        console.warn(
          `⏭️ Skipping subscription ${id} due to invalid date format`
        );
        return;
      }

      // ✅ Only move orders between start and end date (inclusive)
      if (todayStr >= startStr && todayStr <= endStr) {
        const isEndDate = todayStr === endStr;
        const orderId = Date.now().toString();

        // Get number of days from planTitle (e.g. "30-Day Plan")
        const match = sub.planTitle?.match(/^(\d+)-Day/);
        const numberOfDays = match ? parseInt(match[1]) : 1;

        // Calculate per-day amount
        const perDayAmount = sub.totalAmountToPay
          ? Math.round(sub.totalAmountToPay / numberOfDays)
          : 0;

        const deliveryFee = isEndDate ? 0 : sub.deliveryFee || 0;
        const handlingFee = isEndDate ? 0 : 0;
        const totalToPay = isEndDate
          ? 0
          : perDayAmount + deliveryFee + handlingFee;

        // Parse quantity safely
        const rawQty = sub.subscriptionQty ?? "1";
        const rawQtyStr = String(rawQty);
        const cleanQty = parseInt(rawQtyStr.replace(/[^\d]/g, "")) || 1;

        const order = {
          DA: sub.DA || "Waiting",
          DAMOBILE: sub.DAMOBILE || "Waiting",
          Name: sub.Name || "",
          assignedto: sub.assignedto || "NotAssigned",
          cookinginstrcutions: "Don't send cutleries, tissues, straws, etc.",
          createdAt: new Date().toISOString(),
          deliveryFee,
          handlingFee,
          deliveryInstructions: sub.deliveryInstructions || "",
          distance: sub.distance || "0.0",
          fcm_token: sub.fcm_token || "",
          landmark: sub.landmark || "",
          orderId,
          orderItems: [
            {
              item_name: sub.productName,
              item_quantity: cleanQty,
              item_price: isEndDate ? 0 : 120,
              item_ean: sub.item_ean || "",
            },
          ],
          paymentmethod: sub.paymentmethod || "Prepaid",
          phoneNumber: sub.phoneNumber || "",
          selectedDirections: sub.selectedDirections || "",
          selectedLatitude: sub.selectedLatitude || "",
          selectedLongitude: sub.selectedLongitude || "",
          selectedRoad: sub.selectedRoad || "",
          selectedSlot: `${new Date().toDateString()}, ${
            sub.selectedSlot || ""
          }`,
          selectedType: sub.selectedType || "Home",
          status: "Order Placed",
          totalAmountToPay: 120,
          type: "Subscription",
        };

        await db.ref(`orders/${orderId}`).set(order);
        console.log(
          `✅ Order created for subscription ${id}${
            isEndDate ? " (FREE on endDate)" : ""
          }`
        );
      } else {
        console.log(
          `⏭️ Skipping subscription ${id} — not active today (${todayStr})`
        );
      }
    });

    await Promise.all(tasks);

    return res
      .status(200)
      .json({ message: "Orders transferred successfully." });
  } catch (err) {
    console.error("🔥 Error transferring subscriptions:", err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCurrentWeekOrders,
  getOrdersByDate,
  getTopProducts,
  getOrdersByHour,
  getTopOrderTimes,
  getProductSummary,
  transferSubscriptionToOrder,
};
