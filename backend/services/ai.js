const { ConversationChain } = require("langchain/chains");
const { createModel } = require("../models/groq");
const { knowledgeAssessmentPrompt, conversationPrompt } = require("../prompts");
const {
  getConversationMemory,
  getAssessmentMemory,
  conversationMemories,
  MAX_MEMORY_SIZE,
} = require("./memory");
const { performWebSearch } = require("./search");
const { BufferMemory } = require("langchain/memory");
const { MODEL_TIMEOUT } = require("../config/constants");

const model = createModel();

async function tryDirectAnswer(query, sessionId) {
  try {
    const assessmentMemory = getAssessmentMemory(sessionId);
    const conversationMemory = getConversationMemory(sessionId);

    let historyContext = "";
    try {
      const historyVars = await conversationMemory.loadMemoryVariables({});
      historyContext = historyVars.history || "";
    } catch (error) {
      console.warn(`Could not load conversation history: ${error.message}`);
    }

    const timeSensitiveKeywords = [
      "latest",
      "newest",
      "current",
      "recent",
      "now",
      "today",
      "this year",
      "this month",
      "updated",
      "new release",
      "just announced",
      "breaking",
      "right now",
      "currently",
    ];

    const queryLower = query.toLowerCase();
    const hasTimeSensitiveKeyword = timeSensitiveKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );

    if (hasTimeSensitiveKeyword) {
      return {
        canAnswer: false,
        reason:
          "Question contains time-sensitive keywords requiring current data",
      };
    }

    const assessmentChain = new ConversationChain({
      llm: model,
      memory: assessmentMemory,
      prompt: knowledgeAssessmentPrompt,
    });

    const result = await Promise.race([
      assessmentChain.call({ input: query, history: historyContext }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Assessment timeout")), MODEL_TIMEOUT)
      ),
    ]);

    console.log(
      `Assessment result for "${query}": ${result.response.substring(0, 50)}...`
    );

    if (result.response.startsWith("INAPPROPRIATE:")) {
      throw new Error("Inappropriate content detected");
    }

    if (result.response.startsWith("DIRECT_ANSWER:")) {
      const answer = result.response.replace("DIRECT_ANSWER:", "").trim();

      try {
        await conversationMemory.saveContext(
          { input: query },
          { response: answer }
        );

        const memoryData = conversationMemories.get(sessionId);
        memoryData.messageCount++;

        if (memoryData.messageCount > MAX_MEMORY_SIZE) {
          const newMemory = new BufferMemory({
            memoryKey: "history",
            inputKey: "input",
            outputKey: "response",
            returnMessages: false,
          });
          memoryData.memory = newMemory;
          memoryData.messageCount = 0;
          console.log(
            `Reset memory for session ${sessionId} due to size limit`
          );
        }
      } catch (error) {
        console.warn(`Failed to save context to memory: ${error.message}`);
      }

      return {
        canAnswer: true,
        answer: answer,
      };
    } else if (result.response.startsWith("SEARCH_NEEDED:")) {
      return {
        canAnswer: false,
        reason: result.response.replace("SEARCH_NEEDED:", "").trim(),
      };
    }

    return { canAnswer: false, reason: "Uncertain about answer quality" };
  } catch (error) {
    console.error(`Error in direct answer assessment: ${error.message}`);
    return {
      canAnswer: false,
      reason: "Error in assessment - defaulting to search",
    };
  }
}

async function performSearchBasedAnswer(query, sessionId) {
  const memory = getConversationMemory(sessionId);

  try {
    const searchResults = await performWebSearch(query);

    const context = searchResults
      .map((source, index) => `[${index + 1}] ${source.title}: ${source.text}`)
      .join("\n\n");

    const chain = new ConversationChain({
      llm: model,
      memory: memory,
      prompt: conversationPrompt,
    });

    const result = await Promise.race([
      chain.call({
        input: query,
        context: context,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Model response timeout")),
          MODEL_TIMEOUT
        )
      ),
    ]);

    return {
      answer: result.response,
      sources: searchResults.map((source) => ({
        title: source.title,
        url: source.url,
      })),
      usedSearch: true,
    };
  } catch (error) {
    console.error(`Search-based answer error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  tryDirectAnswer,
  performSearchBasedAnswer,
};
