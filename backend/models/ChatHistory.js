const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  sources: [
    {
      title: String,
      url: String,
    },
  ],
  responseType: {
    type: String,
    enum: ["direct", "search"],
    default: "direct",
  },
  processingTime: String,
});

const ChatHistorySchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      default: "anonymous",
    },
    messages: [MessageSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      totalMessages: {
        type: Number,
        default: 0,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ChatHistorySchema.index({ sessionId: 1 }); // Most common query
ChatHistorySchema.index({ userId: 1, updatedAt: -1 }); // User sessions sorted by recent
ChatHistorySchema.index({ createdAt: -1 }); // For sorting by creation date
ChatHistorySchema.index({ "metadata.lastActivity": -1 }); // For active sessions
ChatHistorySchema.index({ sessionId: 1, "messages.timestamp": -1 }); // For message ordering

// Text index for message search (if you need full-text search)
ChatHistorySchema.index({
  "messages.content": "text",
});

// Pre-save middleware to update metadata
ChatHistorySchema.pre("save", function (next) {
  this.metadata.totalMessages = this.messages.length;
  this.metadata.lastActivity = new Date();
  next();
});

// Static method to find or create session
ChatHistorySchema.statics.findOrCreateSession = async function (
  sessionId,
  userId = "anonymous"
) {
  let session = await this.findOne({ sessionId });

  if (!session) {
    session = new this({
      sessionId,
      userId,
      messages: [],
    });
    await session.save();
  }

  return session;
};

// Instance method to add message
ChatHistorySchema.methods.addMessage = async function (
  role,
  content,
  additionalData = {}
) {
  const message = {
    role,
    content,
    timestamp: new Date(),
    ...additionalData,
  };

  this.messages.push(message);
  await this.save();

  return message;
};

// Instance method to get recent messages
ChatHistorySchema.methods.getRecentMessages = function (limit = 10) {
  return this.messages.slice(-limit).map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    sources: msg.sources || [],
    responseType: msg.responseType,
  }));
};

// Static method to cleanup old sessions (older than 30 days)
ChatHistorySchema.statics.cleanupOldSessions = async function () {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await this.deleteMany({
    updatedAt: { $lt: thirtyDaysAgo },
  });
  console.log(`Cleaned up ${result.deletedCount} old chat sessions`);
  return result.deletedCount;
};

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);
