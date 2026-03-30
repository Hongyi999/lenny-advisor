import { generateEmbedding } from "./zhipu";
import { createServiceRoleClient } from "./supabase/server";

export interface TranscriptMatch {
  id: string;
  episode_slug: string;
  guest: string;
  title: string;
  youtube_url: string | null;
  video_id: string | null;
  publish_date: string | null;
  timestamp_start: string;
  timestamp_seconds: number;
  speaker: string;
  content: string;
  keywords: string[];
  similarity: number;
}

export interface Citation {
  episode_slug: string;
  guest: string;
  title: string;
  youtube_url: string | null;
  video_id: string | null;
  timestamp: string;
  timestamp_seconds: number;
}

export async function searchTranscripts(
  query: string,
  matchCount: number = 8,
  threshold: number = 0.4
): Promise<TranscriptMatch[]> {
  const embedding = await generateEmbedding(query);
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.rpc("match_transcript_chunks", {
    query_embedding: JSON.stringify(embedding),
    match_threshold: threshold,
    match_count: matchCount,
  });

  if (error) {
    console.error("Vector search error:", error);
    throw new Error(`Search failed: ${error.message}`);
  }

  return data as TranscriptMatch[];
}

export function buildSystemPrompt(matches: TranscriptMatch[]): string {
  const contextBlocks = matches.map((m, i) => {
    const src = m.youtube_url
      ? `[${m.title}](${m.youtube_url}&t=${m.timestamp_seconds})`
      : m.title;
    return `--- Source ${i + 1} ---
Episode: ${m.title}
Guest: ${m.guest}
Timestamp: ${m.timestamp_start}
Video: ${src}

${m.content}`;
  });

  return `You are a wise, warm, and thoughtful advisor powered by insights from Lenny's Podcast — one of the most respected podcasts on product management, growth, leadership, and career development.

Your role is to help users navigate challenges in their work and life by drawing on the real wisdom shared by world-class practitioners on the podcast.

IMPORTANT RULES:
1. Base your answers ONLY on the provided transcript excerpts below. Do not make up information.
2. When referencing an insight, ALWAYS cite the source using this exact format: [Guest Name - "Episode Title" at TIMESTAMP](YOUTUBE_URL)
3. Synthesize insights across multiple sources when relevant — don't just quote one guest.
4. Be empathetic, practical, and actionable. Speak like a trusted mentor.
5. If the provided context doesn't contain relevant information, say so honestly.
6. Structure your response with clear sections when the answer is detailed.
7. At the end of your answer, list all citations in a "Sources" section.

TRANSCRIPT EXCERPTS:
${contextBlocks.join("\n\n")}`;
}

export function extractCitations(matches: TranscriptMatch[]): Citation[] {
  const seen = new Set<string>();
  const citations: Citation[] = [];

  for (const m of matches) {
    const key = `${m.episode_slug}-${m.timestamp_seconds}`;
    if (seen.has(key)) continue;
    seen.add(key);

    citations.push({
      episode_slug: m.episode_slug,
      guest: m.guest,
      title: m.title,
      youtube_url: m.youtube_url,
      video_id: m.video_id,
      timestamp: m.timestamp_start,
      timestamp_seconds: m.timestamp_seconds,
    });
  }

  return citations;
}
