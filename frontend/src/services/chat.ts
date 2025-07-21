import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export const chatService = {
  searchStream: async (
    query: string,
    sessionId: string = "default",
    onSources?: (sources: any[]) => void,
    onAnswer?: (answer: string, sources: any[]) => void,
    onError?: (error: any) => void,
    onSearchStart?: () => void
  ) => {
    try {
      const token = Cookies.get("token");
      console.log("Making search stream request:", {
        query,
        sessionId,
        hasToken: !!token,
      });

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_BASE_URL}/search-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
          query,
          sessionId,
        }),
      });

      clearTimeout(timeoutId);
      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        // Try to read error response if possible
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            const parsedError = JSON.parse(errorData);
            errorMessage =
              parsedError.error || parsedError.message || errorMessage;
          }
        } catch (parseError) {
          // If we can't parse the error, use the status text
          console.error("Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "sources" && onSources) {
                // This means web search was performed
                if (onSearchStart && !data.searchStarted) {
                  onSearchStart();
                  data.searchStarted = true;
                }
                onSources(data.sources);
              } else if (data.type === "final_answer" && onAnswer) {
                onAnswer(data.answer, data.sources || []);
              } else if (data.type === "error" && onError) {
                onError(new Error(data.error));
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Search stream error:", error);

      // Handle different types of errors
      let errorMessage = "Search failed";
      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      const enhancedError = new Error(errorMessage);
      enhancedError.name = error.name || "SearchError";

      if (onError) {
        onError(enhancedError);
      } else {
        throw enhancedError;
      }
    }
  },

  // Fallback method that tries streaming first, then regular search
  searchWithFallback: async (
    query: string,
    sessionId: string = "default",
    onSources?: (sources: any[]) => void,
    onAnswer?: (answer: string, sources: any[]) => void,
    onError?: (error: any) => void,
    onSearchStart?: () => void
  ) => {
    try {
      // Try streaming first
      await chatService.searchStream(
        query,
        sessionId,
        onSources,
        onAnswer,
        onError,
        onSearchStart
      );
    } catch (streamError) {
      console.warn(
        "Streaming failed, falling back to regular search:",
        streamError
      );

      try {
        // Fallback to regular search
        const response = await chatService.search(query, sessionId);

        if (onSources && response.sources) {
          onSources(response.sources);
        }

        if (onAnswer) {
          onAnswer(response.answer, response.sources || []);
        }
      } catch (fallbackError) {
        console.error(
          "Both streaming and fallback search failed:",
          fallbackError
        );
        if (onError) {
          onError(fallbackError);
        } else {
          throw fallbackError;
        }
      }
    }
  },

  // Send a search query (legacy method)
  search: async (query: string, sessionId: string = "default") => {
    try {
      const response = await api.post("/search", {
        query,
        sessionId,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Search failed" };
    }
  },

  // Get chat history for a session
  getChatHistory: async (sessionId: string, limit: number = 50) => {
    try {
      const response = await api.get(`/chat-history/${sessionId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Failed to get chat history" };
    }
  },

  // Get all user sessions
  getUserSessions: async (limit: number = 20) => {
    try {
      const response = await api.get("/sessions", {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Failed to get user sessions" };
    }
  },

  // Delete a chat session
  deleteSession: async (sessionId: string) => {
    try {
      const response = await api.delete(`/chat-history/${sessionId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Failed to delete session" };
    }
  },

  // Search messages within a session
  searchMessages: async (
    sessionId: string,
    searchQuery: string,
    limit: number = 10
  ) => {
    try {
      const response = await api.get(`/chat-history/${sessionId}/search`, {
        params: { q: searchQuery, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Failed to search messages" };
    }
  },

  // Clear session (memory)
  clearSession: async (sessionId: string) => {
    try {
      const response = await api.post("/clear-session", {
        sessionId,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Failed to clear session" };
    }
  },
};
