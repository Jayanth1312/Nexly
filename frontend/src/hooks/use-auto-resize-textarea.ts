import { useEffect, useRef } from "react";

export function useAutoResizeTextarea() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      adjustHeight();
    }
  });

  return { textareaRef, adjustHeight };
}
