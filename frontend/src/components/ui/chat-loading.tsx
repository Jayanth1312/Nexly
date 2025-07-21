"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface ChatLoadingProps {
  type: "searching" | "processing" | "thinking";
  className?: string;
  interval?: number;
}

const loadingTexts = {
  searching: [
    "Searching the web...",
    "Finding relevant sources...",
    "Gathering information...",
    "Analyzing web content...",
  ],
  processing: [
    "Processing results...",
    "Analyzing sources...",
    "Generating response...",
    "Almost done...",
  ],
  thinking: ["Thinking...", "Processing...", "Analyzing...", "Almost done..."],
};

export default function ChatLoading({
  type,
  className,
  interval = 2000,
}: ChatLoadingProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const texts = loadingTexts[type];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, texts.length]);

  return (
    <div className="flex items-center justify-start">
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTextIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              backgroundPosition: ["200% center", "-200% center"],
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
              backgroundPosition: {
                duration: 2.5,
                ease: "linear",
                repeat: Infinity,
              },
            }}
            className={cn(
              "text-sm font-medium bg-gradient-to-r from-neutral-950 via-neutral-400 to-neutral-950 dark:from-white dark:via-neutral-600 dark:to-white bg-[length:200%_100%] bg-clip-text text-transparent whitespace-nowrap",
              className
            )}
          >
            {texts[currentTextIndex]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
