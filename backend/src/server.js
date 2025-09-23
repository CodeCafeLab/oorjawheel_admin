import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Error middlewares
import { errorHandler, notFound } from "./middleware/error.js";

// Authentication middleware
import { authMiddleware } from "./utils/jwt.js";

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
import notificationRoutes from "./routes/notificationRoutes.js";
import { Router } from "express";
import { getAdminProfile, putAdminProfile, putAdminPassword, getAdminGeneral, putAdminGeneral, getAdminNotifications, putAdminNotifications } from "./controllers/adminSettingsController.js";

const app = express();

const allowedOrigins = [
  'http://localhost:9002',
  'https://6000-firebase-studio-1754361228920.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev',
  'https://ow.codecafelab.in',
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : [])
].filter(Boolean);

// Log allowed origins for debugging
console.log('Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowedOrigin => 
        origin === allowedOrigin || 
        origin.startsWith(allowedOrigin.replace('https://', 'http://')) ||
        origin.startsWith(allowedOrigin.replace('http://', 'https://'))
      )) {
        callback(null, true);
      } else {
        console.log('CORS blocked for origin:', origin);
        callback(new Error(`Not allowed by CORS. Origin ${origin} not in allowed origins`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// ---------------- Middlewares ----------------
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ---------------- Routes ----------------
// Public routes (no authentication required)
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);

// Protected routes (authentication required)
app.use("/api/devices", authMiddleware, deviceRoutes);
app.use("/api/device-masters", authMiddleware, deviceMasterRoutes);
app.use("/api/pages", authMiddleware, pagesRoutes);
app.use("/api/sections", authMiddleware, sectionsRoutes);
app.use("/api/elements", authMiddleware, elementsRoutes);
app.use("/api/device-events", authMiddleware, deviceEventsRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);
app.use("/api/users", authMiddleware, usersRoutes);
app.use("/api/command-logs", authMiddleware, commandLogRoutes);
app.use("/api/cms", authMiddleware, cmsRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);

// Inline settings router (admin profile/password) - protected
const settingsRouter = Router();
settingsRouter.get('/profile', authMiddleware, getAdminProfile);
settingsRouter.put('/profile', authMiddleware, putAdminProfile);
settingsRouter.put('/password', authMiddleware, putAdminPassword);
settingsRouter.get('/general', authMiddleware, getAdminGeneral);
settingsRouter.put('/general', authMiddleware, putAdminGeneral);
settingsRouter.get('/notifications', authMiddleware, getAdminNotifications);
settingsRouter.put('/notifications', authMiddleware, putAdminNotifications);
app.use('/api/settings', settingsRouter);

// ---------------- Server start ----------------
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});
