import { transferSubscriptionToOrder } from "../src/controllers/subscriptionController.js";

export const config = {
  schedule: "* * * * *", // Runs every day at 9:30 AM IST (UTC+5:30 → UTC 4:00)
};

export default async function handler(req, res) {
  await transferSubscriptionToOrder(req, res);
}
