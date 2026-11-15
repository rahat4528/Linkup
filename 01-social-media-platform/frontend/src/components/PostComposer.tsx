'use client';

import React, { useState } from 'react';
import { Image, Globe, Users, Lock, Send } from 'lucide-react';

interface Props {
  onPublish: (postData: { content: string; visibility: string; mediaUrl?: string }) => void;
  currentUser: any;
}

export function PostComposer({ onPublish, currentUser }: Props) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onPublish({
      content: content.trim(),
      visibility,
      mediaUrl: mediaUrl.trim() || undefined,
    });

    setContent('');
    setMediaUrl('');
    setShowMediaInput(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <textarea
            rows={3}
            placeholder={`What's on your mind, ${currentUser?.name?.split(' ')[0] || 'friend'}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full resize-none border-none text-sm focus:outline-none placeholder-gray-400 py-1"
          />
        </div>

        {showMediaInput && (
          <div className="mb-3 pl-13">
            <input
              type="url"
              placeholder="Attach Image URL (https://images.unsplash.com/...)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Image className="w-4 h-4 text-emerald-600" />
              <span>Photo</span>
            </button>

            {/* Visibility Selector */}
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
              {visibility === 'PUBLIC' && <Globe className="w-3.5 h-3.5 text-gray-500" />}
              {visibility === 'FRIENDS' && <Users className="w-3.5 h-3.5 text-emerald-600" />}
              {visibility === 'ONLY_ME' && <Lock className="w-3.5 h-3.5 text-amber-600" />}
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="PUBLIC">Public</option>
                <option value="FRIENDS">Friends Only</option>
                <option value="ONLY_ME">Only Me</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <span>Post</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
