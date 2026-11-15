'use client';

import React from 'react';
import { Play, Pause, Heart, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { Track } from '../services/api';

interface TrackTableProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying?: boolean;
  isPlaylistView?: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike?: (trackId: string) => void;
  onReorder?: (sourceIndex: number, targetIndex: number) => void;
}

export const TrackTable: React.FC<TrackTableProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  isPlaylistView,
  onPlayTrack,
  onToggleLike,
  onReorder
}) => {
  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full text-left text-sm select-none">
      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_1fr_120px] px-4 py-2 border-b border-[#282828] text-xs font-semibold text-[#b3b3b3]">
        <span>#</span>
        <span>Title</span>
        <span>Album</span>
        <div className="flex items-center justify-end pr-4">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#282828]/30">
        {tracks.map((track, index) => {
          const isCurrent = track.id === currentTrackId;

          return (
            <div
              key={track.id}
              className={`grid grid-cols-[40px_1fr_1fr_120px] items-center px-4 py-2.5 rounded-lg group transition ${
                isCurrent ? 'bg-[#282828]/60 text-[#1db954]' : 'hover:bg-[#282828]/40 text-[#b3b3b3]'
              }`}
            >
              {/* Position / Play Icon */}
              <div className="flex items-center text-xs">
                <button
                  onClick={() => onPlayTrack(track)}
                  className="w-5 h-5 flex items-center justify-center group-hover:text-white"
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <span className="group-hover:hidden">{index + 1}</span>
                  )}
                  {(!isCurrent || !isPlaying) && (
                    <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block" />
                  )}
                </button>
              </div>

              {/* Title & Artist */}
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-10 h-10 rounded bg-[#282828] flex-shrink-0 flex items-center justify-center font-bold text-white text-xs">
                  ♪
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm truncate font-medium ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                    {track.title}
                  </span>
                  <span className="text-xs text-[#b3b3b3] truncate hover:underline cursor-pointer">
                    {track.artistName || 'Unknown Artist'}
                  </span>
                </div>
              </div>

              {/* Album Title */}
              <div className="truncate text-xs hover:underline cursor-pointer pr-4">
                {track.albumTitle || 'Single'}
              </div>

              {/* Duration & Reorder actions */}
              <div className="flex items-center justify-end gap-3 text-xs pr-2">
                {isPlaylistView && onReorder && (
                  <div className="hidden group-hover:flex items-center gap-1 text-[#b3b3b3]">
                    <button
                      onClick={() => onReorder(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="p-1 hover:text-white disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onReorder(index, Math.min(tracks.length - 1, index + 1))}
                      disabled={index === tracks.length - 1}
                      className="p-1 hover:text-white disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <span>{formatDuration(track.durationMs)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
