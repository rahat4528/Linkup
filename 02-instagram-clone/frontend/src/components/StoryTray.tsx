'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface Props {
  stories: any[];
  currentUser: any;
  onCreateStory: () => void;
}

export function StoryTray({ stories, currentUser, onCreateStory }: Props) {
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: any;
    if (activeStory) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setActiveStory(null);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeStory]);

  return (
    <div className="py-3 px-4 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
        {/* Your Story Add Button */}
        <button
          onClick={onCreateStory}
          className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-full relative p-0.5 border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] text-gray-700 truncate max-w-16 font-medium">Your story</span>
        </button>

        {/* Followed User Story Rings */}
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setActiveStory(story)}
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                <img
                  src={story.mediaUrl}
                  alt={story.author?.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] text-gray-700 truncate max-w-16">
              {story.author?.username || 'user'}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full h-[85vh] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl flex flex-col justify-between">
            {/* Progress Bar */}
            <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
              <div className="h-1 bg-white/40 flex-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Header */}
            <div className="absolute top-6 inset-x-4 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 border border-white flex items-center justify-center text-xs font-bold">
                  {activeStory.author?.username?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">@{activeStory.author?.username}</p>
                  <p className="text-[10px] text-white/70">24h story</p>
                </div>
              </div>
              <button
                onClick={() => setActiveStory(null)}
                className="p-1 rounded-full bg-black/40 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Image */}
            <img
              src={activeStory.mediaUrl}
              alt="Story View"
              className="w-full h-full object-cover"
            />

            {/* Caption Overlay */}
            {activeStory.caption && (
              <div className="absolute bottom-6 inset-x-4 z-20 bg-black/60 backdrop-blur-xs p-3 rounded-xl text-white text-xs leading-relaxed text-center">
                {activeStory.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
