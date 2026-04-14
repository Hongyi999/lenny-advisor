"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SearchInput from "./SearchInput";
import AnswerCard from "./AnswerCard";
import ThinkingIndicator from "./ThinkingIndicator";
import type { Citation } from "@/lib/rag";
import {
  Sparkles,
  Lightbulb,
  Share2,
  Download,
  Check,
  Copy,
} from "lucide-react";

const TOPIC_SUGGESTIONS = [
  "How do I find product-market fit?",
  "What makes a great 1:1 meeting?",
  "How should I think about career growth?",
  "What makes a great product manager?",
  "How do I build a growth engine?",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
}

interface ChatViewProps {
  conversationId?: string;
  conversationTitle?: string;
  initialMessages?: Message[];
}

export default function ChatView({
  conversationId: initialConversationId,
  conversationTitle,
  initialMessages = [],
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [currentConversationId, setCurrentConversationId] = useState(
    initialConversationId
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "loading" | "copied">(
    "idle"
  );
  const [exportState, setExportState] = useState<"idle" | "loading">("idle");
  const [toast, setToast] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  const handleSendMessage = useCallback(async function handleSendMessage(message: string) {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      citations: [],
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    setThinkingStep(0);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let hasStartedContent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "meta") {
              if (parsed.conversationId && !currentConversationId) {
                setCurrentConversationId(parsed.conversationId);
                router.replace(`/chat/${parsed.conversationId}`, {
                  scroll: false,
                });
              }
              if (parsed.citations) {
                // Prepare assistant message with citations
                if (!hasStartedContent) {
                  setIsThinking(false);
                  setIsStreaming(true);
                  hasStartedContent = true;
                  const assistantMsg: Message = {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: "",
                    citations: parsed.citations,
                  };
                  setMessages((prev) => [...prev, assistantMsg]);
                } else {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last.role === "assistant") {
                      last.citations = parsed.citations;
                    }
                    return updated;
                  });
                }
              }
            }

            if (parsed.type === "content") {
              if (!hasStartedContent) {
                setIsThinking(false);
                setIsStreaming(true);
                hasStartedContent = true;
                const assistantMsg: Message = {
                  id: `assistant-${Date.now()}`,
                  role: "assistant",
                  content: parsed.content,
                  citations: [],
                };
                setMessages((prev) => [...prev, assistantMsg]);
              } else {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    last.content += parsed.content;
                  }
                  return updated;
                });
              }
            }

            if (parsed.type === "done") {
              setIsStreaming(false);
            }
          } catch {
            // Skip unparseable chunks
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm sorry, something went wrong. Please try again.",
          citations: [],
        },
      ]);
    }

    setIsStreaming(false);
    setIsThinking(false);
  }, [currentConversationId, router]);

  useEffect(() => {
    if (initialQuery && !hasSentInitial && messages.length === 0) {
      setHasSentInitial(true);
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, hasSentInitial, messages.length, handleSendMessage]);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleShare = useCallback(async () => {
    if (!currentConversationId || shareState === "loading") return;
    setShareState("loading");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: currentConversationId }),
      });
      if (!res.ok) throw new Error("Failed to create share link");
      const { token } = await res.json();
      const url = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setToast("Share link copied to clipboard");
      setTimeout(() => setShareState("idle"), 2000);
    } catch (err) {
      console.error("Share error:", err);
      setShareState("idle");
      setToast("Couldn't create share link");
    }
  }, [currentConversationId, shareState]);

  const handleExport = useCallback(async () => {
    if (!currentConversationId || exportState === "loading") return;
    setExportState("loading");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversationId,
          format: "md",
        }),
      });
      if (!res.ok) throw new Error("Failed to export");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] || "conversation.md";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setToast("Conversation exported");
    } catch (err) {
      console.error("Export error:", err);
      setToast("Couldn't export conversation");
    } finally {
      setExportState("idle");
    }
  }, [currentConversationId, exportState]);

  // Animate thinking steps
  useEffect(() => {
    if (!isThinking) return;
    const timers = [
      setTimeout(() => setThinkingStep(1), 1500),
      setTimeout(() => setThinkingStep(2), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isThinking]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Conversation header */}
      {(conversationTitle || currentConversationId) && (
        <div className="border-b border-sand-200 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <h1 className="text-sm font-medium text-sand-700 truncate flex-1 min-w-0">
              {conversationTitle || "Conversation"}
            </h1>
            {currentConversationId && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleShare}
                  disabled={shareState === "loading"}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-sand-200 bg-white text-xs font-medium text-sand-700 hover:border-accent/40 hover:text-accent hover:bg-accent-light/50 transition-colors disabled:opacity-60 cursor-pointer"
                  title="Copy shareable link"
                >
                  {shareState === "copied" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : shareState === "loading" ? (
                    <>
                      <Copy className="w-3.5 h-3.5 animate-pulse" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </>
                  )}
                </button>
                <button
                  onClick={handleExport}
                  disabled={exportState === "loading"}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-sand-200 bg-white text-xs font-medium text-sand-700 hover:border-accent/40 hover:text-accent hover:bg-accent-light/50 transition-colors disabled:opacity-60 cursor-pointer"
                  title="Download as Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  {exportState === "loading" ? "Exporting…" : "Export"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-sand-900 text-white text-xs font-medium shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isThinking ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-light to-warm-200 flex items-center justify-center mb-6"
            >
              <Sparkles className="w-8 h-8 text-accent" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-2xl font-bold text-sand-900 mb-3"
            >
              What&apos;s on your mind?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sand-500 text-center max-w-md leading-relaxed mb-8"
            >
              Describe a challenge you&apos;re facing. I&apos;ll find insights
              from 300+ Lenny&apos;s Podcast episodes to guide you.
            </motion.p>

            {/* Topic suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2 max-w-lg"
            >
              {TOPIC_SUGGESTIONS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleSendMessage(topic)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-sand-200 bg-white text-sm text-sand-600 hover:border-accent/40 hover:text-accent hover:bg-accent-light/50 transition-all cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {topic}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                if (msg.role === "user") {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-sand-900 text-white px-5 py-3.5">
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnswerCard
                      content={msg.content}
                      citations={msg.citations}
                      isStreaming={isStreaming && idx === messages.length - 1}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Thinking indicator */}
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ThinkingIndicator step={thinkingStep} />
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-sand-200 bg-sand-50/80 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <SearchInput
            onSubmit={handleSendMessage}
            disabled={isStreaming || isThinking}
          />
          <p className="text-xs text-sand-400 text-center mt-2">
            Answers are grounded in Lenny&apos;s Podcast transcripts. Always
            verify important decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
