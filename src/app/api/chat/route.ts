import { NextRequest, NextResponse } from "next/server";
import { searchTranscripts, buildSystemPrompt, extractCitations } from "@/lib/rag";
import { chatCompletionStream } from "@/lib/zhipu";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Search relevant transcript chunks
    const matches = await searchTranscripts(message, 8, 0.35);
    const citations = extractCitations(matches);
    const systemPrompt = buildSystemPrompt(matches);

    // Get conversation history if exists
    let history: { role: string; content: string }[] = [];
    let activeConversationId = conversationId;

    if (activeConversationId) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true })
        .limit(10);

      if (msgs) {
        history = msgs.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      }
    } else {
      // Create new conversation
      const title =
        message.length > 60 ? message.slice(0, 57) + "..." : message;
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();

      if (convErr) {
        console.error("Conversation creation error:", convErr);
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
      }
      activeConversationId = conv.id;
    }

    // Save user message
    await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: message,
    });

    // Build messages for LLM
    const llmMessages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map((h) => ({
        role: h.role as "system" | "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Stream the response
    const zhipuStream = await chatCompletionStream(llmMessages, {
      temperature: 0.4,
      maxTokens: 2048,
    });

    let fullResponse = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const outputStream = new ReadableStream({
      async start(controller) {
        // Send conversation ID and citations first
        const meta = JSON.stringify({
          type: "meta",
          conversationId: activeConversationId,
          citations,
        });
        controller.enqueue(encoder.encode(`data: ${meta}\n\n`));

        const reader = zhipuStream.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  const chunk = JSON.stringify({ type: "content", content });
                  controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
                }
              } catch {
                // Skip unparseable lines
              }
            }
          }
        } catch (err) {
          console.error("Stream processing error:", err);
        }

        // Save assistant message
        await supabase.from("messages").insert({
          conversation_id: activeConversationId,
          role: "assistant",
          content: fullResponse,
          citations,
        });

        // Update conversation timestamp
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", activeConversationId);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(outputStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
