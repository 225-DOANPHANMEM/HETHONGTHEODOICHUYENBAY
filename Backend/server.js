const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const flightRoutes = require("./routes/flights");
const scheduleRoutes = require("./routes/schedules");
const userRoutes = require("./routes/users");
const dispatchRoutes = require("./routes/dispatch");
const notificationRoutes = require("./routes/notifications");
const followRoutes = require("./routes/follow");
const catalogRoutes = require("./routes/catalog");
const reportRoutes = require("./routes/reports");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend đang chạy tại http://localhost:${PORT}`);
});
