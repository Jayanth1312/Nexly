const ChatHistory = require("../models/ChatHistory");

class ChatHistoryService {
  // Save a conversation turn (user message + assistant response)
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
      const session = await ChatHistory.findOne({ sessionId });

      if (!session) {
        return {
          sessionId,
          messages: [],
          totalMessages: 0,
          createdAt: null,
          lastActivity: null,
        };
      }

      const messages = session.getRecentMessages(limit);

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

  // Get conversation context for AI (formatted for langchain)
  async getConversationContext(sessionId, limit = 10) {
    try {
      const session = await ChatHistory.findOne({ sessionId });

      if (!session || session.messages.length === 0) {
        return "";
      }

      const recentMessages = session.messages.slice(-limit);

      return recentMessages
        .map((msg) => {
          const role = msg.role === "user" ? "Human" : "Assistant";
          return `${role}: ${msg.content}`;
        })
        .join("\n");
    } catch (error) {
      console.error(
        `Error getting conversation context for session ${sessionId}:`,
        error.message
      );
      return "";
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
