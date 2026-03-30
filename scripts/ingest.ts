/**
 * Data ingestion script: parses Lenny podcast transcripts, chunks them
 * by timestamp boundaries, generates embeddings via Zhipu, and stores
 * in Supabase pgvector.
 *
 * Usage: npx tsx scripts/ingest.ts
 *
 * Requires .env.local with ZHIPU_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
 * and SUPABASE_SERVICE_ROLE_KEY.
 */

import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

const ZHIPU_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const TRANSCRIPTS_DIR = path.resolve(
  __dirname,
  "../../lennys-podcast-transcripts-main/episodes"
);
const BATCH_SIZE = 8;
const CHUNK_TARGET_TOKENS = 400;
const DELAY_MS = 500;

// Load env from .env.local
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

interface TranscriptChunk {
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
}

interface ParsedSegment {
  speaker: string;
  timestamp: string;
  timestamp_seconds: number;
  text: string;
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function roughTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

function parseTranscriptBody(body: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const lines = body.split("\n");

  // Match: "Speaker Name (HH:MM:SS):" or "Speaker Name (MM:SS):" or "(MM:SS):"
  const speakerLineRegex = /^(?:([^(]+?)\s*)?\((\d{1,2}(?::\d{2}){1,2})\)\s*:?\s*(.*)/;
  let currentSpeaker = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ")) continue;

    const match = trimmed.match(speakerLineRegex);
    if (match) {
      const speaker = match[1]?.trim() || currentSpeaker;
      const timestamp = match[2];
      const text = match[3]?.trim() || "";
      currentSpeaker = speaker;

      segments.push({
        speaker,
        timestamp,
        timestamp_seconds: parseTimestamp(timestamp),
        text,
      });
    } else if (segments.length > 0) {
      segments[segments.length - 1].text += " " + trimmed;
    }
  }

  return segments;
}

function chunkSegments(
  segments: ParsedSegment[],
  meta: {
    episode_slug: string;
    guest: string;
    title: string;
    youtube_url: string | null;
    video_id: string | null;
    publish_date: string | null;
    keywords: string[];
  }
): TranscriptChunk[] {
  const chunks: TranscriptChunk[] = [];
  let currentChunk: ParsedSegment[] = [];
  let currentTokens = 0;

  for (const seg of segments) {
    const segTokens = roughTokenCount(seg.text);
    if (currentTokens + segTokens > CHUNK_TARGET_TOKENS && currentChunk.length > 0) {
      chunks.push({
        ...meta,
        timestamp_start: currentChunk[0].timestamp,
        timestamp_seconds: currentChunk[0].timestamp_seconds,
        speaker: currentChunk[0].speaker,
        content: currentChunk.map((s) => `${s.speaker} (${s.timestamp}): ${s.text}`).join("\n\n"),
      });
      currentChunk = [];
      currentTokens = 0;
    }
    currentChunk.push(seg);
    currentTokens += segTokens;
  }

  if (currentChunk.length > 0) {
    chunks.push({
      ...meta,
      timestamp_start: currentChunk[0].timestamp,
      timestamp_seconds: currentChunk[0].timestamp_seconds,
      speaker: currentChunk[0].speaker,
      content: currentChunk.map((s) => `${s.speaker} (${s.timestamp}): ${s.text}`).join("\n\n"),
    });
  }

  return chunks;
}

async function generateEmbeddingBatch(texts: string[]): Promise<number[][]> {
  const response = await fetch(`${ZHIPU_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
    },
    body: JSON.stringify({
      model: "embedding-3",
      input: texts,
      dimensions: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.data.sort((a: any, b: any) => a.index - b.index).map((d: any) => d.embedding);
}

async function insertChunks(
  supabaseUrl: string,
  serviceKey: string,
  chunks: (TranscriptChunk & { embedding: number[] })[]
) {
  const response = await fetch(`${supabaseUrl}/rest/v1/transcript_chunks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(
      chunks.map((c) => ({
        episode_slug: c.episode_slug,
        guest: c.guest,
        title: c.title,
        youtube_url: c.youtube_url,
        video_id: c.video_id,
        publish_date: c.publish_date,
        timestamp_start: c.timestamp_start,
        timestamp_seconds: c.timestamp_seconds,
        speaker: c.speaker,
        content: c.content,
        keywords: c.keywords,
        embedding: JSON.stringify(c.embedding),
      }))
    ),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase insert error: ${response.status} ${err}`);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const zhipuKey = process.env.ZHIPU_API_KEY;

  if (!supabaseUrl || !serviceKey || !zhipuKey) {
    console.error("Missing required environment variables. Check .env.local");
    process.exit(1);
  }

  const episodeDirs = fs
    .readdirSync(TRANSCRIPTS_DIR)
    .filter((d) => fs.statSync(path.join(TRANSCRIPTS_DIR, d)).isDirectory());

  console.log(`Found ${episodeDirs.length} episodes to process`);

  let totalChunks = 0;
  let processedEpisodes = 0;

  for (const slug of episodeDirs) {
    const transcriptPath = path.join(TRANSCRIPTS_DIR, slug, "transcript.md");
    if (!fs.existsSync(transcriptPath)) {
      console.log(`  Skipping ${slug}: no transcript.md`);
      continue;
    }

    const raw = fs.readFileSync(transcriptPath, "utf-8");
    const { data: frontmatter, content: body } = matter(raw);

    const segments = parseTranscriptBody(body);
    if (segments.length === 0) {
      console.log(`  Skipping ${slug}: no parseable segments`);
      continue;
    }

    const chunks = chunkSegments(segments, {
      episode_slug: slug,
      guest: frontmatter.guest || slug,
      title: frontmatter.title || slug,
      youtube_url: frontmatter.youtube_url || null,
      video_id: frontmatter.video_id || null,
      publish_date: frontmatter.publish_date || null,
      keywords: frontmatter.keywords || [],
    });

    // Process in batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((c) => c.content);

      try {
        const embeddings = await generateEmbeddingBatch(texts);
        const withEmbeddings = batch.map((c, idx) => ({
          ...c,
          embedding: embeddings[idx],
        }));
        await insertChunks(supabaseUrl, serviceKey, withEmbeddings);
        totalChunks += batch.length;
      } catch (err) {
        console.error(`  Error processing batch for ${slug}:`, err);
        await sleep(2000);
        continue;
      }

      await sleep(DELAY_MS);
    }

    processedEpisodes++;
    if (processedEpisodes % 10 === 0) {
      console.log(`  Processed ${processedEpisodes}/${episodeDirs.length} episodes, ${totalChunks} chunks total`);
    }
  }

  console.log(`\nDone! Processed ${processedEpisodes} episodes, ${totalChunks} chunks total`);
}

main().catch(console.error);
