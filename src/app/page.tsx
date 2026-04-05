"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
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

  const globeSectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: globeSectionRef,
    offset: ["start end", "center center"],
  });

  // Gray container: starts narrow (75%) with rounded corners,
  // expands to 100% (fills screen) as you scroll — like Anthropic
  const containerScale = useTransform(scrollYProgress, [0, 0.6], [0.75, 1.0]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.6], [28, 0]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />

      {/* ─── Title + Search ─── */}
      <section className="pt-28 sm:pt-36 pb-4 sm:pb-6 px-6 text-center">
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

      {/* ─── Globe Section: Anthropic-style expanding gray container ─── */}
      <section ref={globeSectionRef} className="relative mt-2">
        <motion.div
          style={{ scale: containerScale, borderRadius }}
          className="relative mx-auto bg-[#e8e3d9] origin-top overflow-hidden"
        >
          {/* Floating text on upper portion of globe */}
          <div className="absolute top-[6%] sm:top-[8%] inset-x-0 text-center z-20 pointer-events-none">
            <p className="text-sm sm:text-base text-[#1a1a1a]/40 tracking-wide uppercase font-medium">
              302 guests &middot; 50+ countries &middot; 300+ episodes
            </p>
          </div>

          {/* Globe canvas — camera centered at (0,0), big globe */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full h-[85vh] sm:h-[90vh] max-h-[960px]"
          >
            <Globe onGuestChange={handleGuestChange} />
          </motion.div>

          {/* Guest card: floats at bottom of globe container */}
          <div className="absolute bottom-[3%] sm:bottom-[4%] inset-x-0 z-20 pointer-events-none">
            <div className="pointer-events-auto">
              <GuestCard guest={activeGuest} />
            </div>
          </div>
        </motion.div>
      </section>

      <div className="h-16" />
    </div>
  );
}
