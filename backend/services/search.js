const axios = require("axios");
const { SEARCH_TIMEOUT } = require("../config/constants");
const { truncateContent, extractKeySentences } = require("../utils/helpers");

async function performWebSearch(query) {
  try {
    console.log(`Performing web search for: "${query}"`);

    const searchResponse = await Promise.race([
      axios.post(
        "https://api.exa.ai/search",
        {
          query: query,
          num_results: 4,
          use_autoprompt: true,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.EXA_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: SEARCH_TIMEOUT,
        }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Search timeout")), SEARCH_TIMEOUT)
      ),
    ]);

    if (
      !searchResponse.data.results ||
      searchResponse.data.results.length === 0
    ) {
      throw new Error("No search results found");
    }

    const contentResponse = await Promise.race([
      axios.post(
        "https://api.exa.ai/contents",
        {
          ids: searchResponse.data.results.map((r) => r.id),
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.EXA_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: SEARCH_TIMEOUT,
        }
      ),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Content fetch timeout")),
          SEARCH_TIMEOUT
        )
      ),
    ]);

    const processedSources = contentResponse.data.results
      .filter((result) => result.text && result.text.length > 50)
      .map((result) => {
        const truncatedText = truncateContent(result.text, 1000);
        const keySentences = extractKeySentences(truncatedText, 3);
        return {
          url: result.url,
          title: result.title || "Untitled",
          text: keySentences,
        };
      });

    if (processedSources.length === 0) {
      throw new Error("No usable content found in search results");
    }

    return processedSources;
  } catch (error) {
    console.error(`Web search error: ${error.message}`);
    throw new Error(`Search failed: ${error.message}`);
  }
}

module.exports = { performWebSearch };
