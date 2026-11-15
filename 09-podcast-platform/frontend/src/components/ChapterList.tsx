'use client';

import React from 'react';
import { Bookmark, Clock } from 'lucide-react';

export interface Chapter {
  id: string;
  title: string;
  startTimeSeconds: number;
  endTimeSeconds?: number;
}

interface ChapterListProps {
  chapters: Chapter[];
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({ chapters, currentTime, onSeek }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!chapters || chapters.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
        <Bookmark className="w-4 h-4 text-purple-400" />
        <span>Episode Chapters ({chapters.length})</span>
      </div>

      <div className="space-y-1.5">
        {chapters.map((ch, idx) => {
          const isCurrent =
            currentTime >= ch.startTimeSeconds &&
            (ch.endTimeSeconds ? currentTime < ch.endTimeSeconds : true);

          return (
            <button
              key={ch.id || idx}
              onClick={() => onSeek(ch.startTimeSeconds)}
              className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                isCurrent
                  ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300 shadow'
                  : 'bg-slate-950/50 hover:bg-slate-850 text-slate-300 border border-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </span>
                <span className={`font-medium truncate ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                  {ch.title}
                </span>
              </div>

              <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-3 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(ch.startTimeSeconds)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
