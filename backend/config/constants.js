require("dotenv").config();

const requiredEnvVars = ["GROQ_API_KEY", "EXA_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const MAX_MEMORY_SIZE = parseInt(process.env.MAX_MEMORY_SIZE) || 250;
const SEARCH_TIMEOUT = parseInt(process.env.SEARCH_TIMEOUT) || 15000;
const MODEL_TIMEOUT = parseInt(process.env.MODEL_TIMEOUT) || 15000;

module.exports = {
  PORT,
  NODE_ENV,
  MAX_MEMORY_SIZE,
  SEARCH_TIMEOUT,
  MODEL_TIMEOUT,
};
