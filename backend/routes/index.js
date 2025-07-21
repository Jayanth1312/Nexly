const express = require("express");
const {
  searchController,
  searchWithStreamController,
} = require("../controllers/searchController");
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
const { authenticateToken } = require("../middleware/auth");

// Import auth routes
const authRoutes = require("./auth");

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);

// Public routes
router.get("/health", healthController);

// Protected routes (require authentication)
router.post("/search", authenticateToken, searchController);
router.post("/search-stream", authenticateToken, searchWithStreamController);
router.post("/clear-session", authenticateToken, clearSessionController);
router.get("/session/:sessionId", authenticateToken, getSessionController);

router.get(
  "/chat-history/:sessionId",
  authenticateToken,
  getChatHistoryController
);
router.delete(
  "/chat-history/:sessionId",
  authenticateToken,
  deleteChatHistoryController
);
router.get(
  "/chat-history/:sessionId/search",
  authenticateToken,
  searchMessagesController
);
router.get(
  "/chat-history/:sessionId/preview",
  authenticateToken,
  getQuickPreviewController
);
router.get(
  "/chat-history/:sessionId/paginated",
  authenticateToken,
  getPaginatedMessagesController
);
router.get("/sessions", authenticateToken, getUserSessionsController);
router.get("/chat-stats", authenticateToken, getChatStatsController);

module.exports = router;
