'use client';

import React from 'react';
import { Play, Pause, Bookmark, Calendar, Clock } from 'lucide-react';
import { Chapter } from './ChapterList';

export interface EpisodeItem {
  id: string;
  title: string;
  description: string;
  episodeNumber?: number;
  durationSeconds: number;
  publishedAt: string;
  chapters?: Chapter[];
}

interface EpisodeCardProps {
  episode: EpisodeItem;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (ep: EpisodeItem) => void;
  onTogglePlay: () => void;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  isCurrent,
  isPlaying,
  onPlay,
  onTogglePlay
}) => {
  const formatDuration = (seconds: number) => {
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isCurrent
          ? 'bg-purple-950/20 border-purple-500/50 shadow-lg shadow-purple-950/20'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            {episode.episodeNumber && (
              <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-semibold">
                EP {episode.episodeNumber}
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(episode.publishedAt)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(episode.durationSeconds)}</span>
            </span>
          </div>

          <h3 className={`text-sm font-bold truncate ${isCurrent ? 'text-purple-400' : 'text-white'}`}>
            {episode.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{episode.description}</p>

          {episode.chapters && episode.chapters.length > 0 && (
            <div className="pt-1 flex items-center space-x-1.5 text-[10px] text-purple-400 font-medium">
              <Bookmark className="w-3 h-3" />
              <span>{episode.chapters.length} chapters available</span>
            </div>
          )}
        </div>

        <button
          onClick={() => (isCurrent ? onTogglePlay() : onPlay(episode))}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition shadow-md ${
            isCurrent && isPlaying
              ? 'bg-purple-600 text-white shadow-purple-600/30'
              : 'bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white'
          }`}
          title={isCurrent && isPlaying ? 'Pause episode' : 'Play episode'}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
