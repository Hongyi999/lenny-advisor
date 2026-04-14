import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import AnswerCard from "@/components/AnswerCard";
import type { Citation } from "@/lib/rag";
import { ArrowLeft, Share2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedConversationPage({ params }: PageProps) {
  const { token } = await params;

  // Use service-role client so we can bypass RLS for the public read
  // (RLS would also allow this, but service-role is simpler here)
  const supabase = createServiceRoleClient();

  const { data: share } = await supabase
    .from("shared_conversations")
    .select("conversation_id, created_at")
    .eq("token", token)
    .single();

  if (!share) return notFound();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, title, created_at")
    .eq("id", share.conversation_id)
    .single();

  if (!conversation) return notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, content, citations, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  type RawMessage = {
    id: string;
    role: string;
    content: string;
    citations: Citation[] | null;
    created_at: string;
  };
  const formattedMessages = ((messages || []) as RawMessage[]).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    citations: (m.citations || []) as Citation[],
  }));

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="border-b border-[#e8e0d0] bg-[#faf9f6]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#6b6b66] hover:text-[#1a1a1a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-serif text-base text-[#1a1a1a]">
              Lenny Advisor
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8e3d9] text-[#6b6b66] text-xs">
            <Share2 className="w-3 h-3" />
            Shared conversation
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-serif text-2xl sm:text-3xl text-[#1a1a1a] mb-2 leading-tight">
          {conversation.title}
        </h1>
        <p className="text-sm text-[#9a9a94] mb-8">
          {new Date(conversation.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="space-y-6">
          {formattedMessages.map((msg) => {
            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[#1a1a1a] text-white px-5 py-3.5">
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            }
            return (
              <AnswerCard
                key={msg.id}
                content={msg.content}
                citations={msg.citations}
                isStreaming={false}
              />
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#333] transition-colors"
          >
            Ask your own question
          </Link>
        </div>
      </main>
    </div>
  );
}
