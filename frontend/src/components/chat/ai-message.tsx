import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "./logo";
import { MessageActions } from "./message-actions";
import { Sources } from "./sources";
import { Link } from "lucide-react";

interface Source {
  title: string;
  url: string;
  snippet?: string;
  text?: string;
  date?: string;
}

interface AIMessageProps {
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export function AIMessage({ content, timestamp, sources }: AIMessageProps) {
  return (
    <div className="w-full">
      <div className="flex gap-4">
        <div className="flex-1 space-y-6 w-full">
          {/* Sources Section - Only show if sources exist */}
          {sources && sources.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Link size={24} />
                <h2 className="text-xl font-semibold">Sources</h2>
              </div>
              <Sources sources={sources} />
            </div>
          )}
          {/* <div className="h-1"></div> */}
          {/* AI Response Section */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Logo className="w-8 h-8" />
              <h2 className="text-xl font-semibold">Results</h2>
            </div>
            <div className="prose prose-sm max-w-none w-full">
              <div
                className="text-base leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: content
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                    .replace(/•\s/g, "<br/>• ")
                    .replace(/\n/g, "<br/>"),
                }}
              />
            </div>

            {/* Action Buttons */}
            <MessageActions />
          </div>
        </div>
      </div>
    </div>
  );
}
