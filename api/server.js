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
// Cron Job
const startSubscriptionCron = require("../src/cron/subscription");

dotenv.config();

// Connect to MongoDB
connectDB();

// Optional: Seed Rack Locations if environment variable is set
// if (process.env.SEED_RACK_LOCATIONS === "true") {
//   const RackLocation = require("../src/models/RackLocation");
//   const seedRackLocations = async () => {
//     try {
//       const count = await RackLocation.countDocuments();
//       if (count === 0) {
//         console.log("Seeding rack locations...");
//         const locations = [];
//         // Create a single rack (Rack 1) with 4 shelves and 4 bins each
//         for (let shelf = 1; shelf <= 4; shelf++) {
//           for (let bin = 1; bin <= 4; bin++) {
//             locations.push({ rack: 1, shelf, bin, booked: false });
//           }
//         }
//         await RackLocation.insertMany(locations);
//         console.log("Rack locations populated.");
//       } else {
//         console.log("Rack locations already seeded.");
//       }
//     } catch (err) {
//       console.error("Error seeding rack locations:", err);
//     }
//   };
//   seedRackLocations();
// }

const app = express();

// Middleware
app.use(express.json());
// app.use(cors());

app.use(
  cors({
    origin: ["https://kealthy-inventory.netlify.app"],
    credentials: true,
  })
);

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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Start Cron Job
startSubscriptionCron();
