const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.database();

exports.transferSubscriptions = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.ref("subscriptions").once("value");
    const subscriptions = snapshot.val();

    if (!subscriptions) {
      console.log("❌ No subscriptions found.");
      return res.send("No subscriptions found");
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const tasks = Object.entries(subscriptions).map(async ([id, sub]) => {
      const start = new Date(sub.startDate);
      const end = new Date(sub.endDate);
      const todayDate = new Date(todayStr);

      if (todayDate >= start && todayDate <= end) {
        const orderId = Date.now().toString();
        const match = sub.planTitle?.match(/^(\d+)-Day/);
        const numberOfDays = match ? parseInt(match[1]) : 1;

        const perDayAmount = sub.totalAmountToPay
          ? Math.round(sub.totalAmountToPay / numberOfDays)
          : 0;

        const deliveryFee = sub.deliveryFee || 0;
        const handlingFee = 5;
        const totalToPay = perDayAmount + deliveryFee + handlingFee;

        const rawQty = sub.subscriptionQty || "1";
        const cleanQty = parseInt(rawQty.replace(/[^\d]/g, "")) || 1;

        const order = {
          DA: sub.DA || "Waiting",
          DAMOBILE: sub.DAMOBILE || "Waiting",
          Name: sub.Name || "",
          assignedto: sub.assignedto || "NotAssigned",
          cookinginstrcutions: "Don't send cutleries, tissues, straws, etc.",
          createdAt: today.toISOString(),
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
              item_price: perDayAmount,
              item_ean: sub.item_ean || "",
            },
          ],
          paymentmethod: sub.paymentmethod || "Prepaid",
          phoneNumber: sub.phoneNumber || "",
          selectedDirections: sub.selectedDirections || "",
          selectedLatitude: sub.selectedLatitude || "",
          selectedLongitude: sub.selectedLongitude || "",
          selectedRoad: sub.selectedRoad || "",
          selectedSlot: `${today.toDateString()}, ${sub.selectedSlot || ""}`,
          selectedType: sub.selectedType || "Home",
          status: "Order Placed",
          totalAmountToPay: totalToPay,
          type: "Normal",
        };

        await db.ref(`orders/${orderId}`).set(order);
        console.log(`✅ Order created for subscription: ${id}`);
      }
    });

    await Promise.all(tasks);
    res.send("🎉 All orders created successfully.");
  } catch (err) {
    console.error("🔥 Error in transferSubscriptions:", err);
    res.status(500).send("Server error");
  }
});
