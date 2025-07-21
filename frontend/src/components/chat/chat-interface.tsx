"use client";

import { useState } from "react";
// import { ChatSidebar } from "./chat-sidebar";
import { ChatContent } from "./chat-content";
// import { WebSearchSidebar } from "./web-search-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function ChatInterface() {
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Left Sidebar - Chat Navigation */}
        {/* <ChatSidebar /> */}

        {/* Main Chat Content */}
        <div className="flex-1 flex">
          <ChatContent
            onWebSearchToggle={() => setIsWebSearchOpen(!isWebSearchOpen)}
            onSearchResults={setSearchResults}
          />

          {/* Right Sidebar - Web Search Results */}
          {/* {isWebSearchOpen && (
            <WebSearchSidebar
              isOpen={isWebSearchOpen}
              onClose={() => setIsWebSearchOpen(false)}
              searchResults={searchResults}
            />
          )} */}
        </div>
      </div>
    </SidebarProvider>
  );
}
