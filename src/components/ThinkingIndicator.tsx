"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const THINKING_STEPS = [
  "Searching across 300+ episodes...",
  "Finding the most relevant insights...",
  "Synthesizing wisdom from top leaders...",
];

export default function ThinkingIndicator({ step = 0 }: { step?: number }) {
  const currentStep = Math.min(step, THINKING_STEPS.length - 1);

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
          <BookOpen className="w-4.5 h-4.5 text-sage-500" />
        </div>
        <span className="text-sm font-medium text-sand-500">
          Lenny Advisor
        </span>
      </div>

      {/* Animated thinking dots */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-accent/60"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress steps */}
      <div className="space-y-2">
        {THINKING_STEPS.map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: i <= currentStep ? 1 : 0.3,
              x: 0,
            }}
            transition={{ delay: i * 0.5, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            {i < currentStep ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 rounded-full bg-sage-400 flex items-center justify-center"
              >
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            ) : i === currentStep ? (
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-accent"
                animate={{ borderColor: ["#c06030", "#d4956a", "#c06030"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-sand-200" />
            )}
            <span
              className={`text-sm ${
                i <= currentStep ? "text-sand-700" : "text-sand-400"
              }`}
            >
              {text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
