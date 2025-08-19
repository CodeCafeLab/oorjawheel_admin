import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Error middlewares
import { errorHandler, notFound } from "./middleware/error.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import deviceMasterRoutes from "./routes/deviceMasterRoutes.js";
import pagesRoutes from "./routes/pageRoutes.js";
import sectionsRoutes from "./routes/sectionRoutes.js";
import elementsRoutes from "./routes/elementRoutes.js";
import deviceEventsRoutes from "./routes/deviceEventRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import usersRoutes from "./routes/userRoutes.js";

const app = express();

// ---------------- CORS ----------------
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

// ---------------- Middlewares ----------------
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ---------------- Routes ----------------
app.use("/auth", authRoutes);
app.use("/devices", deviceRoutes);
app.use("/api/device-masters", deviceMasterRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/sections", sectionsRoutes);
app.use("/api/elements", elementsRoutes);
app.use("/api/device-events", deviceEventsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", usersRoutes);

// ---------------- Server start ----------------
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});
