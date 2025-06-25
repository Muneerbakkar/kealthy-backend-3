// controllers/inboundRecordController.js

const InboundRecord = require("../models/InboundRecords");

/**
 * const getInboundRecords = async (req, res) => { … }
 *
 * Expects optional query parameters:
 *   • start = "YYYY-MM-DD"
 *   • end   = "YYYY-MM-DD"
 *
 * If both are provided, returns only those InboundRecord documents whose
 * createdAt ∈ [start 00:00:00, end 23:59:59.999]. Otherwise, returns all.
 */
const getInboundRecords = async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = {};

    if (start && end) {
      // Parse start/end as local dates
      const startDate = new Date(start);
      const endDate = new Date(end);

      // Make endDate inclusive by pushing it to 23:59:59.999
      endDate.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Fetch matching InboundRecord documents
    const records = await InboundRecord.find(filter).lean();
    return res.status(200).json(records);
  } catch (error) {
    console.error("Error in getInboundRecords:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const getInboundSummary = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6); // 7-day window including today

    const monthStart = new Date(todayStart);
    monthStart.setDate(1); // beginning of the month

    const [dailyCount, weeklyCount, monthlyCount] = await Promise.all([
      InboundRecord.countDocuments({ createdAt: { $gte: todayStart } }),
      InboundRecord.countDocuments({ createdAt: { $gte: weekStart } }),
      InboundRecord.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    return res.status(200).json({
      daily: dailyCount,
      weekly: weeklyCount,
      monthly: monthlyCount,
    });
  } catch (error) {
    console.error("Error in getInboundSummary:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { getInboundRecords, getInboundSummary };
