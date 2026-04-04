"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

const quotes = [
  { country: "UNITED STATES", text: "AI should be like a good teacher — patient, knowledgeable, and never condescending.", author: "Healthcare worker — United States" },
  { country: "JAPAN", text: "I want to use less brain power on client problems to have time to read more books.", author: "Freelancer — Japan" },
  { country: "GERMANY", text: "I want AI to help me understand the world better, not to replace my understanding of it.", author: "Student — Germany" },
  { country: "BRAZIL", text: "For the first time I can access the same quality of information as someone in a rich country.", author: "Teacher — Brazil" },
  { country: "INDIA", text: "AI has made me a better doctor. I can research rare conditions in seconds.", author: "Physician — India" },
  { country: "DENMARK", text: "Everybody wishes they could experience the first fire, the first glimpse of electricity. This is now.", author: "Software engineer — Denmark" },
  { country: "NIGERIA", text: "I use Claude to help me write grant proposals. It levels the playing field.", author: "Researcher — Nigeria" },
  { country: "SOUTH KOREA", text: "The most useful thing AI does for me is help me think more clearly about problems.", author: "Product manager — South Korea" },
  { country: "UNITED KINGDOM", text: "I worry about becoming too dependent on something I don't fully understand.", author: "Writer — United Kingdom" },
  { country: "AUSTRALIA", text: "AI should amplify human creativity, not replace it.", author: "Designer — Australia" },
  { country: "FRANCE", text: "What matters is that AI remains a tool in service of people, not the other way around.", author: "Policy analyst — France" },
];

const newsCards = [
  {
    tag: "Announcements",
    date: "Apr 2, 2026",
    title: "Introducing Claude Opus 4.6",
    description: "Our most capable model yet, with breakthrough reasoning and agentic capabilities.",
    gradient: "from-[#c4704b] to-[#b8963e]",
  },
  {
    tag: "Research",
    date: "Mar 28, 2026",
    title: "The first AI-assisted drive on another planet",
    description: "Claude helped NASA's Perseverance rover travel four hundred meters autonomously on Mars.",
    gradient: "from-[#2d7a7a] to-[#4a9a8a]",
  },
  {
    tag: "Alignment Science",
    date: "Mar 15, 2026",
    title: "Advances in interpretability research",
    description: "New techniques for understanding how language models represent and process information.",
    gradient: "from-[#191918] to-[#444444]",
  },
];

const footerSections = [
  { title: "Product", links: ["Claude", "API", "Pricing", "Enterprise"] },
  { title: "Research", links: ["Overview", "Interpretability", "Alignment", "Publications"] },
  { title: "Company", links: ["About", "Careers", "News", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "Responsible Disclosure"] },
];

function GlobeSVG() {
  return (
    <svg viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="globeGrad" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#ece7dd" />
          <stop offset="100%" stopColor="#e0d9cb" />
        </radialGradient>
        <clipPath id="globeClip">
          <circle cx="600" cy="375" r="360" />
        </clipPath>
      </defs>
      <circle cx="600" cy="375" r="360" fill="url(#globeGrad)" stroke="#ccc5b5" strokeWidth="1" />
      <g clipPath="url(#globeClip)" opacity="0.2" stroke="#9a9a94" fill="none" strokeWidth="0.5">
        <ellipse cx="600" cy="175" rx="340" ry="30" />
        <ellipse cx="600" cy="255" rx="355" ry="25" />
        <line x1="240" y1="375" x2="960" y2="375" />
        <ellipse cx="600" cy="495" rx="355" ry="25" />
        <ellipse cx="600" cy="575" rx="340" ry="30" />
        <ellipse cx="600" cy="375" rx="30" ry="350" />
        <ellipse cx="600" cy="375" rx="120" ry="355" />
        <ellipse cx="600" cy="375" rx="220" ry="358" />
        <ellipse cx="600" cy="375" rx="300" ry="360" />
        <line x1="600" y1="15" x2="600" y2="735" />
      </g>
      {/* Continents as dot clusters */}
      <g clipPath="url(#globeClip)" fill="#b0a898" opacity="0.6">
        {/* North America */}
        <circle cx="320" cy="200" r="3" /><circle cx="335" cy="195" r="2.5" />
        <circle cx="310" cy="210" r="3" /><circle cx="325" cy="215" r="2" />
        <circle cx="340" cy="205" r="2" /><circle cx="305" cy="225" r="2.5" />
        <circle cx="315" cy="235" r="3" /><circle cx="330" cy="230" r="2" />
        <circle cx="345" cy="220" r="2" /><circle cx="300" cy="245" r="2" />
        <circle cx="320" cy="250" r="2.5" /><circle cx="290" cy="260" r="2" />
        <circle cx="310" cy="265" r="2" /><circle cx="335" cy="245" r="2" />
        <circle cx="295" cy="205" r="2" /><circle cx="280" cy="240" r="2" />
        {/* South America */}
        <circle cx="360" cy="320" r="2" /><circle cx="370" cy="340" r="2.5" />
        <circle cx="380" cy="360" r="2" /><circle cx="390" cy="385" r="2.5" />
        <circle cx="395" cy="410" r="2" /><circle cx="400" cy="435" r="2" />
        <circle cx="405" cy="455" r="2" /><circle cx="395" cy="470" r="1.5" />
        <circle cx="385" cy="490" r="2" /><circle cx="375" cy="505" r="1.5" />
        {/* Europe */}
        <circle cx="560" cy="195" r="2.5" /><circle cx="575" cy="200" r="2" />
        <circle cx="590" cy="195" r="2.5" /><circle cx="555" cy="210" r="2" />
        <circle cx="570" cy="215" r="2.5" /><circle cx="585" cy="210" r="2" />
        <circle cx="600" cy="205" r="2" /><circle cx="545" cy="225" r="2" />
        <circle cx="560" cy="230" r="2" /><circle cx="575" cy="228" r="2.5" />
        <circle cx="590" cy="225" r="2" /><circle cx="605" cy="220" r="2" />
        {/* Africa */}
        <circle cx="575" cy="320" r="2.5" /><circle cx="590" cy="330" r="2.5" />
        <circle cx="580" cy="345" r="2" /><circle cx="595" cy="350" r="2.5" />
        <circle cx="600" cy="370" r="2" /><circle cx="610" cy="365" r="2" />
        <circle cx="605" cy="385" r="2.5" /><circle cx="595" cy="395" r="2" />
        <circle cx="600" cy="410" r="2" /><circle cx="610" cy="420" r="2" />
        <circle cx="605" cy="440" r="2" /><circle cx="598" cy="455" r="2" />
        {/* Asia */}
        <circle cx="660" cy="200" r="2" /><circle cx="680" cy="195" r="2.5" />
        <circle cx="700" cy="200" r="2" /><circle cx="720" cy="205" r="2.5" />
        <circle cx="740" cy="210" r="2" /><circle cx="760" cy="215" r="2" />
        <circle cx="780" cy="220" r="2.5" /><circle cx="650" cy="220" r="2" />
        <circle cx="670" cy="225" r="2.5" /><circle cx="690" cy="230" r="2" />
        <circle cx="710" cy="235" r="2" /><circle cx="730" cy="240" r="2.5" />
        <circle cx="750" cy="245" r="2" /><circle cx="770" cy="250" r="2" />
        <circle cx="700" cy="310" r="2" /><circle cx="710" cy="325" r="2" />
        <circle cx="820" cy="230" r="2" /><circle cx="835" cy="250" r="2" />
        {/* Australia */}
        <circle cx="800" cy="460" r="2.5" /><circle cx="815" cy="450" r="2" />
        <circle cx="830" cy="460" r="2.5" /><circle cx="820" cy="475" r="2" />
        <circle cx="835" cy="480" r="2" /><circle cx="805" cy="485" r="2" />
      </g>
      {/* Denmark highlight */}
      <g fill="#d4903c" opacity="0.9">
        <circle cx="572" cy="198" r="5" />
        <circle cx="580" cy="202" r="4" />
        <circle cx="568" cy="205" r="3.5" />
        <circle cx="576" cy="210" r="3" />
      </g>
    </svg>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(5);

  const nextQuote = useCallback(() => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextQuote, 5000);
    return () => clearInterval(interval);
  }, [nextQuote]);

  const q = quotes[currentQuote];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-[#f5f0e8]">
      {/* ===== HEADER ===== */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/85 backdrop-blur-xl border-b border-black/5"
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 256 256" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="256" height="256" rx="60" fill="#191918" />
              <path d="M147.5 48L60 208h37.5L185 48h-37.5zM108 208l50-108h37.5L145.5 208H108z" fill="#faf7f2" />
            </svg>
            <span className="text-[17px] font-semibold tracking-tight text-[#191918]">anthropic</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-[#4a4a46] hover:text-[#191918] transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="#" className="hidden sm:inline-flex items-center gap-1.5 px-[18px] py-2 rounded-full bg-[#191918] text-white text-sm font-medium hover:bg-[#333]">
              Try Claude <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#191918]" aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ===== HERO: 81K ===== */}
      <section className="pt-20 text-center overflow-hidden">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-[clamp(3rem,8vw,7.5rem)] font-normal leading-[1.0] tracking-[-0.03em] px-6 pt-10 pb-4 max-w-[1100px] mx-auto"
        >
          What 81,000 people<br />want from AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg text-[#4a4a46] max-w-[640px] mx-auto mb-8 px-6"
        >
          The largest study ever done on AI and how it&apos;s shaping lives around the world.
        </motion.p>

        <motion.a
          href="#"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[#ccc5b5] text-[#191918] font-medium text-base hover:bg-[#ebe5d9] transition-colors mb-10"
        >
          Read more <ArrowRight className="w-4 h-4" />
        </motion.a>

        {/* Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-[1200px] mx-auto"
          style={{ aspectRatio: "16/10" }}
        >
          <GlobeSVG />
        </motion.div>
      </section>

      {/* ===== QUOTE CAROUSEL ===== */}
      <section className="px-6 pb-16 max-w-[900px] mx-auto">
        <div className="flex gap-2 mb-5">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuote(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentQuote ? "bg-[#191918]" : "bg-[#ccc5b5]"}`}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
        <motion.div key={currentQuote} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="inline-block bg-[#d4903c] text-white text-xs font-bold tracking-[0.08em] uppercase px-2.5 py-1 mb-4">
            {q.country}
          </span>
          <p className="text-[clamp(1.5rem,3vw,2.2rem)] font-normal leading-[1.35] tracking-[-0.01em] text-[#191918] mb-4">
            &ldquo;{q.text}&rdquo;
          </p>
          <p className="text-sm text-[#9a9a94]">{q.author}</p>
        </motion.div>
      </section>

      {/* ===== MISSION BANNER ===== */}
      <section className="py-20 px-6 text-center border-t border-[#ddd6c8]">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[clamp(1.2rem,2.5vw,1.6rem)] text-[#4a4a46] max-w-[800px] mx-auto leading-relaxed"
        >
          AI will have a vast impact on the world. Anthropic is a public benefit corporation dedicated to securing its benefits and mitigating its risks.
        </motion.p>
      </section>

      {/* ===== NEWS ===== */}
      <section className="px-6 lg:px-10 pb-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#6b6b66]">Latest Updates</h2>
            <a href="#" className="text-sm font-medium text-[#6b6b66] hover:text-[#191918] flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {newsCards.map((card, i) => (
              <motion.a
                key={card.title}
                href="#"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-[#ddd6c8] hover:shadow-lg hover:border-[#ccc5b5] transition-all"
              >
                <div className={`h-[180px] w-full bg-gradient-to-br ${card.gradient}`} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-[11px] font-semibold text-[#c4704b] uppercase tracking-wider">{card.tag}</span>
                    <span className="text-xs text-[#9a9a94]">{card.date}</span>
                  </div>
                  <h3 className="text-[17px] font-medium text-[#191918] mb-2 leading-snug group-hover:underline underline-offset-2">{card.title}</h3>
                  <p className="text-sm text-[#6b6b66] leading-relaxed flex-1">{card.description}</p>
                  <div className="mt-3.5 text-sm font-medium text-[#191918] flex items-center gap-1">
                    Read more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DARK BANNER ===== */}
      <section className="px-6 lg:px-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-[1400px] mx-auto relative overflow-hidden rounded-3xl bg-[#191918] text-white p-10 lg:p-16"
        >
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[13px] font-medium mb-5">New</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-tight tracking-tight mb-4 max-w-[600px]">
              No ads. No sponsored content. Just genuinely helpful conversations.
            </h2>
            <p className="text-[#9a9a94] text-[17px] leading-relaxed max-w-[560px] mb-7">
              Claude can help you think through problems, create content, and get work done.
            </p>
            <Link href="#" className="inline-flex items-center gap-2 px-[22px] py-2.5 rounded-full bg-white text-[#191918] text-sm font-medium hover:bg-[#f5f0e8] transition-colors">
              Try Claude for free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute top-1/2 right-[-5%] -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,112,75,0.15) 0%, transparent 70%)" }} />
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#ddd6c8] px-6 lg:px-10 py-12 bg-[#f5f0e8]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-7 mb-10">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-[13px] font-semibold text-[#191918] mb-3.5">{section.title}</h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-[#6b6b66] hover:text-[#191918] transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-[#ddd6c8]">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 256 256" className="w-[22px] h-[22px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="256" height="256" rx="60" fill="#191918" />
                <path d="M147.5 48L60 208h37.5L185 48h-37.5zM108 208l50-108h37.5L145.5 208H108z" fill="#faf7f2" />
              </svg>
              <span className="text-sm font-semibold text-[#191918]">anthropic</span>
            </div>
            <p className="text-xs text-[#9a9a94]">&copy; 2026 Anthropic PBC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
