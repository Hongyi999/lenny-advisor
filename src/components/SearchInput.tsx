"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface SearchInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export default function SearchInput({
  onSubmit,
  disabled = false,
  initialValue = "",
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, transcript, startListening, stopListening, isSupported } =
    useVoiceInput((text) => {
      setValue((prev) => (prev + " " + text).trim());
    });

  useEffect(() => {
    if (isListening && transcript) {
      setValue(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="space-y-2">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-sand-300 bg-white shadow-sm transition-all focus-within:border-accent focus-within:shadow-md focus-within:shadow-accent/5"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Describe your challenge..."
          className="w-full resize-none rounded-2xl px-5 py-4 pr-24 text-sand-900 placeholder:text-sand-400 bg-transparent outline-none disabled:opacity-50"
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-1">
          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={disabled}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? "bg-red-50 text-red-500 animate-pulse"
                  : "hover:bg-sand-100 text-sand-400 hover:text-sand-600"
              } disabled:opacity-30`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center transition-all hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Voice indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-accent rounded-full"
                  animate={{ height: [3, 14, 3] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-accent font-medium">
              Listening...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
