'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Rss, Check, Heart } from 'lucide-react';

export interface PodcastItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  coverUrl: string;
  category: string;
  isSubscribed?: boolean;
}

interface PodcastCardProps {
  podcast: PodcastItem;
  onToggleSubscribe?: (id: string) => void;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onToggleSubscribe }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rssUrl = `${window.location.origin}/api/podcasts/${podcast.id}/feed.xml`;
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-200 shadow-xl flex flex-col">
      <Link href={`/podcast/${podcast.slug || podcast.id}`}>
        <div className="aspect-square relative overflow-hidden bg-slate-950">
          <img
            src={podcast.coverUrl}
            alt={podcast.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur text-[10px] font-semibold text-purple-300 border border-purple-500/30">
              {podcast.category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link href={`/podcast/${podcast.slug || podcast.id}`}>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition truncate">
              {podcast.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{podcast.author}</p>
          <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {podcast.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={handleCopyRss}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-medium flex items-center space-x-1.5 transition border border-slate-700"
            title="Copy RSS feed link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Rss className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copied' : 'RSS Feed'}</span>
          </button>

          {onToggleSubscribe && (
            <button
              onClick={() => onToggleSubscribe(podcast.id)}
              className={`p-1.5 rounded-lg border transition ${
                podcast.isSubscribed
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Subscribe"
            >
              <Heart className={`w-4 h-4 ${podcast.isSubscribed ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
