const { NODE_ENV } = require("../config/constants");
const { getMemoryStats } = require("../services/memory");

const healthController = (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    memoryStats: {
      ...getMemoryStats(),
      nodeMemory: process.memoryUsage(),
    },
  });
};

module.exports = { healthController };
