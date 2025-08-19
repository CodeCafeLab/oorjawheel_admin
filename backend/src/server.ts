import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/auth.js";
import devicesRoutes from "./routes/devices.js";
import deviceMastersRoutes from "./routes/deviceMasters.js";
import pagesRoutes from "./routes/pages.js";
import sectionsRoutes from "./routes/sections.js";
import elementsRoutes from "./routes/elements.js";
import deviceEventsRoutes from "./routes/deviceEvents.js";
import analyticsRoutes from "./routes/analytics.js";
import usersRoutes from "./routes/users.js";
const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Mount routes under /api
app.use("/api/auth", authRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/device-masters", deviceMastersRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/sections", sectionsRoutes);
app.use("/api/elements", elementsRoutes);
app.use("/api/device-events", deviceEventsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", usersRoutes);

// Error handler
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
