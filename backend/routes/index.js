const express = require("express");
const { searchController } = require("../controllers/searchController");
const {
  clearSessionController,
  getSessionController,
} = require("../controllers/sessionController");
const { healthController } = require("../controllers/healthController");
const {
  getChatHistoryController,
  getUserSessionsController,
  deleteChatHistoryController,
  searchMessagesController,
  getChatStatsController,
  getQuickPreviewController,
  getPaginatedMessagesController,
} = require("../controllers/chatHistoryController");

// Import auth routes
const authRoutes = require("./auth");

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);

// Existing routes
router.post("/search", searchController);
router.get("/health", healthController);
router.post("/clear-session", clearSessionController);
router.get("/session/:sessionId", getSessionController);

router.get("/chat-history/:sessionId", getChatHistoryController);
router.delete("/chat-history/:sessionId", deleteChatHistoryController);
router.get("/chat-history/:sessionId/search", searchMessagesController);
router.get("/chat-history/:sessionId/preview", getQuickPreviewController);
router.get(
  "/chat-history/:sessionId/paginated",
  getPaginatedMessagesController
);
router.get("/sessions", getUserSessionsController);
router.get("/chat-stats", getChatStatsController);

module.exports = router;
