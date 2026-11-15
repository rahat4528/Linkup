'use client';

import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, Music } from 'lucide-react';
import { Playlist } from '../services/api';

interface MusicSidebarProps {
  currentView: 'home' | 'search' | 'library' | 'playlist' | 'liked';
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onNavigate: (view: 'home' | 'search' | 'library' | 'playlist' | 'liked', playlistId?: string) => void;
  onCreatePlaylist: () => void;
}

export const MusicSidebar: React.FC<MusicSidebarProps> = ({
  currentView,
  playlists,
  selectedPlaylistId,
  onNavigate,
  onCreatePlaylist
}) => {
  return (
    <aside className="w-60 h-[calc(100vh-90px)] bg-black p-4 flex flex-col gap-6 flex-shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center gap-2 px-2 text-white font-bold text-xl cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black">
          <Music className="w-5 h-5 fill-black stroke-black" />
        </div>
        <span>Music</span>
      </div>

      {/* Main Nav */}
      <nav className="flex flex-col gap-3 font-semibold text-sm">
        <button
          onClick={() => onNavigate('home')}
          className={`flex items-center gap-4 px-2 py-1.5 transition rounded-lg ${
            currentView === 'home' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Home className="w-6 h-6" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('search')}
          className={`flex items-center gap-4 px-2 py-1.5 transition rounded-lg ${
            currentView === 'search' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Search className="w-6 h-6" />
          <span>Search</span>
        </button>
        <button
          onClick={() => onNavigate('library')}
          className={`flex items-center gap-4 px-2 py-1.5 transition rounded-lg ${
            currentView === 'library' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Library className="w-6 h-6" />
          <span>Your Library</span>
        </button>
      </nav>

      {/* Quick Collections */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={onCreatePlaylist}
          className="flex items-center gap-4 px-2 text-sm font-semibold text-[#b3b3b3] hover:text-white transition"
        >
          <div className="w-6 h-6 rounded bg-[#b3b3b3] hover:bg-white flex items-center justify-center text-black transition">
            <PlusSquare className="w-4 h-4 fill-black" />
          </div>
          <span>Create Playlist</span>
        </button>

        <button
          onClick={() => onNavigate('liked')}
          className={`flex items-center gap-4 px-2 text-sm font-semibold transition ${
            currentView === 'liked' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center text-white">
            <Heart className="w-3.5 h-3.5 fill-white" />
          </div>
          <span>Liked Songs</span>
        </button>
      </div>

      <hr className="border-[#282828]" />

      {/* User Playlists */}
      <div className="flex-1 overflow-y-auto space-y-2 text-sm text-[#b3b3b3]">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => onNavigate('playlist', pl.id)}
            className={`truncate cursor-pointer hover:text-white transition py-1 ${
              selectedPlaylistId === pl.id && currentView === 'playlist'
                ? 'text-[#1db954] font-semibold'
                : ''
            }`}
          >
            {pl.title}
          </div>
        ))}
      </div>
    </aside>
  );
};
