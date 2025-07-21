"use client";

import { useState, useRef, useEffect } from "react";
import { AIPrompt } from "@/components/ui/ai-prompt";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "./logo";
import { ThemeToggle } from "../theme-toggle";
import ChatLoading from "../ui/chat-loading";
import { UserMessage } from "./user-message";
import { AIMessage } from "./ai-message";
import { chatService } from "@/services/chat";
import { MessageActions } from "./message-actions";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url: string;
    snippet?: string;
    text?: string;
    date?: string;
  }>;
}

interface ChatContentProps {
  onWebSearchToggle: () => void;
  onSearchResults: (results: any[]) => void;
}

export function ChatContent({
  onWebSearchToggle,
  onSearchResults,
}: ChatContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<
    "searching" | "processing" | "thinking" | null
  >(null);
  const [currentSessionId] = useState(() => `session-${Date.now()}`);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const now = Date.now();
    const userMessage: Message = {
      id: `user-${now}`,
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = input;
    setInput("");
    setIsLoading(true);
    setLoadingState("thinking"); // Start with "thinking" for direct answers

    // Create assistant message placeholder with unique ID
    const assistantMessageId = `assistant-${now}`;
    let assistantMessage: Message = {
      id: assistantMessageId,
      type: "assistant",
      content: "",
      timestamp: new Date(),
      sources: [],
    };

    try {
      await chatService.searchWithFallback(
        query,
        currentSessionId,
        // onSources callback - called when sources are available
        (sources) => {
          console.log("Received sources:", sources);
          assistantMessage.sources = sources;
          setMessages((prev) => [...prev, { ...assistantMessage }]);
          setLoadingState("processing");
          onSearchResults(sources);
        },
        // onAnswer callback - called when final answer is ready
        (answer, sources) => {
          console.log("Received final answer:", answer);
          assistantMessage.content = answer;
          assistantMessage.sources = sources || [];

          if (!sources || sources.length === 0) {
            setMessages((prev) => [...prev, { ...assistantMessage }]);
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId ? { ...assistantMessage } : msg
              )
            );
          }

          setIsLoading(false);
          setLoadingState(null);
        },
        (error) => {
          console.error("Search error:", error);
          const errorMessage: Message = {
            id: assistantMessageId,
            type: "assistant",
            content:
              "I apologize, but I encountered an error while processing your request. Please try again.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          setLoadingState(null);
        },

        () => {
          console.log("Web search started");
          setLoadingState("searching");
        }
      );
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: assistantMessageId,
        type: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
      setLoadingState(null);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <Logo className="w-6 h-6" />
          <h1 className="text-lg font-semibold">Nexly Chat</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 pb-48 pt-24">
        <div className="space-y-8 max-w-3xl mx-auto">
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const isNewConversation =
              prevMessage &&
              prevMessage.type === "assistant" &&
              message.type === "user";

            return (
              <div
                key={message.id}
                className={`w-full ${isNewConversation ? "mt-16" : ""}`}
              >
                {message.type === "user" ? (
                  <UserMessage
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ) : (
                  <AIMessage
                    content={message.content}
                    timestamp={message.timestamp}
                    sources={message.sources}
                  />
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-1">
                <ChatLoading
                  type={
                    loadingState === "searching"
                      ? "searching"
                      : loadingState === "processing"
                      ? "processing"
                      : "thinking"
                  }
                  className="text-muted-foreground"
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background pb-2 z-50">
        <div className="max-w-4xl mx-auto">
          <AIPrompt
            placeholder="Ask anything..."
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            disabled={isLoading}
            loading={isLoading}
            showAttachment={true}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Nexly can make mistakes. Please verify important information. Model:
            Kimi 2.0
          </p>
        </div>
      </div>
    </div>
  );
}
