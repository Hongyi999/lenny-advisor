"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Navbar from "@/components/hero/Navbar";
import SearchBar from "@/components/hero/SearchBar";
import GuestCard from "@/components/hero/GuestCard";
import type { GuestData } from "@/data/guests";

const Globe = dynamic(() => import("@/components/hero/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-[#e8e0d0] border-t-[#d4a853] animate-spin" />
    </div>
  ),
});

export default function HomePage() {
  const [activeGuest, setActiveGuest] = useState<GuestData | null>(null);
  const handleGuestChange = useCallback((guest: GuestData) => { setActiveGuest(guest); }, []);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />

      {/* ─── Title + Search ─── */}
      <section className="pt-28 sm:pt-36 pb-6 sm:pb-8 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.1] tracking-tight text-[#1a1a1a] max-w-4xl mx-auto mb-6">
            Ask anything. Get{" "}
            <span className="text-[#d4a853] relative inline-block">
              podcast-proven
              <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#d4a853]/30 rounded-full" />
            </span>{" "}
            wisdom.
          </h1>
          <p className="text-base sm:text-lg text-[#6b6b6b] leading-relaxed max-w-xl mx-auto">
            AI-powered answers grounded in 300+ episodes of Lenny&apos;s Podcast &mdash; with timestamps to the original moments.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} className="mt-8 sm:mt-10">
          <SearchBar />
        </motion.div>
      </section>

      {/* ─── Globe + Floating Guest Card ─── */}
      <section className="relative">
        {/* Globe canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="w-full h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] max-h-[760px]"
        >
          <Globe onGuestChange={handleGuestChange} />
        </motion.div>

        {/* Guest card overlay - positioned over lower part of globe */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none">
          {/* Gradient fade: transparent → page bg */}
          <div className="h-40 sm:h-52" style={{ background: "linear-gradient(to bottom, transparent 0%, #f5f0e8 80%)" }} />
          <div className="bg-[#f5f0e8] pointer-events-auto pb-4">
            <GuestCard guest={activeGuest} />
          </div>
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  );
}
