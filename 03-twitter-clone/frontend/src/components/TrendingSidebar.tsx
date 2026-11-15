'use client';

import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { TrendingTopic } from '../services/api';

interface TrendingSidebarProps {
  trending: TrendingTopic[];
  onSearch: (q: string) => void;
  onTagClick: (tag: string) => void;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  trending,
  onSearch,
  onTagClick
}) => {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <aside className="w-80 h-screen sticky top-0 px-6 py-3 flex flex-col gap-4 border-l border-[#2f3336]">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#71767b]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search"
          className="w-full bg-[#202327] text-white pl-11 pr-4 py-3 rounded-full text-sm outline-none focus:bg-black focus:ring-1 focus:ring-sky-500 placeholder-[#71767b]"
        />
      </div>

      {/* What's Happening / Trending */}
      <div className="bg-[#16181c] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-white">What's happening</h2>
          <TrendingUp className="w-4 h-4 text-[#71767b]" />
        </div>

        <div className="flex flex-col gap-3 mt-1">
          {trending.length === 0 ? (
            <p className="text-xs text-[#71767b]">No trending topics at the moment.</p>
          ) : (
            trending.slice(0, 5).map((item, index) => (
              <div
                key={item.tag}
                onClick={() => onTagClick(item.tag)}
                className="flex flex-col cursor-pointer hover:opacity-80 transition"
              >
                <div className="flex items-center justify-between text-xs text-[#71767b]">
                  <span>Trending in Technology • #{index + 1}</span>
                </div>
                <span className="font-bold text-sm text-[#e7e9ea]">{item.tag}</span>
                <span className="text-xs text-[#71767b]">{item.count} posts</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Who to follow */}
      <div className="bg-[#16181c] rounded-2xl p-4 flex flex-col gap-3">
        <h2 className="font-extrabold text-lg text-white">Who to follow</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              TS
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-bold text-[#e7e9ea]">TypeScript</span>
              <span className="text-[#71767b]">@typescript</span>
            </div>
          </div>
          <button className="bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-4 py-1.5 rounded-full transition">
            Follow
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-xs">
              NX
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-bold text-[#e7e9ea]">Next.js</span>
              <span className="text-[#71767b]">@nextjs</span>
            </div>
          </div>
          <button className="bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-4 py-1.5 rounded-full transition">
            Follow
          </button>
        </div>
      </div>
    </aside>
  );
};
