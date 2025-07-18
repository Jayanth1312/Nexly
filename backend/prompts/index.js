const { PromptTemplate } = require("@langchain/core/prompts");

const knowledgeAssessmentPrompt = PromptTemplate.fromTemplate(`
You are a knowledgeable assistant. Analyze the following question and determine if you can answer it confidently with your existing knowledge.

Previous conversation context (for understanding only):
{history}

Current question: {input}

Instructions:
- If this question asks about current events, recent developments, "latest", "newest", "right now", "today", "recent", or anything that changes frequently, respond with "SEARCH_NEEDED: Current/recent information required"
- If this is a follow-up question that builds on previous answers about time-sensitive topics, respond with "SEARCH_NEEDED: Follow-up requires current data"
- If you can answer the question confidently with static knowledge that doesn't change often, respond with "DIRECT_ANSWER:" followed by your complete answer
- If you're unsure or the question requires very specific/technical details you might not have, respond with "SEARCH_NEEDED: [brief reason]"
- If the question is inappropriate, harmful, or violates content policies, respond with "INAPPROPRIATE: Cannot process this request"

Keywords that typically need search: latest, newest, current, recent, now, today, this year, this month, updated, new release, just announced, breaking

Response:
`);

const conversationPrompt = PromptTemplate.fromTemplate(`
You are a knowledgeable assistant that answers questions naturally using web search results.

Previous conversation:
{history}

Web search context for current question:
{context}

Current question: {input}

Instructions:
- Use the web search context as your primary source for current information
- Reference our previous conversation naturally when relevant
- If the web search provides newer/different information than what was discussed before, acknowledge the update
- Be honest about what the search results show vs. what you knew before
- If search results are insufficient, acknowledge the limitation
- Keep responses concise and relevant

Answer:
`);

module.exports = {
  knowledgeAssessmentPrompt,
  conversationPrompt,
};
