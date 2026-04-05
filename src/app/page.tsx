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

  // clip-path: inset() — GPU-composited, zero reflow, zero jitter
  // Start at 22% inset for smaller initial size → dramatic expansion
  const clipInset = useTransform(scrollYProgress, [0, 0.5], [22, 0]);
  const clipRadius = useTransform(scrollYProgress, [0, 0.5], [28, 0]);
  const clipPath = useTransform(
    [clipInset, clipRadius],
    ([inset, radius]: number[]) => `inset(0 ${inset}% round ${radius}px)`
  );

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />

      {/* ─── Title + Search ─── */}
      <section className="pt-28 sm:pt-36 pb-4 sm:pb-6 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.1] tracking-tight text-[#1a1a1a] max-w-4xl mx-auto mb-6">
            Ask anything. Get{" "}
            <span className="text-[#d4a853] relative inline-block">
              world-class
              <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#d4a853]/30 rounded-full" />
            </span>{" "}
            answers.
          </h1>
          <p className="text-base sm:text-lg text-[#6b6b6b] leading-relaxed max-w-xl mx-auto">
            AI-powered insights from 300+ expert conversations on Lenny&apos;s Podcast.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} className="mt-8 sm:mt-10">
          <SearchBar />
        </motion.div>
      </section>

      {/* ─── Globe Section: clip-path expanding from center ─── */}
      <section ref={globeSectionRef} className="relative mt-2">
        <motion.div
          style={{ clipPath }}
          className="relative bg-[#e8e3d9]"
        >
          {/* Large serif title */}
          <div className="absolute top-[5%] sm:top-[7%] inset-x-0 text-center z-20 pointer-events-none px-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[#1a1a1a] leading-tight max-w-3xl mx-auto">
              Where the world&apos;s best<br />share what they know
            </h2>
            <p className="text-sm sm:text-base text-[#6b6b6b] mt-3">
              302 podcast guests across 50+ countries
            </p>
          </div>

          {/* Globe canvas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full h-[85vh] sm:h-[90vh] max-h-[960px]"
          >
            <Globe onGuestChange={handleGuestChange} />
          </motion.div>

          {/* Vertical gradient ABOVE the card area — fades into bg */}
          <div
            className="absolute inset-x-0 z-10 pointer-events-none"
            style={{
              top: "52%",
              height: "14%",
              background: "linear-gradient(to bottom, transparent 0%, #e8e3d9 100%)",
            }}
          />

          {/* Solid bg behind card */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 pointer-events-none bg-[#e8e3d9]"
            style={{ top: "66%" }}
          />

          {/* Guest card — positioned so thumbnail/name stay fixed, text can extend down */}
          <div className="absolute inset-x-0 z-20 pointer-events-none" style={{ top: "60%" }}>
            <div className="relative pointer-events-auto pb-10">
              <GuestCard guest={activeGuest} />
            </div>
          </div>
        </motion.div>
      </section>

      <div className="h-16" />
    </div>
  );
}
