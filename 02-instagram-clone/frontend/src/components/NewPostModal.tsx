'use client';

import React, { useState } from 'react';
import { X, Plus, Image as ImageIcon, MapPin } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (postData: { caption: string; location: string; media: any[] }) => void;
}

export function NewPostModal({ onClose, onSubmit }: Props) {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>(['']);

  const handleUrlChange = (idx: number, val: string) => {
    const updated = [...mediaUrls];
    updated[idx] = val;
    setMediaUrls(updated);
  };

  const addSlide = () => {
    if (mediaUrls.length < 10) {
      setMediaUrls([...mediaUrls, '']);
    }
  };

  const removeSlide = (idx: number) => {
    if (mediaUrls.length > 1) {
      setMediaUrls(mediaUrls.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMedia = mediaUrls
      .map((url, idx) => ({ url: url.trim(), order: idx }))
      .filter((m) => m.url.length > 0);

    if (validMedia.length === 0) {
      alert('At least one valid image URL is required.');
      return;
    }

    onSubmit({ caption: caption.trim(), location: location.trim(), media: validMedia });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-sm text-gray-900">Create New Visual Post</h3>
          <button
            onClick={handleSubmit}
            className="text-xs font-bold text-blue-500 hover:text-blue-700 cursor-pointer"
          >
            Share
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Carousel Slide URLs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">
                Media Slides ({mediaUrls.length}/10)
              </label>
              {mediaUrls.length < 10 && (
                <button
                  type="button"
                  onClick={addSlide}
                  className="text-xs text-blue-500 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slide</span>
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    placeholder={`Slide ${idx + 1} Image URL (https://images.unsplash.com/...)`}
                    value={url}
                    onChange={(e) => handleUrlChange(idx, e.target.value)}
                    className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {mediaUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Write a Caption</label>
            <textarea
              rows={3}
              placeholder="Write a caption... Use #hashtags to help people discover your post"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Location Tag</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="e.g. Santorini, Greece"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs focus:outline-none"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
