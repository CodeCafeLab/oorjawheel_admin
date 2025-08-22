import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Error middlewares
import { errorHandler, notFound } from "./middleware/error.js";

import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import deviceMasterRoutes from "./routes/deviceMasterRoutes.js";
import pagesRoutes from "./routes/pageRoutes.js";
import sectionsRoutes from "./routes/sectionRoutes.js";
import elementsRoutes from "./routes/elementRoutes.js";
import deviceEventsRoutes from "./routes/deviceEventRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import usersRoutes from "./routes/userRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import commandLogRoutes from "./routes/commandLogRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:9002")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200
  })
);

// ---------------- Middlewares ----------------
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ---------------- Routes ----------------
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/device-masters", deviceMasterRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/sections", sectionsRoutes);
app.use("/api/elements", elementsRoutes);
app.use("/api/device-events", deviceEventsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/command-logs", commandLogRoutes);
app.use("/api/cms", cmsRoutes);

// ---------------- Server start ----------------
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});
