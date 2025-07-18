const { BufferMemory } = require("langchain/memory");
const { MAX_MEMORY_SIZE } = require("../config/constants");

const conversationMemories = new Map();
const memoryCleanupInterval = 60 * 60 * 1000;
const maxMemoryAge = 24 * 60 * 60 * 1000;

const startMemoryCleanup = () => {
  setInterval(() => {
    const now = Date.now();
    for (const [sessionId, memoryData] of conversationMemories.entries()) {
      if (now - memoryData.lastAccessed > maxMemoryAge) {
        conversationMemories.delete(sessionId);
        console.log(`Cleaned up expired memory for session: ${sessionId}`);
      }
    }
  }, memoryCleanupInterval);
};

function getConversationMemory(sessionId) {
  if (!conversationMemories.has(sessionId)) {
    const memory = new BufferMemory({
      memoryKey: "history",
      inputKey: "input",
      outputKey: "response",
      returnMessages: false,
    });
    conversationMemories.set(sessionId, {
      memory,
      lastAccessed: Date.now(),
      messageCount: 0,
    });
  }

  const memoryData = conversationMemories.get(sessionId);
  memoryData.lastAccessed = Date.now();

  return memoryData.memory;
}

function getAssessmentMemory(sessionId) {
  const conversationMemory = getConversationMemory(sessionId);

  const assessmentMemory = new BufferMemory({
    memoryKey: "history",
    inputKey: "input",
    outputKey: "response",
    returnMessages: false,
  });

  try {
    const historyVariables = conversationMemory.chatHistory || [];
    if (historyVariables.length > 0) {
      const contextSummary = "Previous topics discussed in this conversation.";
      assessmentMemory.chatHistory = contextSummary;
    }
  } catch (error) {
    console.warn(
      `Could not access conversation history for assessment: ${error.message}`
    );
  }

  return assessmentMemory;
}

function clearMemories() {
  conversationMemories.clear();
}

function hasSession(sessionId) {
  return conversationMemories.has(sessionId);
}

function deleteSession(sessionId) {
  return conversationMemories.delete(sessionId);
}

function getSessionInfo(sessionId) {
  if (!conversationMemories.has(sessionId)) {
    return null;
  }
  return conversationMemories.get(sessionId);
}

function getMemoryStats() {
  return {
    activeSessions: conversationMemories.size,
  };
}

module.exports = {
  startMemoryCleanup,
  getConversationMemory,
  getAssessmentMemory,
  clearMemories,
  hasSession,
  deleteSession,
  getSessionInfo,
  getMemoryStats,
  conversationMemories,
  MAX_MEMORY_SIZE,
};
