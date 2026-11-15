'use client';

import React from 'react';
import { Play, Pause, Heart, Radio } from 'lucide-react';
import { TrackItem } from '../hooks/useAudioPlayer';

interface TrackCardProps {
  track: TrackItem & { genre?: string; album?: string; isFavorited?: boolean };
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (track: TrackItem) => void;
  onTogglePlay: () => void;
  onToggleFavorite?: (trackId: string) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isCurrent,
  isPlaying,
  onPlay,
  onTogglePlay,
  onToggleFavorite
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayClick = () => {
    if (isCurrent) {
      onTogglePlay();
    } else {
      onPlay(track);
    }
  };

  return (
    <div
      className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
        isCurrent
          ? 'bg-slate-800/80 border-sky-500/50 shadow-lg shadow-sky-950/30'
          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center space-x-4 min-w-0">
        {/* Play / Status button */}
        <button
          onClick={handlePlayClick}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition shrink-0 ${
            isCurrent && isPlaying
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'bg-slate-800 text-slate-300 group-hover:bg-sky-600 group-hover:text-white'
          }`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Track details */}
        <div className="truncate">
          <div className="flex items-center space-x-2">
            <h3 className={`text-sm font-medium truncate ${isCurrent ? 'text-sky-400' : 'text-slate-100'}`}>
              {track.title}
            </h3>
            {track.genre && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                {track.genre}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {track.artist} {track.album ? `• ${track.album}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0 ml-4">
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(track.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition"
          >
            <Heart className={`w-4 h-4 ${track.isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        )}

        <span className="text-xs text-slate-400 font-mono">{formatTime(track.durationSeconds)}</span>
      </div>
    </div>
  );
};
