"use client";

import React, { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Paperclip, Loader2, Plus, ArrowUp } from "lucide-react";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

interface AIPromptProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onNewChat?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  showAttachment?: boolean;
  showEmoji?: boolean;
  showVoice?: boolean;
  maxLength?: number;
}

export const AIPrompt = forwardRef<HTMLTextAreaElement, AIPromptProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      onNewChat,
      disabled = false,
      loading = false,
      className,
      showAttachment = true,
      maxLength,
    },
    ref
  ) => {
    const { textareaRef, adjustHeight } = useAutoResizeTextarea();
    const [isFocused, setIsFocused] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !disabled && value.trim()) {
        e.preventDefault();
        onSubmit();
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (maxLength && newValue.length > maxLength) return;
      onChange(newValue);
      adjustHeight();
    };

    const canSubmit = value.trim() && !disabled && !loading;

    return (
      <div className="w-full max-w-3xl mx-auto">
        <div
          className={cn(
            "relative rounded-xl border bg-background transition-all duration-200 shadow-sm",
            className
          )}
        >
          <div className="relative">
            <textarea
              ref={(node) => {
                if (ref) {
                  if (typeof ref === "function") {
                    ref(node);
                  } else {
                    ref.current = node;
                  }
                }
                if (node) {
                  textareaRef.current = node;
                }
              }}
              placeholder="How can I help you today?"
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              className={cn(
                "w-full resize-none border-0 bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none placeholder:text-base",
                "min-h-[24px] max-h-[150px] pb-3",
                "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                "transition-all duration-200"
              )}
              style={{ fieldSizing: "content" } as any}
            />
          </div>

          {/* Button Row with Separator */}
          <div className="px-3 py-3 flex items-center justify-between">
            {/* New Chat Button - Left */}
            <Button
              type="button"
              onClick={onNewChat}
              // variant="outline"
              size="default"
              className="h-9 bg-transparent border text-foreground hover:bg-accent transition-colors duration-200 cursor-pointer text-sm"
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-2">
              {showAttachment && (
                <Button
                  type="button"
                  // variant="outline"
                  size="default"
                  className="h-9 bg-transparent border text-foreground transition-colors duration-200 text-sm hover:bg-accent cursor-pointer"
                  disabled={disabled}
                >
                  <Paperclip className="h-3 w-3 mr-1" />
                  Upload Files
                </Button>
              )}

              {/* Submit Button */}
              <Button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                size="default"
                className={cn(
                  "h-9 w-9 transition-all duration-200 cursor-pointer",
                  canSubmit
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg scale-100 hover:scale-105"
                    : "bg-muted text-muted-foreground cursor-not-allowed scale-95"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Character Count */}
          {maxLength && (
            <div className="px-4 pb-2 pt-0">
              <div className="text-xs text-muted-foreground text-right">
                <span
                  className={cn(
                    "transition-colors duration-200",
                    value.length > maxLength * 0.8 && "text-warning",
                    value.length > maxLength * 0.95 && "text-destructive"
                  )}
                >
                  {value.length}
                </span>
                /{maxLength}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

AIPrompt.displayName = "AIPrompt";
