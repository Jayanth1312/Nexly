require("dotenv").config();
const express = require("express");
const { setupMiddleware } = require("./middleware");
const { startMemoryCleanup, clearMemories } = require("./services/memory");
const {
  connectToDatabase,
  disconnectFromDatabase,
} = require("./config/database");
const chatHistoryService = require("./services/chatHistory");
const { PORT, NODE_ENV } = require("./config/constants");
const routes = require("./routes");

const app = express();

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await connectToDatabase();
    console.log("Database connection established");

    // Setup periodic cleanup of old chat sessions (run every 24 hours)
    setInterval(async () => {
      try {
        await chatHistoryService.cleanupOldSessions();
      } catch (error) {
        console.error("Error during scheduled cleanup:", error.message);
      }
    }, 24 * 60 * 60 * 1000);
  } catch (error) {
    console.error("Failed to initialize database:", error.message);
    console.warn("Application will continue without database functionality");
  }
};

// Setup middleware
setupMiddleware(app);

// Initialize database
initializeDatabase();

// Start memory cleanup
startMemoryCleanup();

// Routes
app.use("/", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  clearMemories();

  try {
    await disconnectFromDatabase();
  } catch (error) {
    console.error("Error disconnecting from database:", error.message);
  }

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(
    `Chat history API available at: http://localhost:${PORT}/chat-history/`
  );
});

// Handle server errors
server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});

module.exports = app;
