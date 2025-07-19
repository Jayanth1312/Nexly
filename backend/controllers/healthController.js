const { NODE_ENV } = require("../config/constants");
const { getMemoryStats } = require("../services/memory");
const { isConnected } = require("../config/database");
const chatHistoryService = require("../services/chatHistory");

const healthController = async (req, res) => {
  try {
    let chatStats = null;
    try {
      if (isConnected()) {
        chatStats = await chatHistoryService.getStats();
      }
    } catch (error) {
      console.warn("Could not retrieve chat stats:", error.message);
    }

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      services: {
        database: {
          connected: isConnected(),
          status: isConnected() ? "healthy" : "disconnected",
        },
        memory: {
          ...getMemoryStats(),
          nodeMemory: process.memoryUsage(),
        },
        ...(chatStats && { chatHistory: chatStats }),
      },
    });
  } catch (error) {
    console.error("Health check error:", error.message);
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
};

module.exports = { healthController };
