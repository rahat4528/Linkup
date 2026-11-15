'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { MusicSidebar } from '../components/MusicSidebar';
import { PlayerBar } from '../components/PlayerBar';
import { TrackTable } from '../components/TrackTable';
import { BrowseCategories } from '../components/BrowseCategories';
import { Track, Playlist, Category, SpotifyApi } from '../services/api';

export default function SpotifyHomePage() {
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'library' | 'playlist' | 'liked'>('home');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  // Audio Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'OFF' | 'ALL' | 'ONE'>('OFF');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState(0.8);
  const [isLiked, setIsLiked] = useState(false);

  // Initial Mock Data
  const mockCategories: Category[] = [
    { id: 'pop', name: 'Pop', gradient: 'from-pink-500 to-rose-600' },
    { id: 'hiphop', name: 'Hip-Hop', gradient: 'from-orange-500 to-amber-600' },
    { id: 'electronic', name: 'Electronic', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'rock', name: 'Rock', gradient: 'from-red-600 to-neutral-800' }
  ];

  const mockTracks: Track[] = [
    {
      id: 'mock_trk_1',
      title: 'Midnight Highway',
      artistId: 'art_1',
      artistName: 'The Synthesizers',
      albumTitle: 'Neon Odyssey',
      durationMs: 215000,
      audioUrl: 'https://cdn.example.com/audio/midnight-highway.mp3',
      position: 0
    },
    {
      id: 'mock_trk_2',
      title: 'Digital Sunset',
      artistId: 'art_1',
      artistName: 'The Synthesizers',
      albumTitle: 'Neon Odyssey',
      durationMs: 198000,
      audioUrl: 'https://cdn.example.com/audio/digital-sunset.mp3',
      position: 1
    },
    {
      id: 'mock_trk_3',
      title: 'City Lights At Dusk',
      artistId: 'art_2',
      artistName: 'Retro Wave Masters',
      albumTitle: 'Neon Horizon',
      durationMs: 200000,
      audioUrl: 'https://cdn.example.com/audio/city-lights.mp3',
      position: 2
    }
  ];

  const mockPlaylist: Playlist = {
    id: 'mock_pl_1',
    userId: 'user_1',
    title: 'Night Drive Favorites',
    description: 'Atmospheric synth tracks for late night listening.',
    isPublic: true,
    trackCount: 3,
    tracks: mockTracks
  };

  const loadData = async () => {
    try {
      const [cats, userPlaylists, liked] = await Promise.all([
        SpotifyApi.getCategories(),
        SpotifyApi.getMyPlaylists(),
        SpotifyApi.getLikedTracks()
      ]);

      setCategories(cats.length > 0 ? cats : mockCategories);
      setPlaylists(userPlaylists.length > 0 ? userPlaylists : [mockPlaylist]);
      setLikedTracks(liked.length > 0 ? liked : mockTracks);
    } catch {
      setCategories(mockCategories);
      setPlaylists([mockPlaylist]);
      setLikedTracks(mockTracks);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Simulated audio playback ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, currentTrack]);

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(Math.floor(track.durationMs / 1000));
  };

  const handleNextTrack = () => {
    if (repeatMode === 'ONE') {
      setCurrentTime(0);
      return;
    }
    const currentList = selectedPlaylist?.tracks || mockTracks;
    const currentIndex = currentList.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
      handlePlayTrack(currentList[currentIndex + 1]);
    } else if (repeatMode === 'ALL') {
      handlePlayTrack(currentList[0]);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePreviousTrack = () => {
    const currentList = selectedPlaylist?.tracks || mockTracks;
    const currentIndex = currentList.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      handlePlayTrack(currentList[currentIndex - 1]);
    } else {
      setCurrentTime(0);
    }
  };

  const handleToggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const handleToggleRepeat = () => {
    const modes: ('OFF' | 'ALL' | 'ONE')[] = ['OFF', 'ALL', 'ONE'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIdx]);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const res = await SpotifyApi.search(query);
    setSearchResults(res.results?.tracks || []);
  };

  const handleReorderPlaylist = async (sourceIdx: number, targetIdx: number) => {
    if (!selectedPlaylist) return;
    const updated = [...(selectedPlaylist.tracks || [])];
    const [moved] = updated.splice(sourceIdx, 1);
    updated.splice(targetIdx, 0, moved);

    setSelectedPlaylist({
      ...selectedPlaylist,
      tracks: updated
    });

    await SpotifyApi.reorderPlaylist(selectedPlaylist.id, sourceIdx, targetIdx);
  };

  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <MusicSidebar
        currentView={currentView}
        playlists={playlists}
        selectedPlaylistId={selectedPlaylist?.id || null}
        onNavigate={(view, plId) => {
          setCurrentView(view);
          if (view === 'playlist' && plId) {
            const found = playlists.find(p => p.id === plId) || mockPlaylist;
            setSelectedPlaylist(found);
          }
        }}
        onCreatePlaylist={async () => {
          const res = await SpotifyApi.createPlaylist(`My Playlist #${playlists.length + 1}`);
          if (res.playlist) {
            setPlaylists([...playlists, res.playlist]);
            setSelectedPlaylist(res.playlist);
            setCurrentView('playlist');
          }
        }}
      />

      {/* Main Content Pane */}
      <main className="flex-1 h-[calc(100vh-90px)] overflow-y-auto bg-gradient-to-b from-[#202020] to-[#121212] p-8">
        {/* Search View */}
        {currentView === 'search' ? (
          <div className="space-y-6">
            <div className="relative max-w-md">
              <Search className="w-5 h-5 text-[#b3b3b3] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="What do you want to listen to?"
                className="w-full bg-[#242424] text-sm text-white pl-11 pr-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-white placeholder-[#757575]"
              />
            </div>

            {searchQuery ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Search Results</h2>
                <TrackTable
                  tracks={searchResults}
                  currentTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                />
              </div>
            ) : (
              <BrowseCategories
                categories={categories}
                onSelectCategory={(cat) => handleSearch(cat.name)}
              />
            )}
          </div>
        ) : currentView === 'liked' ? (
          /* Liked Songs View */
          <div className="space-y-6">
            <div className="flex items-end gap-6 pb-6">
              <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center text-white text-6xl shadow-2xl">
                ♥
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-[#b3b3b3]">Playlist</p>
                <h1 className="text-5xl font-extrabold text-white mt-1">Liked Songs</h1>
                <p className="text-xs text-[#b3b3b3] mt-3">{likedTracks.length} songs</p>
              </div>
            </div>

            <TrackTable
              tracks={likedTracks}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
            />
          </div>
        ) : currentView === 'playlist' && selectedPlaylist ? (
          /* Single Playlist View */
          <div className="space-y-6">
            <div className="flex items-end gap-6 pb-6">
              <div className="w-48 h-48 rounded-lg bg-[#282828] flex items-center justify-center text-white text-6xl shadow-2xl">
                ♪
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-[#b3b3b3]">Playlist</p>
                <h1 className="text-5xl font-extrabold text-white mt-1">{selectedPlaylist.title}</h1>
                <p className="text-sm text-[#b3b3b3] mt-2">{selectedPlaylist.description || 'Custom playlist'}</p>
                <p className="text-xs text-[#b3b3b3] mt-2">{selectedPlaylist.tracks?.length || 0} songs</p>
              </div>
            </div>

            <TrackTable
              tracks={selectedPlaylist.tracks || []}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              isPlaylistView={true}
              onPlayTrack={handlePlayTrack}
              onReorder={handleReorderPlaylist}
            />
          </div>
        ) : (
          /* Default Home View */
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-6">Good evening</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => {
                      setSelectedPlaylist(pl);
                      setCurrentView('playlist');
                    }}
                    className="flex items-center gap-4 bg-[#282828]/50 hover:bg-[#282828] transition rounded-lg overflow-hidden cursor-pointer group"
                  >
                    <div className="w-20 h-20 bg-[#333] flex items-center justify-center text-xl font-bold flex-shrink-0">
                      ♪
                    </div>
                    <span className="font-bold text-sm truncate flex-1">{pl.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Featured Tracks</h2>
              <TrackTable
                tracks={mockTracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
              />
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isLiked={isLiked}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onSeek={(time) => setCurrentTime(time)}
        onVolumeChange={(vol) => setVolume(vol)}
        onToggleLike={() => setIsLiked(!isLiked)}
        onToggleQueueDrawer={() => {}}
      />
    </div>
  );
}
