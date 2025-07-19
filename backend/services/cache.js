const NodeCache = require("node-cache");

// Cache for 5 minutes (300 seconds)
const conversationCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  maxKeys: 1000,
});

class CacheService {
  // Cache conversation context
  getCachedContext(sessionId, limit) {
    const key = `context_${sessionId}_${limit}`;
    return conversationCache.get(key);
  }

  setCachedContext(sessionId, limit, context) {
    const key = `context_${sessionId}_${limit}`;
    conversationCache.set(key, context);
  }

  // Cache recent messages
  getCachedMessages(sessionId, limit) {
    const key = `messages_${sessionId}_${limit}`;
    return conversationCache.get(key);
  }

  setCachedMessages(sessionId, limit, messages) {
    const key = `messages_${sessionId}_${limit}`;
    conversationCache.set(key, messages);
  }

  // Cache session metadata
  getCachedSessionMeta(sessionId) {
    const key = `meta_${sessionId}`;
    return conversationCache.get(key);
  }

  setCachedSessionMeta(sessionId, metadata) {
    const key = `meta_${sessionId}`;
    conversationCache.set(key, metadata, 600); // Cache for 10 minutes
  }

  // Invalidate cache when session is updated
  invalidateSession(sessionId) {
    const keys = conversationCache.keys();
    const sessionKeys = keys.filter((key) => key.includes(sessionId));
    conversationCache.del(sessionKeys);
  }

  // Get cache statistics
  getStats() {
    return conversationCache.getStats();
  }

  // Clear all cache
  clearAll() {
    conversationCache.flushAll();
  }
}

module.exports = new CacheService();
