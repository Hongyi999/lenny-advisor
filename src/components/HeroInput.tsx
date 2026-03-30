"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Sparkles } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

const PLACEHOLDER_HINTS = [
  "How do I find product-market fit?",
  "I'm struggling to prioritize my roadmap...",
  "How can I become a better leader?",
  "What makes a great product team?",
  "How do I build a growth engine?",
  "I need to make a hard career decision...",
];

export default function HeroInput() {
  const [value, setValue] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const { isListening, transcript, startListening, stopListening, isSupported } =
    useVoiceInput((text) => {
      setValue((prev) => (prev + " " + text).trim());
    });

  useEffect(() => {
    if (isListening && transcript) {
      setValue(transcript);
    }
  }, [transcript, isListening]);

  // Rotating placeholder animation
  useEffect(() => {
    if (isFocused || value) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_HINTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isFocused, value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/chat?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={`
          relative rounded-2xl border bg-white/80 backdrop-blur-xl shadow-lg
          transition-all duration-300
          ${isFocused
            ? "border-accent/40 shadow-xl shadow-accent/10 ring-1 ring-accent/20"
            : "border-sand-200 shadow-sand-200/50"
          }
        `}
      >
        {/* Top area with icon */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-1">
          <Sparkles className="w-4 h-4 text-accent/60" />
          <span className="text-xs font-medium text-sand-400 tracking-wide uppercase">
            Ask Lenny Advisor
          </span>
        </div>

        {/* Textarea */}
        <div className="relative px-5 pb-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
            className="w-full resize-none bg-transparent text-sand-900 text-lg leading-relaxed placeholder:text-transparent outline-none py-2"
            placeholder={PLACEHOLDER_HINTS[placeholderIdx]}
          />

          {/* Animated placeholder */}
          {!value && !isFocused && (
            <div className="absolute left-5 top-2 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg text-sand-400"
                >
                  {PLACEHOLDER_HINTS[placeholderIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <div className="flex items-center gap-1">
            {isSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer
                  ${isListening
                    ? "bg-red-50 text-red-500 animate-pulse"
                    : "hover:bg-sand-100 text-sand-400 hover:text-sand-600"
                  }
                `}
                title={isListening ? "Stop recording" : "Voice input"}
              >
                {isListening ? (
                  <MicOff className="w-4.5 h-4.5" />
                ) : (
                  <Mic className="w-4.5 h-4.5" />
                )}
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer
              ${value.trim()
                ? "bg-accent text-white hover:bg-accent-hover shadow-sm"
                : "bg-sand-100 text-sand-300 cursor-not-allowed"
              }
            `}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2 mt-3"
          >
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-accent rounded-full"
                  animate={{
                    height: [4, 16, 4],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-accent font-medium">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
