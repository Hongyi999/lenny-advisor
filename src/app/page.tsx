"use client";

import { Suspense, lazy } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
  BookOpen,
  CirclePlay,
  Download,
} from "lucide-react";
import HeroInput from "@/components/HeroInput";
import TopicExplorer from "@/components/TopicExplorer";

const Globe = lazy(() => import("@/components/Globe"));

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Fixed nav */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-sand-50/80 backdrop-blur-xl border-b border-sand-200/50"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
          <Link href="/" className="font-serif text-xl font-bold text-sand-900 tracking-tight">
            Lenny Advisor
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sand-600 hover:text-sand-900 text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sand-900 text-white text-sm font-medium transition-all hover:bg-sand-800 hover:shadow-lg">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ===== HERO + GLOBE: Merged dramatic opening ===== */}
      <section className="relative pt-24 pb-0 min-h-screen flex flex-col">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-warm-200/30 via-warm-100/15 to-transparent blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sage-200/20 via-sage-100/10 to-transparent blur-3xl" />
        </div>

        {/* Title + input */}
        <div className="relative z-10 text-center px-6 pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-sand-200 text-sand-600 text-xs font-medium mb-6 tracking-wide"
          >
            <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
            Powered by 300+ Lenny&apos;s Podcast episodes
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-sand-900 leading-[1.1] tracking-tight mb-5"
          >
            Your toughest questions,{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-accent">answered</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 right-0 h-3 bg-accent/10 rounded-full origin-left"
              />
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-sand-500 leading-relaxed mb-8 max-w-lg mx-auto"
          >
            Get advice grounded in real conversations with world-class leaders.
          </motion.p>

          <HeroInput />
        </div>

        {/* Globe (fills remaining space) */}
        <div className="flex-1 relative mt-4">
          <Suspense
            fallback={
              <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-sand-300 border-t-accent rounded-full animate-spin" />
                  <span className="text-sm text-sand-400">Loading globe...</span>
                </div>
              </div>
            }
          >
            <Globe />
          </Suspense>
        </div>
      </section>

      {/* ===== TOPICS ===== */}
      <section className="px-6 py-20 bg-white border-t border-sand-100">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 {...fadeUp} className="font-serif text-2xl font-bold text-sand-900 text-center mb-2">
            Explore by topic
          </motion.h2>
          <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-sand-500 text-center mb-10">
            Click a topic to see suggested questions
          </motion.p>
          <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
            <TopicExplorer />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS (compact single row) ===== */}
      <section className="px-6 py-14 border-t border-sand-100">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-5xl mx-auto"
        >
          <motion.h2 {...fadeUp} className="text-sm font-semibold text-sand-400 text-center mb-8 tracking-widest uppercase">
            How it works
          </motion.h2>

          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row items-stretch gap-0">
            {[
              { icon: <MessageCircle className="w-5 h-5" />, step: "01", title: "Ask naturally", desc: "Type or speak your challenge" },
              { icon: <BookOpen className="w-5 h-5" />, step: "02", title: "Grounded answers", desc: "Insights from real conversations" },
              { icon: <CirclePlay className="w-5 h-5" />, step: "03", title: "Watch the source", desc: "Jump to the exact YouTube moment" },
              { icon: <Download className="w-5 h-5" />, step: "04", title: "Save & share", desc: "Copy, download, or export" },
            ].map((f, i) => (
              <div key={f.step} className="flex-1 flex items-center gap-4 px-5 py-4 relative group">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-sand-200" />
                )}

                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center text-accent shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-sand-300 tracking-widest">{f.step}</span>
                    <h3 className="text-sm font-semibold text-sand-900">{f.title}</h3>
                  </div>
                  <p className="text-xs text-sand-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== CTA ===== */}
      <section className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-sand-900 to-sand-800 px-8 py-14"
        >
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Ready to find your answer?
          </h2>
          <p className="text-sand-400 mb-8 max-w-md mx-auto">
            Join others getting AI-powered insights from the best product minds.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white text-lg font-medium transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sand-200 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-sand-500">
          <p className="font-serif font-semibold text-sand-700">Lenny Advisor</p>
          <p>
            Built with care, powered by{" "}
            <a href="https://www.lennyspodcast.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Lenny&apos;s Podcast
            </a>
          </p>
          <p className="text-sand-400">Not affiliated with Lenny Rachitsky</p>
        </div>
      </footer>
    </div>
  );
}
