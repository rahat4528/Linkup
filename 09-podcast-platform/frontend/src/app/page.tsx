'use client';

import React, { useState } from 'react';
import { Mic, Search, Radio, Sparkles, Plus, Rss } from 'lucide-react';
import { PodcastCard, PodcastItem } from '../components/PodcastCard';
import { EpisodePlayer, ActiveEpisode } from '../components/EpisodePlayer';

const samplePodcasts: PodcastItem[] = [
  {
    id: 'pod-arch-tomorrow',
    title: 'Architectures of Tomorrow',
    slug: 'architectures-of-tomorrow',
    description: 'Deep dives into distributed systems, real-time protocols, and engineering scale.',
    author: 'Elena Rostova',
    coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&fit=crop',
    category: 'Technology',
    isSubscribed: true
  },
  {
    id: 'pod-synthetic-mind',
    title: 'The Synthetic Mind',
    slug: 'the-synthetic-mind',
    description: 'Explorations in autonomous agents, neural architectures, and computational creativity.',
    author: 'Dr. Marcus Vance',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&fit=crop',
    category: 'Science',
    isSubscribed: false
  },
  {
    id: 'pod-foundry-scale',
    title: 'Foundry to Scale',
    slug: 'foundry-to-scale',
    description: 'Interviews with technical founders bootstrapping infrastructure and developer tooling.',
    author: 'Aria Lin',
    coverUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&fit=crop',
    category: 'Business',
    isSubscribed: false
  }
];

export default function PodcastHomePage() {
  const [podcasts, setPodcasts] = useState(samplePodcasts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Audio player state
  const [currentEpisode, setCurrentEpisode] = useState<ActiveEpisode | null>({
    id: 'ep-webrtc-media',
    title: 'Episode 1: The Evolution of WebRTC & Realtime Media',
    podcastTitle: 'Architectures of Tomorrow',
    durationSeconds: 2740.0,
    chapters: [
      { id: '1', title: 'Introduction & State of Realtime', startTimeSeconds: 0, endTimeSeconds: 320 },
      { id: '2', title: 'Signaling and ICE Trickle Mechanics', startTimeSeconds: 320, endTimeSeconds: 1140 },
      { id: '3', title: 'Selective Forwarding Units (SFU) Deep Dive', startTimeSeconds: 1140, endTimeSeconds: 2100 },
      { id: '4', title: 'Future of WebTransport and Media Over QUIC', startTimeSeconds: 2100, endTimeSeconds: 2740 }
    ]
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(150);

  const categories = ['All', 'Technology', 'Science', 'Business'];

  const filteredPodcasts = podcasts.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleToggleSubscribe = (id: string) => {
    setPodcasts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSubscribed: !p.isSubscribed } : p))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">CastFlow</span>
              <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/50 font-mono">
                RSS 2.0 Compliant
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search shows and creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-400 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Independent Audio Creator Platform</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Publish podcasts with compliant RSS feeds and chapter markers.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Distribute episodes with full enclosure metadata, chapter navigation, and secure feed distribution.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/podcast/architectures-of-tomorrow"
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-600/20"
            >
              <Radio className="w-4 h-4" />
              <span>Featured Show</span>
            </a>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white font-semibold shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Podcast Catalog */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Explore Podcasts ({filteredPodcasts.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPodcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                podcast={podcast}
                onToggleSubscribe={handleToggleSubscribe}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Persistent Bottom Episode Player */}
      <EpisodePlayer
        episode={currentEpisode}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSeek={(sec) => setCurrentTime(sec)}
      />
    </div>
  );
}
