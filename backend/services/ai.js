const { ConversationChain } = require("langchain/chains");
const { createModel } = require("../models/groq");
const { knowledgeAssessmentPrompt, conversationPrompt } = require("../prompts");
const {
  getConversationMemory,
  conversationMemories,
  MAX_MEMORY_SIZE,
} = require("./memory");
const { performWebSearch } = require("./search");
const chatHistoryService = require("./chatHistory");
const { BufferMemory } = require("langchain/memory");
const { MODEL_TIMEOUT } = require("../config/constants");

const model = createModel();

function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

async function tryDirectAnswer(query, sessionId) {
  try {
    const conversationMemory = getConversationMemory(sessionId);
    const currentDateTime = getCurrentDateTime();

    let historyContext = "";
    try {
      const historyVars = await conversationMemory.loadMemoryVariables({});
      historyContext = historyVars.history || "";

      if (!historyContext) {
        const dbContext = await chatHistoryService.getConversationContext(
          sessionId,
          10
        );
        if (dbContext) {
          historyContext = dbContext;
          console.log(
            `Loaded conversation context from database for session: ${sessionId}`
          );
        }
      }
    } catch (error) {
      console.warn(`Could not load conversation history: ${error.message}`);
    }

    const assessmentChain = new ConversationChain({
      llm: model,
      memory: conversationMemory,
      prompt: knowledgeAssessmentPrompt,
    });

    const result = await Promise.race([
      assessmentChain.call({
        input: `Current conversation history: ${historyContext}\n\nNew query: ${query}`,
        currentDateTime: currentDateTime,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Assessment timeout")), MODEL_TIMEOUT)
      ),
    ]);

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
        if (memoryData) {
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
      };
    }

    return {
      canAnswer: false,
      reason: "Response format unclear - defaulting to search for accuracy",
    };
  } catch (error) {
    console.error(`Error in direct answer assessment: ${error.message}`);
    return {
      canAnswer: false,
      reason: "Error in assessment - defaulting to search",
    };
  }
}

async function performSearchBasedAnswer(
  query,
  sessionId,
  preSearchResults = null
) {
  const memory = getConversationMemory(sessionId);
  const currentDateTime = getCurrentDateTime();

  try {
    // Use pre-fetched results or perform new search
    const searchResults = preSearchResults || (await performWebSearch(query));
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
        currentDateTime: currentDateTime,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Model response timeout")),
          MODEL_TIMEOUT
        )
      ),
    ]);

    try {
      await memory.saveContext({ input: query }, { response: result.response });

      const memoryData = conversationMemories.get(sessionId);
      if (memoryData) {
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
      }
    } catch (error) {
      console.warn(`Failed to save search context to memory: ${error.message}`);
    }

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
