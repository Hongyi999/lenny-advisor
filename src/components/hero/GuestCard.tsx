"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GuestData } from "@/data/guests";

interface GuestCardProps {
  guest: GuestData | null;
  total: number;
}

export default function GuestCard({ guest, total }: GuestCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto h-24 flex items-start justify-center">
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
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#d4a853]/15 text-[#a08030] text-xs font-medium tracking-wide uppercase">
                {guest.guest}
              </span>
            </div>
            <p className="text-[#1a1a1a] text-lg sm:text-xl font-serif italic leading-relaxed max-w-lg mx-auto">
              &ldquo;{guest.question}&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
