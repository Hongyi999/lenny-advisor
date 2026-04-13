"use client";

import Image from "next/image";
import { CirclePlay, Download } from "lucide-react";
import { youtubeTimestampUrl, formatTimestamp } from "@/lib/utils";
import type { Citation } from "@/lib/rag";

interface CitationCardProps {
  citation: Citation;
  index: number;
}

export default function CitationCard({ citation, index }: CitationCardProps) {
  const youtubeUrl =
    citation.video_id
      ? youtubeTimestampUrl(citation.video_id, citation.timestamp_seconds)
      : citation.youtube_url;

  const thumbnailUrl = citation.video_id
    ? `https://img.youtube.com/vi/${citation.video_id}/mqdefault.jpg`
    : null;

  return (
    <div className="rounded-xl border border-sand-200 bg-white overflow-hidden transition-all hover:border-accent/30 hover:shadow-sm">
      {/* YouTube thumbnail */}
      {thumbnailUrl && youtubeUrl && (
        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
          <div className="aspect-video bg-sand-100">
            <Image
              src={thumbnailUrl}
              alt={citation.title}
              width={320}
              height={180}
              sizes="(max-width: 640px) 100vw, 280px"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white ml-0.5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
            {formatTimestamp(citation.timestamp_seconds)}
          </span>
        </a>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 w-6 h-6 rounded-lg bg-accent-light text-accent text-xs font-semibold flex items-center justify-center">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-sand-900 truncate">
              {citation.guest}
            </h4>
          </div>
          {!thumbnailUrl && (
            <span className="shrink-0 text-xs text-sand-500 font-mono">
              {formatTimestamp(citation.timestamp_seconds)}
            </span>
          )}
        </div>

        <p className="text-xs text-sand-600 mb-3 line-clamp-2 leading-relaxed">
          {citation.title}
        </p>

        <div className="flex items-center gap-2">
          {youtubeUrl && !thumbnailUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              <CirclePlay className="w-3.5 h-3.5" />
              Watch
            </a>
          )}

          <a
            href={`/api/transcript/${citation.episode_slug}`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sand-100 text-sand-700 hover:bg-sand-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Transcript
          </a>
        </div>
      </div>
    </div>
  );
}
