const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();

const connectDB = require("./config/db");
const routes = require("./routes");
const path = require("path");
const fs = require("fs");

const { startDeviceHeartbeatMonitor } = require("./services/deviceHeartbeatMonitor");
const { initSocket } = require("./socket/socketServer");

const app = express();

// Create uploads directory automatically
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Web Angular uses cookies, so CORS must allow credentials.
// Mobile Expo/React Native does not need browser CORS, but this keeps web working.
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:4200")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(uploadsDir));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api", routes);

const server = http.createServer(app);
initSocket(server);

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  // Start MQTT only after MongoDB is ready. This avoids Mongoose buffering timeouts.
  require("./mqtt/mqttClient");

  server.listen(port, () => console.log(`Server running on port ${port}`));

  startDeviceHeartbeatMonitor();
  console.log("✅ Device heartbeat monitor started");
}

startServer().catch((err) => {
  console.error("Server startup error:", err.message);
  process.exit(1);
});
