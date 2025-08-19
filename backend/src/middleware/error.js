// src/middleware/error.js
export const notFound = (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Not Found - ${req.originalUrl}`,
    });
  };
  
  export const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err.stack || err.message);
  
    res.status(res.statusCode && res.statusCode !== 200 ? res.statusCode : 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  };
  