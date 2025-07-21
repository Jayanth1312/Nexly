import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserMessageProps {
  content: string;
  timestamp: Date;
}

export function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <div className="flex gap-3 w-fit bg-muted rounded-lg px-3 pr-10 py-3">
      <Avatar className="w-8 h-8">
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="flex-1 mt-0.5">
        <div className="text-base leading-relaxed">{content}</div>
      </div>
    </div>
  );
}
