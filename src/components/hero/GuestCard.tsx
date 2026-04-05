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
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {guest && (
            <motion.div
              key={guest.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center"
            >
              {/* YouTube Thumbnail — flat, no shadow */}
              {guest.thumbnail && (
                <div className="mx-auto mb-3 max-w-[340px] sm:max-w-[380px]">
                  <a
                    href={ytUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative rounded-xl overflow-hidden group"
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
                </div>
              )}

              {/* Guest name badge */}
              <div className="mb-1.5">
                <span className="inline-block px-3 py-1 rounded-full bg-[#d4a853]/15 text-[#a07d25] text-xs font-semibold tracking-wider uppercase">
                  {guest.guest}
                </span>
              </div>

              {/* Quote — forced single line with ellipsis truncation */}
              <p className="text-[#1a1a1a] text-base sm:text-lg font-serif italic leading-normal px-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-xl mx-auto">
                &ldquo;{displayed}
                {!done && <span className="inline-block w-0.5 h-4 bg-[#d4a853] ml-0.5 align-text-bottom animate-pulse" />}
                {done && <>&rdquo;</>}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
