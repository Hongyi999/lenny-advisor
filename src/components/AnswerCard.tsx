"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Copy, Check, Download, BookOpen } from "lucide-react";
import CitationCard from "./CitationCard";
import type { Citation } from "@/lib/rag";

interface AnswerCardProps {
  content: string;
  citations: Citation[];
  isStreaming?: boolean;
}

export default function AnswerCard({
  content,
  citations,
  isStreaming = false,
}: AnswerCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, format: "md" }),
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lenny-advisor-answer.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Answer content */}
      <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-sage-100 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-sage-500" />
          </div>
          <span className="text-sm font-medium text-sand-500">
            Lenny Advisor
          </span>
          {isStreaming && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-accent">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-accent"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              Writing...
            </span>
          )}
        </div>

        <div className="prose prose-sand max-w-none text-sand-800 leading-relaxed [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:text-sand-900 [&_h2]:text-sand-900 [&_h3]:text-sand-900 [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline [&_strong]:text-sand-900 [&_blockquote]:border-accent/30 [&_blockquote]:text-sand-600 [&_code]:bg-sand-100 [&_code]:text-sand-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>

          {/* Streaming cursor */}
          {isStreaming && (
            <motion.span
              className="inline-block w-0.5 h-5 bg-accent ml-0.5 align-text-bottom"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>

        {!isStreaming && content && (
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-sand-100">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sand-600 hover:bg-sand-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-sage-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sand-600 hover:bg-sand-100 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        )}
      </div>

      {/* Citations */}
      {citations.length > 0 && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-sand-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-accent-light text-accent text-xs font-bold flex items-center justify-center">
              {citations.length}
            </span>
            Sources referenced
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {citations.map((citation, i) => (
              <motion.div
                key={`${citation.episode_slug}-${citation.timestamp_seconds}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CitationCard citation={citation} index={i} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
