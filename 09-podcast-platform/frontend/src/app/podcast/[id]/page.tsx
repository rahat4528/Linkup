'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Rss, Check, Heart, ArrowLeft, Radio } from 'lucide-react';
import { EpisodeCard, EpisodeItem } from '../../../components/EpisodeCard';
import { ChapterList } from '../../../components/ChapterList';
import { EpisodePlayer, ActiveEpisode } from '../../../components/EpisodePlayer';

const samplePodcast = {
  id: 'pod-arch-tomorrow',
  title: 'Architectures of Tomorrow',
  slug: 'architectures-of-tomorrow',
  description: 'Deep dives into distributed systems, real-time protocols, and engineering scale.',
  author: 'Elena Rostova',
  coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&fit=crop',
  category: 'Technology',
  language: 'English',
  websiteUrl: 'https://linkup.local/podcasts/architectures-of-tomorrow',
  episodes: [
    {
      id: 'ep-webrtc-media',
      title: 'Episode 1: The Evolution of WebRTC & Realtime Media',
      description: 'Understanding SFU vs MCU architectures, ICE candidate negotiation, and browser codecs.',
      episodeNumber: 1,
      durationSeconds: 2740.0,
      publishedAt: '2026-03-01T12:00:00Z',
      chapters: [
        { id: '1', title: 'Introduction & State of Realtime', startTimeSeconds: 0, endTimeSeconds: 320 },
        { id: '2', title: 'Signaling and ICE Trickle Mechanics', startTimeSeconds: 320, endTimeSeconds: 1140 },
        { id: '3', title: 'Selective Forwarding Units (SFU) Deep Dive', startTimeSeconds: 1140, endTimeSeconds: 2100 },
        { id: '4', title: 'Future of WebTransport and Media Over QUIC', startTimeSeconds: 2100, endTimeSeconds: 2740 }
      ]
    },
    {
      id: 'ep-event-driven',
      title: 'Episode 2: Scaling Event-Driven Systems with Kafka and BullMQ',
      description: 'Practical patterns for transactional outbox, deduplication, and backpressure handling.',
      episodeNumber: 2,
      durationSeconds: 3120.0,
      publishedAt: '2026-03-08T12:00:00Z',
      chapters: [
        { id: '1', title: 'Outbox Pattern vs Dual Writes', startTimeSeconds: 0, endTimeSeconds: 850 },
        { id: '2', title: 'BullMQ Priority Queues in Node.js', startTimeSeconds: 850, endTimeSeconds: 1980 },
        { id: '3', title: 'Handling Poison Messages and DLQs', startTimeSeconds: 1980, endTimeSeconds: 3120 }
      ]
    }
  ]
};

export default function PodcastShowPage({ params }: { params: { id: string } }) {
  const [copied, setCopied] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true);

  const [activeEpisode, setActiveEpisode] = useState<ActiveEpisode | null>({
    id: samplePodcast.episodes[0].id,
    title: samplePodcast.episodes[0].title,
    podcastTitle: samplePodcast.title,
    durationSeconds: samplePodcast.episodes[0].durationSeconds,
    chapters: samplePodcast.episodes[0].chapters
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handleCopyRss = () => {
    const rssUrl = `${window.location.origin}/api/podcasts/${samplePodcast.id}/feed.xml`;
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayEpisode = (ep: EpisodeItem) => {
    setActiveEpisode({
      id: ep.id,
      title: ep.title,
      podcastTitle: samplePodcast.title,
      durationSeconds: ep.durationSeconds,
      chapters: ep.chapters
    });
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-32">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </Link>
          <span className="text-xs text-purple-400 font-medium">Show Details</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        {/* Show Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start shadow-xl">
          <div className="w-44 h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 shadow-lg">
            <img src={samplePodcast.coverUrl} alt={samplePodcast.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                  {samplePodcast.category}
                </span>
                <span className="text-xs text-slate-400">• {samplePodcast.language}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{samplePodcast.title}</h1>
              <p className="text-xs text-slate-400 mt-1">Hosted by {samplePodcast.author}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{samplePodcast.description}</p>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleCopyRss}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center space-x-2 transition border border-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Rss className="w-4 h-4 text-amber-400" />}
                <span>{copied ? 'RSS Link Copied' : 'Copy RSS Feed URL'}</span>
              </button>

              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition ${
                  isSubscribed
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isSubscribed ? 'fill-rose-500' : ''}`} />
                <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout: Episodes and Chapter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Episode List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Episodes ({samplePodcast.episodes.length})
            </h2>

            <div className="space-y-3">
              {samplePodcast.episodes.map((ep) => (
                <EpisodeCard
                  key={ep.id}
                  episode={ep}
                  isCurrent={activeEpisode?.id === ep.id}
                  isPlaying={isPlaying && activeEpisode?.id === ep.id}
                  onPlay={handlePlayEpisode}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                />
              ))}
            </div>
          </div>

          {/* Chapter Markers Sidebar */}
          <div className="space-y-4">
            {activeEpisode?.chapters && activeEpisode.chapters.length > 0 && (
              <ChapterList
                chapters={activeEpisode.chapters}
                currentTime={currentTime}
                onSeek={(sec) => setCurrentTime(sec)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Persistent Bottom Episode Player */}
      <EpisodePlayer
        episode={activeEpisode}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSeek={(sec) => setCurrentTime(sec)}
      />
    </div>
  );
}
