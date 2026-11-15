'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  FastForward,
  Bookmark
} from 'lucide-react';
import { Chapter } from './ChapterList';

export interface ActiveEpisode {
  id: string;
  title: string;
  podcastTitle: string;
  durationSeconds: number;
  chapters?: Chapter[];
}

interface EpisodePlayerProps {
  episode: ActiveEpisode | null;
  isPlaying: boolean;
  currentTime: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
}

export const EpisodePlayer: React.FC<EpisodePlayerProps> = ({
  episode,
  isPlaying,
  currentTime,
  onTogglePlay,
  onSeek
}) => {
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);

  if (!episode) return null;

  const duration = episode.durationSeconds || 1800;
  const progressPercent = (currentTime / duration) * 100;

  const formatTime = (seconds: number) => {
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleSkip = (seconds: number) => {
    const target = Math.max(0, Math.min(currentTime + seconds, duration));
    onSeek(target);
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    setSpeed(speeds[nextIdx]);
  };

  // Find active chapter
  const currentChapter = episode.chapters?.find(
    (ch) =>
      currentTime >= ch.startTimeSeconds &&
      (ch.endTimeSeconds ? currentTime < ch.endTimeSeconds : true)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Episode Info & Active Chapter */}
        <div className="flex items-center space-x-3 w-full md:w-1/4 truncate">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Bookmark className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-white truncate">{episode.title}</h4>
            <p className="text-[10px] text-purple-400 font-medium truncate">
              {currentChapter ? currentChapter.title : episode.podcastTitle}
            </p>
          </div>
        </div>

        {/* Center Controls & Scrubber */}
        <div className="flex-1 max-w-xl w-full space-y-1.5">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleSkip(-15)}
              className="p-1.5 text-slate-400 hover:text-white transition flex items-center text-[10px] space-x-0.5"
              title="Skip back 15s"
            >
              <RotateCcw className="w-4 h-4" />
              <span>15</span>
            </button>

            <button
              onClick={onTogglePlay}
              className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/30"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => handleSkip(30)}
              className="p-1.5 text-slate-400 hover:text-white transition flex items-center text-[10px] space-x-0.5"
              title="Skip forward 30s"
            >
              <RotateCw className="w-4 h-4" />
              <span>30</span>
            </button>
          </div>

          {/* Progress bar with chapter ticks */}
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono text-slate-400 w-12 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              className="relative flex-1 h-2 bg-slate-800 rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                onSeek(pos * duration);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Chapter tick marks on scrubber */}
              {episode.chapters?.map((ch) => {
                const tickPercent = (ch.startTimeSeconds / duration) * 100;
                return (
                  <div
                    key={ch.id}
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 pointer-events-none"
                    style={{ left: `${tickPercent}%` }}
                    title={ch.title}
                  />
                );
              })}
            </div>

            <span className="text-[10px] font-mono text-slate-400 w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Speed & Audio Actions */}
        <div className="flex items-center space-x-3 w-full md:w-1/4 justify-end">
          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition"
            title="Playback speed"
          >
            {speed}x
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-slate-400 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
