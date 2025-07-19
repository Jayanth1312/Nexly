const ChatHistory = require("../models/ChatHistory");
const cacheService = require("./cache");

class ChatHistoryService {
  async saveConversation(
    sessionId,
    userMessage,
    assistantResponse,
    metadata = {}
  ) {
    try {
      const session = await ChatHistory.findOrCreateSession(
        sessionId,
        metadata.userId
      );

      // Add user message
      await session.addMessage("user", userMessage, {
        timestamp: new Date(),
      });

      // Add assistant response
      await session.addMessage("assistant", assistantResponse.answer, {
        sources: assistantResponse.sources || [],
        responseType: assistantResponse.responseType || "direct",
        processingTime: assistantResponse.processingTime,
        timestamp: new Date(),
      });

      // Invalidate cache for this session
      cacheService.invalidateSession(sessionId);

      console.log(`Saved conversation for session: ${sessionId}`);
      return session;
    } catch (error) {
      console.error(
        `Error saving conversation for session ${sessionId}:`,
        error.message
      );
      throw error;
    }
  }

  // Get chat history for a session
  async getChatHistory(sessionId, limit = 50) {
    try {
      const session = await ChatHistory.findOne(
        { sessionId },
        {
          sessionId: 1,
          userId: 1,
          messages: { $slice: -limit },
          "metadata.totalMessages": 1,
          "metadata.lastActivity": 1,
          createdAt: 1,
        }
      );

      if (!session) {
        return {
          sessionId,
          messages: [],
          totalMessages: 0,
          createdAt: null,
          lastActivity: null,
        };
      }

      // Format messages for response
      const messages = session.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        sources: msg.sources || [],
        responseType: msg.responseType,
      }));

      return {
        sessionId: session.sessionId,
        userId: session.userId,
        messages,
        totalMessages: session.metadata.totalMessages,
        createdAt: session.createdAt,
        lastActivity: session.metadata.lastActivity,
      };
    } catch (error) {
      console.error(
        `Error retrieving chat history for session ${sessionId}:`,
        error.message
      );
      throw error;
    }
  }

  // Get all sessions for a user
  async getUserSessions(userId = "anonymous", limit = 20) {
    try {
      const sessions = await ChatHistory.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select("sessionId createdAt updatedAt metadata");

      return sessions.map((session) => ({
        sessionId: session.sessionId,
        createdAt: session.createdAt,
        lastActivity: session.metadata.lastActivity,
        totalMessages: session.metadata.totalMessages,
      }));
    } catch (error) {
      console.error(
        `Error retrieving sessions for user ${userId}:`,
        error.message
      );
      throw error;
    }
  }

  // Delete a specific session
  async deleteSession(sessionId) {
    try {
      const result = await ChatHistory.deleteOne({ sessionId });

      if (result.deletedCount > 0) {
        console.log(`Deleted chat history for session: ${sessionId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error.message);
      throw error;
    }
  }

  // Search messages in chat history
  async searchMessages(sessionId, searchQuery, limit = 10) {
    try {
      const session = await ChatHistory.findOne({ sessionId });

      if (!session) {
        return [];
      }

      const matchingMessages = session.messages
        .filter((message) =>
          message.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(-limit);

      return matchingMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        sources: msg.sources || [],
      }));
    } catch (error) {
      console.error(
        `Error searching messages in session ${sessionId}:`,
        error.message
      );
      throw error;
    }
  }

  // Get conversation context for AI
  async getConversationContext(sessionId, limit = 10) {
    try {
      const cached = cacheService.getCachedContext(sessionId, limit);
      if (cached) {
        return cached;
      }

      const session = await ChatHistory.findOne(
        { sessionId },
        {
          messages: { $slice: -limit },
        }
      );

      if (!session || session.messages.length === 0) {
        return "";
      }

      const context = session.messages
        .map((msg) => {
          const role = msg.role === "user" ? "Human" : "Assistant";
          return `${role}: ${msg.content}`;
        })
        .join("\n");

      // Cache the result
      cacheService.setCachedContext(sessionId, limit, context);

      return context;
    } catch (error) {
      console.error(
        `Error getting conversation context for session ${sessionId}:`,
        error.message
      );
      return "";
    }
  }

  async getQuickPreview(sessionId, limit = 5) {
    try {
      const session = await ChatHistory.findOne(
        { sessionId },
        {
          "messages.content": 1,
          "messages.role": 1,
          "messages.timestamp": 1,
        }
      ).slice("messages", -limit);

      if (!session) {
        return [];
      }

      return session.messages.map((msg) => ({
        role: msg.role,
        content: msg.content.substring(0, 100) + "...",
        timestamp: msg.timestamp,
      }));
    } catch (error) {
      console.error(
        `Error getting quick preview for session ${sessionId}:`,
        error.message
      );
      return [];
    }
  }

  async getMessagesPaginated(sessionId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const session = await ChatHistory.findOne(
        { sessionId },
        {
          messages: { $slice: [skip, limit] },
          "metadata.totalMessages": 1,
        }
      );

      if (!session) {
        return {
          messages: [],
          totalMessages: 0,
          hasMore: false,
        };
      }

      const totalMessages = session.metadata.totalMessages;
      const hasMore = skip + limit < totalMessages;

      return {
        messages: session.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          sources: msg.sources || [],
          responseType: msg.responseType,
        })),
        totalMessages,
        hasMore,
        currentPage: page,
      };
    } catch (error) {
      console.error(
        `Error getting paginated messages for session ${sessionId}:`,
        error.message
      );
      throw error;
    }
  }

  // Get statistics
  async getStats() {
    try {
      const totalSessions = await ChatHistory.countDocuments();
      const totalMessages = await ChatHistory.aggregate([
        { $group: { _id: null, total: { $sum: "$metadata.totalMessages" } } },
      ]);

      const activeSessions = await ChatHistory.countDocuments({
        "metadata.lastActivity": {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });

      return {
        totalSessions,
        totalMessages: totalMessages[0]?.total || 0,
        activeSessions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting chat history stats:", error.message);
      throw error;
    }
  }

  // Cleanup old sessions
  async cleanupOldSessions() {
    try {
      return await ChatHistory.cleanupOldSessions();
    } catch (error) {
      console.error("Error cleaning up old sessions:", error.message);
      throw error;
    }
  }
}

module.exports = new ChatHistoryService();
