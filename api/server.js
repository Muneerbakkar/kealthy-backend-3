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
// const startSubscriptionCron = require("../src/cron/subscription");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5174",
  "https://kealthy-inventory.netlify.app",
];

// ✅ Proper CORS config
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ✅ Set headers explicitly (optional but recommended)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// Routes
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

// Error Handling Middleware
app.use(errorHandler);

// Start Cron Job
// startSubscriptionCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
