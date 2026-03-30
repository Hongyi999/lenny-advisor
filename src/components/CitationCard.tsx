"use client";

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

  return (
    <div className="rounded-xl border border-sand-200 bg-white p-4 transition-all hover:border-accent/30 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded-lg bg-accent-light text-accent text-xs font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <h4 className="text-sm font-semibold text-sand-900 truncate">
            {citation.guest}
          </h4>
        </div>
        <span className="shrink-0 text-xs text-sand-500 font-mono">
          {formatTimestamp(citation.timestamp_seconds)}
        </span>
      </div>

      <p className="text-xs text-sand-600 mb-3 line-clamp-2 leading-relaxed">
        {citation.title}
      </p>

      <div className="flex items-center gap-2">
        {youtubeUrl && (
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
  );
}
