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

    console.log(`Created new memory for session: ${sessionId}`);
  }

  const memoryData = conversationMemories.get(sessionId);
  memoryData.lastAccessed = Date.now();

  return memoryData.memory;
}

function clearMemories() {
  conversationMemories.clear();
  console.log("All memories cleared");
}

function hasSession(sessionId) {
  return conversationMemories.has(sessionId);
}

function deleteSession(sessionId) {
  const deleted = conversationMemories.delete(sessionId);
  if (deleted) {
    console.log(`Deleted session: ${sessionId}`);
  }
  return deleted;
}

function getSessionInfo(sessionId) {
  if (!conversationMemories.has(sessionId)) {
    return null;
  }

  const memoryData = conversationMemories.get(sessionId);
  return {
    lastAccessed: memoryData.lastAccessed,
    messageCount: memoryData.messageCount,
    hasMemory: !!memoryData.memory,
  };
}

function getMemoryStats() {
  return {
    activeSessions: conversationMemories.size,
    sessions: Array.from(conversationMemories.keys()).map((sessionId) => ({
      sessionId,
      ...getSessionInfo(sessionId),
    })),
  };
}

async function getMemoryContents(sessionId) {
  const memory = getConversationMemory(sessionId);
  try {
    const variables = await memory.loadMemoryVariables({});
    return variables;
  } catch (error) {
    console.error(`Error loading memory variables: ${error.message}`);
    return null;
  }
}

module.exports = {
  startMemoryCleanup,
  getConversationMemory,
  clearMemories,
  hasSession,
  deleteSession,
  getSessionInfo,
  getMemoryStats,
  getMemoryContents,
  conversationMemories,
  MAX_MEMORY_SIZE,
};
