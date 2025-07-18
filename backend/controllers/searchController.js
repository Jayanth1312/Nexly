const { validateInput } = require("../utils/helpers");
const { tryDirectAnswer, performSearchBasedAnswer } = require("../services/ai");

const searchController = async (req, res) => {
  const startTime = Date.now();
  let { query, sessionId = "default" } = req.body;

  try {
    query = validateInput(query);

    if (!sessionId || typeof sessionId !== "string") {
      sessionId = "default";
    }

    console.log(
      `Processing query: "${query.substring(
        0,
        100
      )}..." for session: ${sessionId}`
    );

    const directResult = await tryDirectAnswer(query, sessionId);

    if (directResult.canAnswer) {
      console.log("Answering directly from model knowledge");
      const processingTime = Date.now() - startTime;

      return res.json({
        answer: directResult.answer,
        sources: [],
        sessionId: sessionId,
        responseType: "direct",
        processingTime: `${processingTime}ms (no web search needed)`,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`Performing web search. Reason: ${directResult.reason}`);
    const searchResult = await performSearchBasedAnswer(query, sessionId);
    const processingTime = Date.now() - startTime;

    res.json({
      answer: searchResult.answer,
      sources: searchResult.sources,
      sessionId: sessionId,
      responseType: "search",
      processingTime: `${processingTime}ms (web search performed)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Error processing query "${query}":`, error.message);

    let statusCode = 500;
    let errorMessage = "Internal server error";

    if (
      error.message.includes("Query must be") ||
      error.message.includes("too long")
    ) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes("timeout")) {
      statusCode = 504;
      errorMessage = "Request timeout - please try again";
    } else if (error.message.includes("Inappropriate")) {
      statusCode = 400;
      errorMessage = "Request cannot be processed due to content policy";
    }

    res.status(statusCode).json({
      error: errorMessage,
      sessionId: sessionId,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { searchController };
