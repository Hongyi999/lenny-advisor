"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const navLinks = [
  { label: "API", href: "#api" },
  { label: "Research", href: "#research" },
  { label: "News", href: "#news" },
  { label: "Commitments", href: "#commitments" },
  { label: "Careers", href: "#careers" },
];

const newsCards = [
  {
    tag: "Announcements",
    date: "Apr 2, 2026",
    title: "Introducing Claude Opus 4.6",
    description:
      "Our most capable model yet, with breakthrough reasoning and agentic capabilities.",
    image: "linear-gradient(135deg, #c4704b 0%, #b8963e 100%)",
  },
  {
    tag: "Research",
    date: "Mar 28, 2026",
    title: "The first AI-assisted drive on another planet",
    description:
      "Claude helped NASA's Perseverance rover travel four hundred meters autonomously on Mars.",
    image: "linear-gradient(135deg, #2d7a7a 0%, #4a9a8a 100%)",
  },
  {
    tag: "Alignment Science",
    date: "Mar 15, 2026",
    title: "Advances in interpretability research",
    description:
      "New techniques for understanding how language models represent and process information.",
    image: "linear-gradient(135deg, #191918 0%, #333332 100%)",
  },
];

const productFeatures = [
  {
    title: "Reasoning",
    description:
      "Claude thinks through complex problems step-by-step, showing its work and reasoning process.",
  },
  {
    title: "Coding",
    description:
      "Write, debug, and refactor code across dozens of programming languages with deep understanding.",
  },
  {
    title: "Analysis",
    description:
      "Process documents, data, and images to extract insights and answer nuanced questions.",
  },
  {
    title: "Writing",
    description:
      "Create clear, well-structured content from technical documentation to creative prose.",
  },
];

const footerSections = [
  {
    title: "Product",
    links: ["Claude", "API", "Pricing", "Enterprise"],
  },
  {
    title: "Research",
    links: ["Overview", "Interpretability", "Alignment", "Publications"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "News", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "Responsible Disclosure"],
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* ===== HEADER / NAV ===== */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f6]/80 backdrop-blur-xl"
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg
              viewBox="0 0 256 256"
              className="w-8 h-8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="256" height="256" rx="60" fill="#191918" />
              <path
                d="M147.5 48L60 208h37.5L185 48h-37.5zM108 208l50-108h37.5L145.5 208H108z"
                fill="#faf9f6"
              />
            </svg>
            <span className="text-lg font-semibold tracking-tight text-[#191918]">
              anthropic
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[15px] text-[#4a4a46] hover:text-[#191918] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="#claude"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#191918] text-white text-sm font-medium transition-all hover:bg-[#333332]"
            >
              Try Claude <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#191918]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#faf9f6] border-t border-[#e8e4db] overflow-hidden"
            >
              <nav className="flex flex-col px-6 py-4 gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base text-[#4a4a46] hover:text-[#191918] py-2"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  href="#claude"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#191918] text-white text-sm font-medium mt-2"
                >
                  Try Claude <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            className="max-w-4xl"
          >
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6 }}
              className="text-sm font-medium text-[#6b6b66] tracking-wide uppercase mb-6"
            >
              Anthropic
            </motion.p>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[1.05] tracking-tight text-[#191918] mb-8"
            >
              The responsible development and maintenance of advanced AI for the
              long-term benefit of humanity.
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-[#6b6b66] leading-relaxed max-w-2xl mb-10"
            >
              We build reliable, interpretable, and steerable AI systems.
              Our flagship product Claude is a helpful AI assistant designed
              to be safe at its core.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="#claude"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#191918] text-white font-medium transition-all hover:bg-[#333332] hover:shadow-lg"
              >
                Meet Claude <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#research"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#d4c9b8] text-[#191918] font-medium transition-all hover:bg-[#f0ede6]"
              >
                Our Research
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative element */}
        <div className="absolute top-20 right-0 w-[40%] h-full pointer-events-none hidden lg:block">
          <div className="absolute top-1/2 -translate-y-1/2 right-10 w-[500px] h-[500px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(196,112,75,0.08) 0%, rgba(184,150,62,0.04) 50%, transparent 70%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ===== ANNOUNCEMENT BANNER ===== */}
      <section className="px-6 lg:px-10 pb-20">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-[#191918] text-white p-10 lg:p-16"
          >
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-sm font-medium mb-6">
                New
              </span>
              <h2 className="text-3xl lg:text-4xl font-medium leading-tight tracking-tight mb-4">
                Claude is ready to help.
              </h2>
              <p className="text-[#9a9a94] text-lg leading-relaxed mb-8">
                No ads. No sponsored content. Just genuinely helpful
                conversations. Claude can help you think through problems,
                create content, and get work done.
              </p>
              <Link
                href="#claude"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#191918] font-medium text-sm transition-all hover:bg-[#f0ede6]"
              >
                Try Claude for free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Abstract glow */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
              <div
                className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[400px] h-[400px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(196,112,75,0.6) 0%, transparent 70%)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== NEWS / FEATURED CONTENT ===== */}
      <section id="news" className="px-6 lg:px-10 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div
              {...fadeUp}
              className="flex items-center justify-between mb-10"
            >
              <h2 className="text-2xl font-medium tracking-tight text-[#191918]">
                Latest Updates
              </h2>
              <a
                href="#news"
                className="text-sm font-medium text-[#6b6b66] hover:text-[#191918] transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {newsCards.map((card, i) => (
                <motion.a
                  key={card.title}
                  href="#"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-[#e8e4db] hover:shadow-lg hover:border-[#d4c9b8] transition-all"
                >
                  {/* Card image area */}
                  <div
                    className="h-48 w-full"
                    style={{ background: card.image }}
                  />
                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-[#c4704b] uppercase tracking-wider">
                        {card.tag}
                      </span>
                      <span className="text-xs text-[#9a9a94]">
                        {card.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-[#191918] mb-2 group-hover:underline decoration-1 underline-offset-4">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#6b6b66] leading-relaxed flex-1">
                      {card.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#191918]">
                      Read more{" "}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== CLAUDE PRODUCT SECTION ===== */}
      <section
        id="claude"
        className="px-6 lg:px-10 py-24 bg-[#f0ede6] border-t border-[#e8e4db]"
      >
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div {...fadeUp} className="max-w-2xl mb-16">
              <p className="text-sm font-medium text-[#c4704b] tracking-wide uppercase mb-4">
                Our Product
              </p>
              <h2 className="text-4xl lg:text-5xl font-medium leading-tight tracking-tight text-[#191918] mb-6">
                Meet Claude
              </h2>
              <p className="text-lg text-[#6b6b66] leading-relaxed">
                Claude is a next-generation AI assistant built for work and
                trained to be safe, accurate, and secure. Whether you&apos;re
                summarizing documents, writing code, or thinking through complex
                problems, Claude is here to help.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {productFeatures.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-6 rounded-2xl bg-white border border-[#e8e4db]"
                >
                  <h3 className="text-base font-semibold text-[#191918] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#6b6b66] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="mt-10">
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#191918] text-white font-medium transition-all hover:bg-[#333332]"
              >
                Try Claude <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== RESEARCH SECTION ===== */}
      <section id="research" className="px-6 lg:px-10 py-24">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div {...fadeUp} className="max-w-2xl mb-16">
              <p className="text-sm font-medium text-[#2d7a7a] tracking-wide uppercase mb-4">
                Research
              </p>
              <h2 className="text-4xl lg:text-5xl font-medium leading-tight tracking-tight text-[#191918] mb-6">
                Pioneering AI safety
              </h2>
              <p className="text-lg text-[#6b6b66] leading-relaxed">
                We conduct frontier research to build AI systems that are safe,
                beneficial, and understandable. Our work spans interpretability,
                alignment, and the societal impacts of AI.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Interpretability",
                  desc: "Understanding what happens inside AI models — mapping the circuits and features that drive behavior.",
                  color: "#2d7a7a",
                },
                {
                  title: "Alignment",
                  desc: "Ensuring AI systems reliably follow human intent and values, even as capabilities grow.",
                  color: "#c4704b",
                },
                {
                  title: "Responsible Scaling",
                  desc: "A framework for safely developing increasingly capable AI systems with appropriate safeguards.",
                  color: "#b8963e",
                },
                {
                  title: "Societal Impacts",
                  desc: "Studying how AI affects economics, labor markets, and society to inform responsible deployment.",
                  color: "#4a4a46",
                },
              ].map((item, i) => (
                <motion.a
                  key={item.title}
                  href="#"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group flex gap-5 p-6 rounded-2xl border border-[#e8e4db] bg-white hover:shadow-md hover:border-[#d4c9b8] transition-all"
                >
                  <div
                    className="w-1 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <h3 className="text-lg font-medium text-[#191918] mb-2 group-hover:underline decoration-1 underline-offset-4">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#6b6b66] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== COMMITMENTS SECTION ===== */}
      <section
        id="commitments"
        className="px-6 lg:px-10 py-24 bg-[#191918] text-white"
      >
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div {...fadeUp} className="max-w-2xl mb-16">
              <p className="text-sm font-medium text-[#b8963e] tracking-wide uppercase mb-4">
                Our Commitments
              </p>
              <h2 className="text-4xl lg:text-5xl font-medium leading-tight tracking-tight mb-6">
                Building AI responsibly
              </h2>
              <p className="text-lg text-[#9a9a94] leading-relaxed">
                We believe AI safety isn&apos;t just a research problem — it&apos;s a
                commitment to how we build, deploy, and govern AI systems.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  num: "01",
                  title: "Safety First",
                  desc: "Every model we release undergoes rigorous safety testing. We develop and publish our Responsible Scaling Policy to guide decisions.",
                },
                {
                  num: "02",
                  title: "Transparency",
                  desc: "We share our research openly, publish model cards and system prompts, and engage with policymakers and civil society.",
                },
                {
                  num: "03",
                  title: "Broad Benefit",
                  desc: "We work to ensure AI benefits are widely shared, investing in education, economic research, and global access.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="border-t border-[#333332] pt-8"
                >
                  <span className="text-sm font-mono text-[#6b6b66] mb-4 block">
                    {item.num}
                  </span>
                  <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                  <p className="text-[#9a9a94] leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CAREERS CTA ===== */}
      <section id="careers" className="px-6 lg:px-10 py-24">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 p-10 lg:p-16 rounded-3xl border border-[#e8e4db] bg-[#f0ede6]"
          >
            <div className="max-w-xl">
              <p className="text-sm font-medium text-[#c4704b] tracking-wide uppercase mb-4">
                Careers
              </p>
              <h2 className="text-3xl lg:text-4xl font-medium leading-tight tracking-tight text-[#191918] mb-4">
                Help shape the future of AI
              </h2>
              <p className="text-[#6b6b66] leading-relaxed">
                We&apos;re a team of researchers, engineers, and policy experts
                working on one of the most important challenges of our time.
                Join us.
              </p>
            </div>
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#191918] text-white font-medium transition-all hover:bg-[#333332] shrink-0"
            >
              View open roles <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#e8e4db] px-6 lg:px-10 py-16 bg-[#faf9f6]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-[#191918] mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-[#6b6b66] hover:text-[#191918] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-[#e8e4db]">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 256 256"
                className="w-6 h-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="256" height="256" rx="60" fill="#191918" />
                <path
                  d="M147.5 48L60 208h37.5L185 48h-37.5zM108 208l50-108h37.5L145.5 208H108z"
                  fill="#faf9f6"
                />
              </svg>
              <span className="text-sm font-semibold text-[#191918]">
                anthropic
              </span>
            </div>
            <p className="text-xs text-[#9a9a94]">
              &copy; 2026 Anthropic PBC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
