function truncateContent(text, maxLength = 3000) {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function extractKeySentences(text, maxSentences = 5) {
  if (!text || typeof text !== "string") return "";
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  return sentences.slice(0, maxSentences).join(". ") + ".";
}

function validateInput(query) {
  if (!query || typeof query !== "string") {
    throw new Error("Query must be a non-empty string");
  }
  if (query.length > 5000) {
    throw new Error("Query is too long (max 5000 characters)");
  }
  return query.trim();
}

module.exports = {
  truncateContent,
  extractKeySentences,
  validateInput,
};
