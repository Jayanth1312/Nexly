const chatHistoryService = require("../services/chatHistory");

// Get chat history for a specific session
const getChatHistoryController = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit } = req.query;
    const userId = req.user.userId; // Get from authenticated user

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required",
        timestamp: new Date().toISOString(),
      });
    }

    // Verify session belongs to user
    const session = await chatHistoryService.getSessionByIdAndUser(
      sessionId,
      userId
    );
    if (!session) {
      return res.status(404).json({
        error: "Session not found or access denied",
        timestamp: new Date().toISOString(),
      });
    }

    const history = await chatHistoryService.getChatHistory(
      sessionId,
      limit ? parseInt(limit) : 50
    );

    res.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getChatHistoryController:", error.message);
    res.status(500).json({
      error: "Failed to retrieve chat history",
      timestamp: new Date().toISOString(),
    });
  }
};

// Get all sessions for a user
const getUserSessionsController = async (req, res) => {
  try {
    const userId = req.user.userId; // Get from authenticated user
    const { limit } = req.query;

    const sessions = await chatHistoryService.getUserSessions(
      userId,
      limit ? parseInt(limit) : 20
    );

    res.json({
      success: true,
      data: {
        userId,
        sessions,
        totalSessions: sessions.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getUserSessionsController:", error.message);
    res.status(500).json({
      error: "Failed to retrieve user sessions",
      timestamp: new Date().toISOString(),
    });
  }
};

// Delete a specific session's chat history
const deleteChatHistoryController = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId; // Get from authenticated user

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required",
        timestamp: new Date().toISOString(),
      });
    }

    // Verify session belongs to user before deleting
    const session = await chatHistoryService.getSessionByIdAndUser(
      sessionId,
      userId
    );
    if (!session) {
      return res.status(404).json({
        error: "Session not found or access denied",
        timestamp: new Date().toISOString(),
      });
    }

    const deleted = await chatHistoryService.deleteSession(sessionId);

    if (deleted) {
      res.json({
        success: true,
        message: `Chat history for session ${sessionId} deleted successfully`,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(404).json({
        error: `Session ${sessionId} not found`,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error in deleteChatHistoryController:", error.message);
    res.status(500).json({
      error: "Failed to delete chat history",
      timestamp: new Date().toISOString(),
    });
  }
};

// Search messages in a session
const searchMessagesController = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { q: searchQuery, limit } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required",
        timestamp: new Date().toISOString(),
      });
    }

    if (!searchQuery) {
      return res.status(400).json({
        error: "Search query is required",
        timestamp: new Date().toISOString(),
      });
    }

    const results = await chatHistoryService.searchMessages(
      sessionId,
      searchQuery,
      limit ? parseInt(limit) : 10
    );

    res.json({
      success: true,
      data: {
        sessionId,
        searchQuery,
        results,
        totalResults: results.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in searchMessagesController:", error.message);
    res.status(500).json({
      error: "Failed to search messages",
      timestamp: new Date().toISOString(),
    });
  }
};

// Get chat history statistics
const getChatStatsController = async (req, res) => {
  try {
    const stats = await chatHistoryService.getStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getChatStatsController:", error.message);
    res.status(500).json({
      error: "Failed to retrieve chat statistics",
      timestamp: new Date().toISOString(),
    });
  }
};

// Get quick preview of recent messages (optimized for fast loading)
const getQuickPreviewController = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 5 } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required",
        timestamp: new Date().toISOString(),
      });
    }

    const preview = await chatHistoryService.getQuickPreview(
      sessionId,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        sessionId,
        preview,
        count: preview.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getQuickPreviewController:", error.message);
    res.status(500).json({
      error: "Failed to retrieve quick preview",
      timestamp: new Date().toISOString(),
    });
  }
};

// Get paginated messages (for infinite scroll)
const getPaginatedMessagesController = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required",
        timestamp: new Date().toISOString(),
      });
    }

    const result = await chatHistoryService.getMessagesPaginated(
      sessionId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        sessionId,
        ...result,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getPaginatedMessagesController:", error.message);
    res.status(500).json({
      error: "Failed to retrieve paginated messages",
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  getChatHistoryController,
  getUserSessionsController,
  deleteChatHistoryController,
  searchMessagesController,
  getChatStatsController,
  getQuickPreviewController,
  getPaginatedMessagesController,
};
