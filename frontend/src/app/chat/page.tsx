"use client";

import { ChatInterface } from "@/components/chat/chat-interface";
import { ProtectedRoute } from "@/components/protected-route";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatInterface />
    </ProtectedRoute>
  );
}
