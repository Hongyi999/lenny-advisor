"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Episodes", href: "#episodes" },
  { label: "Chat History", href: "/history" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/80 backdrop-blur-xl border-b border-[#e8e0d0]/60"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-xl font-serif tracking-tight text-[#1a1a1a]">
            Lenny Advisor
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1a1a1a] text-white text-sm font-medium transition-all hover:bg-[#333] active:scale-[0.98]"
          >
            Start Asking <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#1a1a1a]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#f5f0e8] border-t border-[#e8e0d0] overflow-hidden"
          >
            <nav className="flex flex-col px-6 py-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base text-[#6b6b6b] hover:text-[#1a1a1a] py-2.5"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1a1a1a] text-white text-sm font-medium mt-2"
              >
                Start Asking <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
