import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";

interface MessageActionsProps {
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onRegenerate?: () => void;
}

export function MessageActions({
  onCopy,
  onThumbsUp,
  onThumbsDown,
  onRegenerate,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Button variant="ghost" size="sm" className="h-auto p-1" onClick={onCopy}>
        <Copy className="w-3 h-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1"
        onClick={onThumbsUp}
      >
        <ThumbsUp className="w-3 h-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1"
        onClick={onThumbsDown}
      >
        <ThumbsDown className="w-3 h-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1"
        onClick={onRegenerate}
      >
        <RotateCcw className="w-3 h-3" />
      </Button>
    </div>
  );
}
