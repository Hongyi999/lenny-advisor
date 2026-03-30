import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ChatView from "@/components/ChatView";
import type { Citation } from "@/lib/rag";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, title")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!conversation) return notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, content, citations, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const formattedMessages = (messages || []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    citations: (m.citations || []) as Citation[],
  }));

  return (
    <Suspense>
      <ChatView
        conversationId={id}
        initialMessages={formattedMessages}
      />
    </Suspense>
  );
}
