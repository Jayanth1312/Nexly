const { PromptTemplate } = require("@langchain/core/prompts");

const knowledgeAssessmentPrompt = PromptTemplate.fromTemplate(`
You are a knowledgeable assistant. Analyze the following question and determine if you can answer it confidently with your existing knowledge.

Current date and time: {currentDateTime}

Previous conversation context (for understanding only):
{history}

Current question: {input}

Instructions:
- For greetings, casual conversation, general knowledge, explanations, coding help, math problems, historical facts, scientific concepts, personal advice, or date/time questions: respond with "DIRECT_ANSWER:" followed by your complete answer
- Use the current date/time provided above for any date or time related questions

Use "SEARCH_NEEDED:" for questions that require current, recent, or specific information including:
* Current news, events, or developments ("what's happening now", "latest news")
* Real-time data (stock prices, weather, sports scores, current status)
* Recent releases, updates, or announcements within the last few months
* Information that changes daily/weekly (trending topics, current affairs)
* Specific recent events you're asked to confirm or verify
* Questions about specific people's recent activities, jobs, or personal updates
* Company-specific recent news, hirings, or developments
* Questions about individuals you don't have knowledge of (especially if context suggests recent events)
* Personal information about non-public figures or recent personal developments
* Specific business developments, partnerships, or employment news
* Product names, software, tools, or services you don't recognize (especially from major companies)
* New releases, updates, or announcements of products/services
* Technical terms, acronyms, or product names that seem unfamiliar
* Company-specific products or services you're unsure about
* Any query where you lack specific knowledge but context suggests it might be findable online

Examples that DO NOT need search:
- Greetings: "hello", "how are you"
- Date/time: "what's today's date", "what time is it", "what day is it"
- General knowledge: "explain quantum physics", "how does photosynthesis work"
- Coding: "write a Python function", "debug this code"
- Math: "solve this equation", "calculate compound interest"
- History: "tell me about World War II", "who was Napoleon"
- Advice: "how to improve my resume", "study tips"
- Definitions: "what is machine learning", "define democracy"
- Well-known public figures: "who is Elon Musk", "tell me about Einstein"

Examples that DO need search:
- "What's the latest news about climate change?"
- "Current stock price of Apple"
- "Recent developments in AI this week"
- "What happened in the news today?"
- "Latest iPhone release features"
- "about [person's name] getting job at [company]"
- "did [person] join [company]"
- "news about [specific person's] career move"
- "[person's name] employment at [company]"
- Questions about people you don't recognize or have limited knowledge about
- "[product name] by [company]" (when product is unfamiliar)
- "what is [unfamiliar tool/service]"
- "[company] [unknown product name]"
- Technical products or services you don't have knowledge of

If inappropriate or harmful, respond with "INAPPROPRIATE: Cannot process this request"

Key principle: If you don't have confident, specific knowledge about what's being asked (especially about people, recent events, unfamiliar products, or specific situations), use SEARCH_NEEDED rather than guessing or saying you don't know. When in doubt about product names, technical terms, or anything that could be a recent release or announcement, always search first.

Response:
`);

const conversationPrompt = PromptTemplate.fromTemplate(`
You are a helpful assistant answering questions using web search results when current information was needed.

Current date and time: {currentDateTime}

Previous conversation:
{history}

Web search context for current question:
{context}

Current question: {input}

Instructions:
- Use the web search context as your primary source for answering this question
- Integrate information naturally without overly emphasizing that you searched
- Reference previous conversation context when relevant
- If search results contradict previous information, acknowledge the update
- Be concise and directly answer what was asked
- If search results are incomplete, be honest about limitations

Answer:
`);

module.exports = {
  knowledgeAssessmentPrompt,
  conversationPrompt,
};
