'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic
} from 'lucide-react';
import { Track } from '../services/api';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: 'OFF' | 'ALL' | 'ONE';
  currentTime: number;
  duration: number;
  volume: number;
  isLiked: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleLike: () => void;
  onToggleQueueDrawer: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  isShuffled,
  repeatMode,
  currentTime,
  duration,
  volume,
  isLiked,
  onTogglePlay,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  onSeek,
  onVolumeChange,
  onToggleLike,
  onToggleQueueDrawer
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-50 select-none">
      {/* Left: Now Playing Info */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 rounded bg-[#282828] flex-shrink-0 flex items-center justify-center font-bold text-white text-base overflow-hidden">
              {currentTrack.coverUrl ? (
                <img src={currentTrack.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                '♪'
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </span>
              <span className="text-xs text-[#b3b3b3] truncate hover:underline cursor-pointer">
                {currentTrack.artistName || 'Unknown Artist'}
              </span>
            </div>
            <button
              onClick={onToggleLike}
              className="p-2 text-[#b3b3b3] hover:text-white transition ml-1"
            >
              <Heart
                className={`w-5 h-5 ${isLiked ? 'fill-[#1db954] text-[#1db954]' : ''}`}
              />
            </button>
          </>
        ) : (
          <div className="text-xs text-[#b3b3b3]">No track playing</div>
        )}
      </div>

      {/* Center: Playback Controls & Progress Bar */}
      <div className="flex flex-col items-center max-w-2xl w-2/4">
        {/* Buttons */}
        <div className="flex items-center gap-5 mb-1.5">
          {/* Shuffle */}
          <button
            onClick={onToggleShuffle}
            className={`transition ${isShuffled ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            onClick={onPrevious}
            className="text-[#b3b3b3] hover:text-white transition"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={onTogglePlay}
            disabled={!currentTrack}
            className="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition shadow-md disabled:opacity-50"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            className="text-[#b3b3b3] hover:text-white transition"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={onToggleRepeat}
            className={`transition ${repeatMode !== 'OFF' ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'}`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'ONE' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2.5 w-full text-[11px] text-[#b3b3b3]">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="flex-1 h-1 bg-[#4d4d4d] rounded-lg cursor-pointer"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Queue Toggle */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px] text-[#b3b3b3]">
        <button
          onClick={onToggleQueueDrawer}
          className="hover:text-white transition"
          title="Queue"
        >
          <ListMusic className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-24 h-1 bg-[#4d4d4d] rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </footer>
  );
};
