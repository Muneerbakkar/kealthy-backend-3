const cron = require("node-cron");
const {
  transferSubscriptionToOrder,
} = require("../controllers/orderController");

// 🧪 Run every minute (for testing)
const startSubscriptionCron = () => {
  // cron.schedule("0 7 * * *", () => {
    cron.schedule("* * * * *", () => {
    // cron.schedule("*/10 * * * *", () => {
    console.log("🔄 Cron running every minute (TEST mode)...");
    transferSubscriptionToOrder(
      { query: {} },
      {
        status: () => ({
          json: (data) => console.log("✅ Cron Test Result:", data),
        }),
      }
    );
  });
};

module.exports = startSubscriptionCron;
