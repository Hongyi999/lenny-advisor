"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GuestData } from "@/data/guests";

interface GuestCardProps {
  guest: GuestData | null;
}

/** Typewriter hook - types out text character by character */
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
      if (i >= text.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(iv);
  }, [text, speed]);

  return { displayed, done };
}

export default function GuestCard({ guest }: GuestCardProps) {
  const { displayed, done } = useTypewriter(guest?.question ?? "", 22);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-xl min-h-[180px] flex items-start justify-center">
        <AnimatePresence mode="wait">
          {guest && (
            <motion.div
              key={guest.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full"
            >
              {/* Thumbnail */}
              {guest.thumbnail && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative w-full max-w-sm mx-auto mb-4 rounded-xl overflow-hidden shadow-lg shadow-black/5"
                >
                  <div className="aspect-video bg-[#e8e0d0]">
                    <img
                      src={guest.thumbnail}
                      alt={guest.guest}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2">
                    <span className="text-white text-xs font-medium truncate">
                      {guest.guest}
                    </span>
                    <span className="text-white/50 text-xs">with Lenny</span>
                  </div>
                </motion.div>
              )}

              {/* Guest name badge */}
              <div className="text-center mb-2">
                <span className="inline-block px-3 py-1 rounded-full bg-[#d4a853]/15 text-[#8a6d20] text-xs font-semibold tracking-wide uppercase">
                  {guest.guest}
                </span>
              </div>

              {/* Typewriter question */}
              <div className="text-center px-4">
                <p className="text-[#1a1a1a] text-lg sm:text-xl font-serif leading-relaxed">
                  &ldquo;{displayed}
                  {!done && (
                    <span className="inline-block w-0.5 h-5 bg-[#d4a853] ml-0.5 align-middle animate-pulse" />
                  )}
                  {done && <>&rdquo;</>}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
