'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Volume2, VolumeX, Music2 } from 'lucide-react';

interface Props {
  reels: any[];
}

export function ReelsView({ reels }: Props) {
  const [isMuted, setIsMuted] = useState(true);

  if (reels.length === 0) {
    return (
      <div className="py-20 text-center text-xs text-gray-400">
        No reels available right now. Check back soon!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-sm mx-auto">
      {reels.map((reel) => (
        <div
          key={reel.id}
          className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
        >
          {/* Video Player */}
          <video
            src={reel.videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-xs cursor-pointer z-10"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Right Action Rail */}
          <div className="absolute right-3 bottom-16 flex flex-col items-center gap-5 text-white z-10">
            <button className="flex flex-col items-center gap-1 cursor-pointer">
              <Heart className="w-7 h-7 hover:scale-110 transition" />
              <span className="text-[11px] font-semibold">{reel.likesCount || 0}</span>
            </button>
            <button className="flex flex-col items-center gap-1 cursor-pointer">
              <MessageCircle className="w-7 h-7 hover:scale-110 transition" />
              <span className="text-[11px] font-semibold">24</span>
            </button>
            <button className="cursor-pointer">
              <Send className="w-6 h-6 -rotate-12 hover:scale-110 transition" />
            </button>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-rose-500 border border-white flex items-center justify-center font-bold text-xs">
                {reel.author?.username?.charAt(0) || 'U'}
              </div>
              <span className="font-bold text-xs">@{reel.author?.username}</span>
            </div>
            <p className="text-xs line-clamp-2 leading-relaxed mb-2">{reel.caption}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-white/80">
              <Music2 className="w-3.5 h-3.5" />
              <span>{reel.audioTrack}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
