'use client';

import React from 'react';
import { TrendingUp, Heart, MessageCircle } from 'lucide-react';

interface Props {
  explore: any[];
  trendingTags: any[];
  onSelectTag: (tag: string) => void;
}

export function ExploreView({ explore, trendingTags, onSelectTag }: Props) {
  return (
    <div className="pb-20">
      {/* Trending Hashtags */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-2.5">
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <span>Trending Hashtags</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {trendingTags.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTag(t.tag)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-800 shrink-0 transition cursor-pointer"
            >
              #{t.tag} <span className="text-[10px] text-gray-500">({t.postsCount})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Explore Grid */}
      <div className="grid grid-cols-3 gap-1">
        {explore.map((post) => (
          <div
            key={post.id}
            className="aspect-square bg-gray-100 relative group overflow-hidden cursor-pointer"
          >
            <img
              src={post.media?.[0]?.url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500'}
              alt={post.caption || 'Explore post'}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 fill-white" />
                {post.likesCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4 fill-white" />
                {post.commentsCount || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
