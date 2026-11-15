'use client';

import React, { useState } from 'react';
import { User, Shield, Trash2, X } from 'lucide-react';

interface Props {
  user: any;
  profile: any;
  onClose: () => void;
  onUpdate: (data: any) => void;
  onDeleteAccount: () => void;
}

export function ProfileModal({ user, profile, onClose, onUpdate, onDeleteAccount }: Props) {
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [work, setWork] = useState(profile?.work || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [profilePrivacy, setProfilePrivacy] = useState(profile?.profilePrivacy || 'PUBLIC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ bio, location, work, education, profilePrivacy });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{user?.name}</h3>
            <p className="text-xs text-gray-500">@{user?.username} • {user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Biography</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Work / Occupation</label>
              <input
                type="text"
                value={work}
                onChange={(e) => setWork(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Education</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. Stanford University"
              className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Profile Privacy</label>
            <select
              value={profilePrivacy}
              onChange={(e) => setProfilePrivacy(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="PUBLIC">Public — Visible to all members</option>
              <option value="FRIENDS">Friends Only — Visible only to mutual friends</option>
              <option value="ONLY_ME">Private — Hidden from search and directory</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onDeleteAccount}
              className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5 font-medium transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
