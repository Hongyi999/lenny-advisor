import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatTimestamp, youtubeTimestampUrl } from "@/lib/utils";
import type { Citation } from "@/lib/rag";

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\-_ ]/gi, "")
    .replace(/\s+/g, "-")
    .slice(0, 60)
    .toLowerCase() || "lenny-advisor-answer";
}

function buildConversationMarkdown(params: {
  title: string;
  createdAt: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
  }>;
}): string {
  const { title, createdAt, messages } = params;
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const parts: string[] = [];
  parts.push(`# ${title}`);
  parts.push(`*Lenny Advisor · ${date}*`);
  parts.push("");

  for (const msg of messages) {
    if (msg.role === "user") {
      parts.push(`## You`);
      parts.push(msg.content);
      parts.push("");
    } else {
      parts.push(`## Lenny Advisor`);
      parts.push(msg.content);
      parts.push("");

      if (msg.citations && msg.citations.length > 0) {
        parts.push(`### Sources`);
        msg.citations.forEach((c, i) => {
          const url = c.video_id
            ? youtubeTimestampUrl(c.video_id, c.timestamp_seconds)
            : c.youtube_url;
          const timestamp = formatTimestamp(c.timestamp_seconds);
          if (url) {
            parts.push(
              `${i + 1}. [${c.guest} — "${c.title}" at ${timestamp}](${url})`
            );
          } else {
            parts.push(`${i + 1}. ${c.guest} — "${c.title}" at ${timestamp}`);
          }
        });
        parts.push("");
      }
    }
  }

  return parts.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const format = body.format === "txt" ? "txt" : "md";

    // Mode 1: Export a single answer (legacy behavior)
    if (body.content && typeof body.content === "string") {
      const mime =
        format === "md"
          ? "text/markdown; charset=utf-8"
          : "text/plain; charset=utf-8";
      const filename = `lenny-advisor-answer.${format}`;
      return new NextResponse(body.content, {
        headers: {
          "Content-Type": mime,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Mode 2: Export a full conversation
    if (!body.conversationId || typeof body.conversationId !== "string") {
      return NextResponse.json(
        { error: "content or conversationId is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, title, created_at")
      .eq("id", body.conversationId)
      .eq("user_id", user.id)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const { data: messages } = await supabase
      .from("messages")
      .select("role, content, citations")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    const markdown = buildConversationMarkdown({
      title: conversation.title,
      createdAt: conversation.created_at,
      messages: (messages || []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content as string,
        citations: (m.citations || []) as Citation[],
      })),
    });

    const mime =
      format === "md"
        ? "text/markdown; charset=utf-8"
        : "text/plain; charset=utf-8";
    const filename = `${sanitizeFilename(conversation.title)}.${format}`;
    return new NextResponse(markdown, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
