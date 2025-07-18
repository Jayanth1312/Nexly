const {
  hasSession,
  deleteSession,
  getSessionInfo,
} = require("../services/memory");

const clearSessionController = (req, res) => {
  const { sessionId = "default" } = req.body;

  if (hasSession(sessionId)) {
    deleteSession(sessionId);
    console.log(`Cleared session: ${sessionId}`);
    res.json({
      message: `Session ${sessionId} cleared successfully`,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(404).json({
      error: `Session ${sessionId} not found`,
      timestamp: new Date().toISOString(),
    });
  }
};

const getSessionController = (req, res) => {
  const { sessionId } = req.params;

  if (hasSession(sessionId)) {
    const memoryData = getSessionInfo(sessionId);
    res.json({
      sessionId: sessionId,
      messageCount: memoryData.messageCount,
      lastAccessed: new Date(memoryData.lastAccessed).toISOString(),
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(404).json({
      error: `Session ${sessionId} not found`,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  clearSessionController,
  getSessionController,
};
