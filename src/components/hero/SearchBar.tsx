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
    const iv = setInterval(() => {
      setHintIdx((i) => (i + 1) % HINTS.length);
    }, 3500);
    return () => clearInterval(iv);
  }, [focused, value]);

  function submit() {
    const q = value.trim();
    if (!q) return;
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={`
          relative flex items-center gap-3 px-5 py-4 rounded-2xl border bg-white/90 backdrop-blur-sm
          shadow-lg transition-all duration-300
          ${focused
            ? "border-[#d4a853]/40 shadow-xl shadow-[#d4a853]/10 ring-1 ring-[#d4a853]/20"
            : "border-[#e8e0d0] shadow-[#e8e0d0]/50"
          }
        `}
      >
        <Search className="w-5 h-5 text-[#b0a090] shrink-0" />

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full bg-transparent text-[#1a1a1a] text-lg outline-none placeholder:text-transparent"
            placeholder={HINTS[hintIdx]}
          />

          {/* Animated placeholder */}
          {!value && !focused && (
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.span
                  key={hintIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg text-[#b0a090]"
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
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0
            ${value.trim()
              ? "bg-[#1a1a1a] text-white hover:bg-[#333] cursor-pointer active:scale-95"
              : "bg-[#f0ebe0] text-[#c5bba8] cursor-not-allowed"
            }
          `}
        >
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>

      <p className="text-center text-xs text-[#b0a090] mt-3 tracking-wide">
        Powered by 300+ episodes &middot; Answers include YouTube timestamps
      </p>
    </motion.div>
  );
}
