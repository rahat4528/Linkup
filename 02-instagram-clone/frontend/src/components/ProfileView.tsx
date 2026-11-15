'use client';

import React from 'react';
import { Lock, Settings, Grid, Bookmark, UserCheck, Link as LinkIcon } from 'lucide-react';

interface Props {
  profileData: any;
  onEditProfile?: () => void;
  onFollow?: () => void;
}

export function ProfileView({ profileData, onEditProfile, onFollow }: Props) {
  if (!profileData) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading profile...</div>;
  }

  const { user, profile, stats, relationship, posts } = profileData;

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full border-2 border-white bg-gray-100 overflow-hidden flex items-center justify-center font-bold text-gray-700 text-lg">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
          </div>

          <div className="flex-1 flex justify-around ml-4">
            <div className="text-center">
              <span className="font-bold text-sm block text-gray-900">{stats?.postsCount || 0}</span>
              <span className="text-[11px] text-gray-500">posts</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-sm block text-gray-900">{stats?.followersCount || 0}</span>
              <span className="text-[11px] text-gray-500">followers</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-sm block text-gray-900">{stats?.followingCount || 0}</span>
              <span className="text-[11px] text-gray-500">following</span>
            </div>
          </div>
        </div>

        {/* Bio & Link */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h2 className="font-bold text-sm text-gray-900">{user?.name}</h2>
            {profile?.isVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">
                ✓
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">@{user?.username}</p>
          {profile?.bio && <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line mb-1.5">{profile.bio}</p>}
          {profile?.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-blue-900 flex items-center gap-1 hover:underline"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{profile.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {relationship?.isSelf ? (
            <button
              onClick={onEditProfile}
              className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-lg transition cursor-pointer"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={onFollow}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                relationship?.isFollowing
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {relationship?.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Locked Private Account Banner */}
      {relationship?.isLocked ? (
        <div className="py-16 px-6 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-gray-900 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-gray-900" />
          </div>
          <h3 className="font-bold text-sm text-gray-900 mb-1">This Account is Private</h3>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            Follow this account to see their photos, carousels, and stories.
          </p>
        </div>
      ) : (
        /* Profile Grid */
        <div>
          <div className="flex justify-center border-b border-gray-100 py-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 border-b-2 border-black pb-2.5 -mb-2.5 px-4">
              <Grid className="w-4 h-4" />
              <span>POSTS</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 mt-1">
            {posts?.map((p: any) => (
              <div key={p.id} className="aspect-square bg-gray-100 overflow-hidden relative group cursor-pointer">
                <img
                  src={p.media?.[0]?.url}
                  alt={p.caption || 'User post'}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
