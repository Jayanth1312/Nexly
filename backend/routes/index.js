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
} = require("../controllers/chatHistoryController");

const router = express.Router();

// Existing routes
router.post("/search", searchController);
router.get("/health", healthController);
router.post("/clear-session", clearSessionController);
router.get("/session/:sessionId", getSessionController);

// New chat history routes
router.get("/chat-history/:sessionId", getChatHistoryController);
router.delete("/chat-history/:sessionId", deleteChatHistoryController);
router.get("/chat-history/:sessionId/search", searchMessagesController);
router.get("/sessions", getUserSessionsController);
router.get("/chat-stats", getChatStatsController);

module.exports = router;
