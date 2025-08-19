import {
    getActiveDevices,
    getTotalUsers,
    getCommands24h,
    getWarrantyThisMonth,
    getCommandVolume,
    getDeviceStatus,
    getDeviceActivations,
    getWarrantyTriggers,
    getWeeklyActiveUsers,
  } from '../models/analyticsModel.js';
  
  export async function getAnalytics(req, res, next) {
    try {
      // KPIs
      const [activeDevices, totalUsers, commands24h, warrantyThisMonth] = await Promise.all([
        getActiveDevices().catch(() => 0),
        getTotalUsers().catch(() => 0),
        getCommands24h().catch(() => 0),
        getWarrantyThisMonth().catch(() => 0),
      ]);
  
      // Charts
      const [commandVolume, deviceStatus, deviceActivations, warrantyTriggers, weeklyActiveUsers] = await Promise.all([
        getCommandVolume().catch(() => []),
        getDeviceStatus().catch(() => []),
        getDeviceActivations().catch(() => []),
        getWarrantyTriggers().catch(() => []),
        getWeeklyActiveUsers().catch(() => []),
      ]);
  
      res.json({
        kpis: { activeDevices, totalUsers, commands24h, warrantyThisMonth },
        charts: { commandVolume, deviceStatus, deviceActivations, warrantyTriggers, weeklyActiveUsers },
      });
    } catch (err) {
      next(err);
    }
  }
  