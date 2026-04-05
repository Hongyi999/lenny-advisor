"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

const HINTS = [
  "How do I find product-market fit?",
  "What's the best way to run a 1:1?",
  "How should I think about career growth?",
  "What makes a great product manager?",
  "How do I build a growth engine?",
  "What's the secret to great hiring?",
];

export default function SearchBar() {
  const [value, setValue] = useState("");
  const [hintIdx, setHintIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (focused || value) return;
    const iv = setInterval(() => setHintIdx((i) => (i + 1) % HINTS.length), 3000);
    return () => clearInterval(iv);
  }, [focused, value]);

  function submit() {
    const q = value.trim();
    if (!q) return;
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={`
          relative flex items-center gap-3 h-14 sm:h-[60px] px-5 sm:px-6
          rounded-full bg-white
          shadow-[0_2px_20px_rgba(0,0,0,0.08)]
          transition-shadow duration-300
          ${focused ? "shadow-[0_4px_30px_rgba(0,0,0,0.12)]" : ""}
        `}
      >
        <Search className="w-5 h-5 text-[#aaaaaa] shrink-0" />

        <div className="relative flex-1 h-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            aria-label="Ask a question"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full bg-transparent text-[#1a1a1a] text-base sm:text-lg outline-none placeholder:text-transparent"
            placeholder={HINTS[hintIdx]}
          />
          {!value && !focused && (
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.span
                  key={hintIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="text-base sm:text-lg text-[#aaaaaa]"
                >
                  {HINTS[hintIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          onClick={submit}
          disabled={!value.trim()}
          aria-label="Search"
          className={`
            w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all
            ${value.trim()
              ? "bg-[#1a1a1a] text-white cursor-pointer hover:bg-[#333] active:scale-95"
              : "bg-[#f0ebe0] text-[#ccc] cursor-not-allowed"
            }
          `}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      <p className="text-center text-xs text-[#aaa] mt-3">
        Your expert brain trust &middot; Answers with timestamps &middot; Build your knowledge base
      </p>
    </div>
  );
}
