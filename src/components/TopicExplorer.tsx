"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowUpRight } from "lucide-react";

interface Topic {
  label: string;
  icon: string;
  questions: string[];
}

const TOPICS: Topic[] = [
  {
    label: "Product-Market Fit",
    icon: "🎯",
    questions: [
      "How do I know when I've found product-market fit?",
      "What are the best frameworks for validating PMF?",
      "How do I measure product-market fit quantitatively?",
      "What should I do if I'm losing product-market fit?",
    ],
  },
  {
    label: "Leadership",
    icon: "🧭",
    questions: [
      "What makes a great product leader?",
      "How do I transition from IC to manager?",
      "How do I lead through uncertainty and ambiguity?",
      "What are the most common leadership mistakes?",
    ],
  },
  {
    label: "Growth Strategy",
    icon: "📈",
    questions: [
      "What are the most effective growth levers?",
      "How do I build a sustainable growth engine?",
      "When should I invest in growth vs. retention?",
      "How do top companies think about viral growth?",
    ],
  },
  {
    label: "Career Growth",
    icon: "🚀",
    questions: [
      "How do I get promoted to a senior PM role?",
      "Should I join a startup or a big company?",
      "How do I build a personal brand in tech?",
      "What skills matter most for career advancement?",
    ],
  },
  {
    label: "Team Building",
    icon: "🤝",
    questions: [
      "How do I build a high-performing product team?",
      "What's the ideal product team structure?",
      "How do I create a culture of experimentation?",
      "How do I manage conflict within my team?",
    ],
  },
  {
    label: "Decision Making",
    icon: "⚖️",
    questions: [
      "How do I make better decisions under pressure?",
      "What frameworks help with prioritization?",
      "How do I say no to stakeholders effectively?",
      "When should I trust data vs. intuition?",
    ],
  },
  {
    label: "Hiring",
    icon: "🔍",
    questions: [
      "How do I hire great product managers?",
      "What interview questions reveal top talent?",
      "How do I assess culture fit during hiring?",
      "When is the right time to make my first PM hire?",
    ],
  },
  {
    label: "Innovation",
    icon: "💡",
    questions: [
      "How do I foster innovation in a large company?",
      "What drives successful product innovation?",
      "How do I balance innovation with execution?",
      "How do disruptive companies think about R&D?",
    ],
  },
];

export default function TopicExplorer() {
  const [activeTopic, setActiveTopic] = useState<number | null>(null);
  const router = useRouter();

  function handleQuestionClick(question: string) {
    router.push(`/chat?q=${encodeURIComponent(question)}`);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TOPICS.map((topic, idx) => {
          const isActive = activeTopic === idx;
          return (
            <motion.div
              key={topic.label}
              layout
              className={`
                col-span-1 rounded-2xl border cursor-pointer transition-colors
                ${isActive
                  ? "col-span-2 sm:col-span-4 border-accent/30 bg-white shadow-md"
                  : "border-sand-200 bg-white/60 hover:bg-white hover:border-sand-300 hover:shadow-sm"
                }
              `}
              onClick={() => setActiveTopic(isActive ? null : idx)}
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
            >
              {/* Topic header */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="text-xl">{topic.icon}</span>
                <span className={`text-sm font-medium ${isActive ? "text-sand-900" : "text-sand-700"}`}>
                  {topic.label}
                </span>
                <motion.div
                  className="ml-auto"
                  animate={{ rotate: isActive ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-sand-400" />
                </motion.div>
              </div>

              {/* Expanded questions */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 grid gap-2 sm:grid-cols-2">
                      {topic.questions.map((q, qi) => (
                        <motion.button
                          key={qi}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: qi * 0.05 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuestionClick(q);
                          }}
                          className="flex items-start gap-2 p-3 rounded-xl text-left text-sm text-sand-600 hover:bg-accent-light hover:text-accent transition-colors group cursor-pointer"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                          <span className="leading-relaxed">{q}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
