const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("../src/config/db");
const orderRoutes = require("../src/routes/orderRoutes");
const productRoutes = require("../src/routes/productRoutes");
const inventoryRoutes = require("../src/routes/inventoryRoutes");
const zoneRoutes = require("../src/routes/zoneRoutes");
const inboundRoutes = require("../src/routes/inboundRoutes");
const moveRoutes = require("../src/routes/moveRoutes");
const locationRoutes = require("../src/routes/locationRoutes");
const packingRoutes = require("../src/routes/packingRoutes");
const rackRoutes = require("../src/routes/rackRoutes");
const inboundRecordsRouter = require("../src/routes/inboundRecords");
const { errorHandler } = require("../src/middleware/errorMiddleware");
const startSubscriptionCron = require("../src/cron/subscription");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// ✅ CORS setup (safe for Netlify, localhost, etc.)
app.use(
  cors({
    origin: true, // Reflects the request origin
    credentials: true, // Enables cookies and headers
  })
);

// API Routes
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/zone", zoneRoutes);
app.use("/api/inbound", inboundRoutes);
app.use("/api/move", moveRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/packing", packingRoutes);
app.use("/api/rack", rackRoutes);
app.use("/api/inbound-records", inboundRecordsRouter);

// Global Error Handler
app.use(errorHandler);

// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Start the Subscription Cron Job
startSubscriptionCron();
