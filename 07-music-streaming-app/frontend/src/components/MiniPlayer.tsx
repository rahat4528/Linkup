'use client';

import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Music } from 'lucide-react';
import { CanvasWaveform } from './CanvasWaveform';
import { TrackItem } from '../hooks/useAudioPlayer';

interface MiniPlayerProps {
  currentTrack: TrackItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onNext,
  onPrev
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentTrack) {
    return null;
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isExpanded
          ? 'bottom-4 right-4 left-4 md:left-auto md:w-[480px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-5'
          : 'bottom-4 right-4 w-[340px] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg p-3'
      }`}
    >
      {/* Header / Collapse Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Music className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-100 truncate">{currentTrack.title}</h4>
            <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Waveform scrubbing bar */}
      <div className="my-2">
        <CanvasWaveform
          waveformData={currentTrack.waveformData}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          height={isExpanded ? 48 : 28}
          barWidth={isExpanded ? 3 : 2}
          barGap={isExpanded ? 2 : 1}
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center space-x-1">
          {onPrev && (
            <button onClick={onPrev} className="p-1.5 text-slate-300 hover:text-white transition">
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onTogglePlay}
            className="p-2 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {onNext && (
            <button onClick={onNext} className="p-1.5 text-slate-300 hover:text-white transition">
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Volume slider (expanded view) */}
        {isExpanded ? (
          <div className="flex items-center space-x-2">
            <button onClick={onToggleMute} className="text-slate-400 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        ) : (
          <button onClick={onToggleMute} className="p-1 text-slate-400 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};
