"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GuestData } from "@/data/guests";

function useTypewriter(text: string, speed: number = 25) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return { displayed, done };
}

export default function GuestCard({ guest }: { guest: GuestData | null }) {
  const { displayed, done } = useTypewriter(guest?.question ?? "", 20);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg min-h-[140px]">
        <AnimatePresence mode="wait">
          {guest && (
            <motion.div
              key={guest.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-lg shadow-black/[0.04] px-8 py-6 text-center"
            >
              {/* Guest name badge */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[#d4a853]/10 text-[#a07d25] text-xs font-semibold tracking-wider uppercase">
                  {guest.guest}
                </span>
              </div>

              {/* Typewriter quote */}
              <p className="text-[#1a1a1a] text-lg sm:text-xl font-serif italic leading-relaxed">
                &ldquo;{displayed}
                {!done && (
                  <span className="inline-block w-0.5 h-5 bg-[#d4a853] ml-0.5 align-text-bottom animate-pulse" />
                )}
                {done && <>&rdquo;</>}
              </p>

              {/* Episode title as subtitle */}
              <p className="text-[#999] text-sm mt-3 line-clamp-1">
                {guest.title}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
