"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Navbar from "@/components/hero/Navbar";
import SearchBar from "@/components/hero/SearchBar";
import GuestCard from "@/components/hero/GuestCard";
import type { GuestData } from "@/data/guests";

const Globe = dynamic(() => import("@/components/hero/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[480px] md:h-[560px] flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-[#e8e0d0] border-t-[#d4a853] animate-spin" />
    </div>
  ),
});

export default function HomePage() {
  const [activeGuest, setActiveGuest] = useState<GuestData | null>(null);

  const handleGuestChange = useCallback((guest: GuestData | null) => {
    setActiveGuest(guest);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f5f0e8] overflow-hidden">
      <Navbar />

      {/* Hero Content */}
      <main className="relative pt-24 sm:pt-28 pb-8 px-4 sm:px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto mb-8 sm:mb-10"
        >
          <h1 className="text-[clamp(2rem,5vw,4rem)] font-serif leading-[1.1] tracking-tight text-[#1a1a1a] mb-4">
            300+ episodes of wisdom,{" "}
            <span className="italic">one conversation away.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6b6b6b] leading-relaxed max-w-2xl mx-auto">
            AI-powered answers grounded in Lenny&apos;s Podcast &mdash; with
            timestamps to the original moments.
          </p>
        </motion.div>

        {/* Search Bar */}
        <SearchBar />

        {/* Globe */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="mt-6 sm:mt-8"
        >
          <Globe onGuestChange={handleGuestChange} />
        </motion.div>

        {/* Guest Spotlight Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="-mt-4"
        >
          <GuestCard guest={activeGuest} total={300} />
        </motion.div>

        {/* Bottom hint */}
        <div className="flex items-center justify-center gap-3 mt-4 pb-6">
          <span className="text-xs text-[#b0a090]">Hold &amp; drag to explore</span>
          <span className="text-[#d0c8b8]">&middot;</span>
          <span className="text-xs text-[#b0a090]">Guests from around the world</span>
        </div>
      </main>
    </div>
  );
}
