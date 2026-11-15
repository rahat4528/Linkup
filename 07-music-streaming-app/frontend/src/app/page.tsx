'use client';

import React, { useState } from 'react';
import { Waves, Disc3, Radio, Sparkles, Sliders, Search } from 'lucide-react';
import { useAudioPlayer, TrackItem } from '../hooks/useAudioPlayer';
import { CanvasWaveform } from '../components/CanvasWaveform';
import { MiniPlayer } from '../components/MiniPlayer';
import { TrackCard } from '../components/TrackCard';

// Sample initial tracks with pre-generated waveform data
const initialTracks: (TrackItem & { genre: string; album: string; isFavorited: boolean })[] = [
  {
    id: 'track-1',
    title: 'Neon Horizon',
    artist: 'Sonic Flow',
    album: 'Cybernetic Echoes',
    genre: 'Synthwave',
    durationSeconds: 214.5,
    isFavorited: true,
    waveformData: [
      12, 18, 24, 38, 45, 62, 78, 85, 92, 70, 55, 42, 60, 75, 88, 95, 100, 84, 65, 48,
      30, 25, 40, 58, 72, 85, 90, 80, 68, 52, 40, 35, 50, 68, 82, 94, 88, 75, 60, 45,
      30, 20, 35, 52, 70, 85, 92, 80, 65, 50, 42, 38, 55, 74, 89, 96, 85, 70, 54, 40,
      25, 30, 48, 65, 80, 92, 85, 72, 58, 45, 35, 28, 44, 62, 78, 88, 80, 68, 52, 38,
      28, 35, 50, 68, 82, 90, 84, 70, 55, 42, 32, 25, 40, 58, 72, 85, 78, 62, 45, 30,
      22, 18, 28, 42, 58, 70, 65, 52, 38, 28, 20, 15, 22, 35, 48, 55, 42, 30, 18, 10
    ]
  },
  {
    id: 'track-2',
    title: 'Midnight Reverie',
    artist: 'Sonic Flow',
    album: 'Atmospheric Depths',
    genre: 'Lo-Fi Chill',
    durationSeconds: 182.0,
    isFavorited: false,
    waveformData: [
      8, 14, 20, 28, 35, 42, 50, 58, 64, 55, 45, 38, 48, 58, 65, 72, 78, 65, 52, 40,
      32, 28, 38, 48, 58, 68, 72, 60, 50, 42, 35, 30, 42, 54, 64, 70, 65, 55, 44, 35,
      25, 22, 32, 44, 56, 68, 74, 62, 50, 40, 32, 28, 40, 52, 62, 70, 60, 48, 38, 28,
      20, 24, 36, 48, 60, 68, 62, 50, 40, 30, 25, 20, 32, 45, 58, 64, 55, 44, 32, 24,
      18, 22, 34, 46, 58, 65, 58, 48, 38, 28, 22, 18, 28, 40, 52, 60, 50, 38, 28, 20,
      15, 12, 18, 28, 38, 45, 40, 32, 24, 18, 14, 10, 15, 22, 30, 35, 28, 20, 12, 8
    ]
  },
  {
    id: 'track-3',
    title: 'Solar Flare Groove',
    artist: 'Sonic Flow',
    album: 'Cybernetic Echoes',
    genre: 'Electronic',
    durationSeconds: 245.2,
    isFavorited: false,
    waveformData: [
      15, 22, 35, 50, 68, 85, 95, 88, 75, 60, 45, 35, 55, 75, 92, 98, 90, 80, 65, 50,
      35, 30, 48, 68, 85, 95, 90, 78, 62, 48, 38, 32, 52, 72, 88, 96, 85, 72, 58, 42,
      30, 25, 42, 62, 82, 94, 88, 75, 60, 45, 35, 30, 50, 70, 88, 95, 82, 68, 52, 38,
      28, 32, 52, 72, 88, 96, 85, 70, 55, 40, 32, 26, 45, 65, 82, 90, 80, 65, 50, 35,
      25, 30, 48, 68, 85, 92, 80, 68, 52, 38, 28, 22, 38, 58, 75, 85, 72, 58, 42, 28,
      20, 16, 25, 40, 55, 65, 55, 42, 30, 22, 16, 12, 18, 28, 38, 42, 32, 22, 14, 8
    ]
  }
];

export default function MusicStreamingPage() {
  const [tracks, setTracks] = useState(initialTracks);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    toggleMute
  } = useAudioPlayer(initialTracks[0]);

  const genres = ['All', 'Synthwave', 'Lo-Fi Chill', 'Electronic'];

  const filteredTracks = tracks.filter((t) => {
    const matchesGenre = selectedGenre === 'All' || t.genre === selectedGenre;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleToggleFavorite = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isFavorited: !t.isFavorited } : t))
    );
  };

  const activeTrack = currentTrack || initialTracks[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">StreamWave</span>
              <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/50 font-mono">
                HTTP/1.1 Range
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracks, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero Interactive Waveform Stage */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
                Now Streaming • Lossless 24-bit
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">{activeTrack.title}</h1>
              <p className="text-sm text-slate-400">{activeTrack.artist} — {activeTrack.album}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => playTrack(activeTrack)}
                className="px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium text-xs flex items-center space-x-2 transition shadow-lg shadow-sky-500/20"
              >
                <Disc3 className="w-4 h-4" />
                <span>{isPlaying ? 'Playing Audio' : 'Stream Track'}</span>
              </button>
            </div>
          </div>

          {/* Large Interactive Canvas Waveform */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <CanvasWaveform
              waveformData={activeTrack.waveformData}
              currentTime={currentTime}
              duration={duration || activeTrack.durationSeconds}
              onSeek={seek}
              height={84}
              barWidth={4}
              barGap={2}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                selectedGenre === genre
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Track List */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Audio Stream Catalog ({filteredTracks.length})
          </h2>

          <div className="space-y-2">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                onPlay={playTrack}
                onTogglePlay={togglePlay}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Persistent Floating MiniPlayer */}
      <MiniPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        onTogglePlay={togglePlay}
        onSeek={seek}
        onVolumeChange={setVolume}
        onToggleMute={toggleMute}
      />
    </div>
  );
}
