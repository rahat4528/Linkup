'use client';

import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface Props {
  stories: any[];
  onCreateStory: (mediaUrl: string, caption?: string) => void;
}

export function StoryReel({ stories, onCreateStory }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;
    onCreateStory(mediaUrl.trim(), caption.trim());
    setMediaUrl('');
    setCaption('');
    setShowModal(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {/* Create Story Card */}
        <button
          onClick={() => setShowModal(true)}
          className="w-28 h-40 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 flex flex-col items-center justify-center p-2 shrink-0 transition group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-emerald-900 text-center">Add Story</span>
          <span className="text-[10px] text-emerald-600">24h photo</span>
        </button>

        {/* Existing Stories */}
        {stories.map((story) => (
          <div
            key={story.id}
            className="w-28 h-40 rounded-xl relative overflow-hidden shrink-0 border border-gray-200 shadow-xs group bg-gray-900"
          >
            <img
              src={story.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-2 flex flex-col justify-between">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border border-white">
                {story.author?.name?.charAt(0) || 'U'}
              </div>
              <p className="text-[11px] text-white font-medium leading-tight line-clamp-2">
                {story.caption || story.author?.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">Create Ephemeral Story</h3>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Photo URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Caption (Optional)</label>
                <input
                  type="text"
                  placeholder="Share a thought..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-gray-500">Stories automatically expire 24 hours after publication.</p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
