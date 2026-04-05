"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GuestData } from "@/data/guests";

function useTypewriter(text: string, speed: number = 20) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => { i++; setDisplayed(text.slice(0, i)); if (i >= text.length) { clearInterval(iv); setDone(true); } }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return { displayed, done };
}

export default function GuestCard({ guest }: { guest: GuestData | null }) {
  const { displayed, done } = useTypewriter(guest?.question ?? "", 20);
  const ytUrl = guest?.video_id ? `https://www.youtube.com/watch?v=${guest.video_id}` : null;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl min-h-[180px]">
        <AnimatePresence mode="wait">
          {guest && (
            <motion.div
              key={guest.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center"
            >
              {/* YouTube Thumbnail — larger */}
              {guest.thumbnail && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mx-auto mb-4 max-w-[360px] sm:max-w-[400px]"
                >
                  <a
                    href={ytUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative rounded-xl overflow-hidden shadow-lg shadow-black/[0.1] hover:shadow-xl transition-shadow group"
                  >
                    <div className="aspect-video bg-[#e8e0d0]">
                      <img
                        src={guest.thumbnail}
                        alt={guest.guest}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="eager"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white ml-0.5" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center gap-1.5">
                      <span className="text-white text-[11px] font-medium truncate">{guest.guest}</span>
                      <span className="text-white/50 text-[11px]">· Lenny&apos;s Podcast</span>
                    </div>
                  </a>
                </motion.div>
              )}

              {/* Guest name badge */}
              <div className="mb-2">
                <span className="inline-block px-3 py-1 rounded-full bg-[#d4a853]/15 text-[#a07d25] text-xs font-semibold tracking-wider uppercase">
                  {guest.guest}
                </span>
              </div>

              {/* Typewriter quote — larger */}
              <p className="text-[#1a1a1a] text-lg sm:text-xl font-serif italic leading-relaxed px-4">
                &ldquo;{displayed}
                {!done && <span className="inline-block w-0.5 h-5 bg-[#d4a853] ml-0.5 align-text-bottom animate-pulse" />}
                {done && <>&rdquo;</>}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
