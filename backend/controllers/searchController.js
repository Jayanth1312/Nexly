const { validateInput } = require("../utils/helpers");
const { tryDirectAnswer, performSearchBasedAnswer } = require("../services/ai");
const { performWebSearch } = require("../services/search");
const chatHistoryService = require("../services/chatHistory");

const searchController = async (req, res) => {
  const startTime = Date.now();
  let { query, sessionId = "default" } = req.body;
  const userId = req.user.userId; // Get from authenticated user

  try {
    query = validateInput(query);

    if (!sessionId || typeof sessionId !== "string") {
      sessionId = "default";
    }

    console.log(
      `Processing query: "${query.substring(
        0,
        100
      )}..." for session: ${sessionId}, user: ${userId}`
    );

    const directResult = await tryDirectAnswer(query, sessionId);

    if (directResult.canAnswer) {
      console.log("Answering directly from model knowledge");
      const processingTime = Date.now() - startTime;

      const response = {
        answer: directResult.answer,
        sources: [],
        sessionId: sessionId,
        responseType: "direct",
        processingTime: `${processingTime}ms (no web search needed)`,
        timestamp: new Date().toISOString(),
      };

      // Save conversation to database
      try {
        await chatHistoryService.saveConversation(
          sessionId,
          query,
          {
            answer: directResult.answer,
            sources: [],
            responseType: "direct",
            processingTime: response.processingTime,
          },
          {
            userId,
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          }
        );
      } catch (dbError) {
        console.error(
          "Failed to save conversation to database:",
          dbError.message
        );
        // Don't fail the request if database save fails
      }

      return res.json(response);
    }

    const searchResult = await performSearchBasedAnswer(query, sessionId);
    const processingTime = Date.now() - startTime;

    const response = {
      answer: searchResult.answer,
      sources: searchResult.sources,
      sessionId: sessionId,
      responseType: "search",
      processingTime: `${processingTime}ms (web search performed)`,
      timestamp: new Date().toISOString(),
    };

    // Save conversation to database
    try {
      await chatHistoryService.saveConversation(
        sessionId,
        query,
        {
          answer: searchResult.answer,
          sources: searchResult.sources,
          responseType: "search",
          processingTime: response.processingTime,
        },
        {
          userId,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        }
      );
    } catch (dbError) {
      console.error(
        "Failed to save conversation to database:",
        dbError.message
      );
      // Don't fail the request if database save fails
    }

    res.json(response);
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

// New endpoint for two-step search process
const searchWithStreamController = async (req, res) => {
  const startTime = Date.now();
  let { query, sessionId = "default" } = req.body;
  const userId = req.user?.userId;

  // Add error handling for missing user
  if (!userId) {
    return res.status(401).json({
      error: "Authentication required",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    query = validateInput(query);

    if (!sessionId || typeof sessionId !== "string") {
      sessionId = "default";
    }

    console.log(
      `Processing streaming search for: "${query.substring(0, 100)}..."`
    );

    // Set headers for Server-Sent Events with proper CORS
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin":
        process.env.FRONTEND_URL || "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers":
        "Cache-Control, Content-Type, Authorization",
    });

    // Check if we can answer directly first
    const directResult = await tryDirectAnswer(query, sessionId);

    if (directResult.canAnswer) {
      console.log("Answering directly from model knowledge");
      const processingTime = Date.now() - startTime;

      const response = {
        type: "final_answer",
        answer: directResult.answer,
        sources: [],
        sessionId: sessionId,
        responseType: "direct",
        processingTime: `${processingTime}ms (no web search needed)`,
        timestamp: new Date().toISOString(),
      };

      res.write(`data: ${JSON.stringify(response)}\n\n`);
      res.end();
      return;
    }

    // Step 1: Perform web search and send sources immediately
    const searchSources = await performWebSearch(query);

    const sourcesResponse = {
      type: "sources",
      sources: searchSources.map((source) => ({
        title: source.title,
        url: source.url,
        snippet: source.text || "No preview available",
      })),
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
    };

    res.write(`data: ${JSON.stringify(sourcesResponse)}\n\n`);

    // Step 2: Process with LLM and send final answer
    const searchResult = await performSearchBasedAnswer(
      query,
      sessionId,
      searchSources
    );
    const processingTime = Date.now() - startTime;

    const finalResponse = {
      type: "final_answer",
      answer: searchResult.answer,
      sources: searchSources.map((source) => ({
        title: source.title,
        url: source.url,
        snippet: source.text || "No preview available",
      })),
      sessionId: sessionId,
      responseType: "search",
      processingTime: `${processingTime}ms (web search performed)`,
      timestamp: new Date().toISOString(),
    };

    res.write(`data: ${JSON.stringify(finalResponse)}\n\n`);
    res.end();

    // Save conversation to database
    try {
      await chatHistoryService.saveConversation(
        sessionId,
        query,
        {
          answer: searchResult.answer,
          sources: finalResponse.sources,
          responseType: "search",
          processingTime: finalResponse.processingTime,
        },
        {
          userId,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        }
      );
    } catch (dbError) {
      console.error(
        "Failed to save conversation to database:",
        dbError.message
      );
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(
      `Error processing streaming search "${query}":`,
      error.message
    );

    // Check if headers were already sent (streaming started)
    if (res.headersSent) {
      // Send error through stream
      const errorResponse = {
        type: "error",
        error: error.message || "Internal server error",
        sessionId: sessionId,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
      };
      res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
      res.end();
    } else {
      // Send regular HTTP error response
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
  }
};

module.exports = { searchController, searchWithStreamController };
