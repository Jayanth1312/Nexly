const { ChatGroq } = require("@langchain/groq");
const { MODEL_TIMEOUT } = require("../config/constants");

const createModel = () => {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.MODEL_NAME,
    temperature: parseFloat(process.env.MODEL_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.MODEL_MAX_TOKENS) || 1200,
    timeout: MODEL_TIMEOUT,
    stream: true,
  });
};

module.exports = { createModel };
