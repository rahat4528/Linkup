'use client';

import React from 'react';
import { UserCheck, UserMinus, Shield } from 'lucide-react';

interface Props {
  friends: any[];
  onUnfriend: (userId: string) => void;
}

export function FriendsView({ friends, onUnfriend }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Friends & Network</h2>
        <p className="text-xs text-gray-500">Your direct connections on the platform.</p>
      </div>

      {friends.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-xs text-gray-400">
          No friends connected yet. Explore suggestions in the right sidebar to start connecting!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {f.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900">{f.name}</h4>
                  <p className="text-[11px] text-gray-500">@{f.username}</p>
                </div>
              </div>
              <button
                onClick={() => onUnfriend(f.id)}
                className="px-2.5 py-1 text-[11px] text-gray-500 hover:text-red-600 hover:bg-red-50 rounded border border-gray-200 transition cursor-pointer flex items-center gap-1"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Unfriend</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
