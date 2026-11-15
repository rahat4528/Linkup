'use client';

import React from 'react';
import { Home, Compass, PlusSquare, Film, User } from 'lucide-react';

interface Props {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: any;
}

export function BottomTabBar({ currentTab, onTabChange, currentUser }: Props) {
  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'create', icon: PlusSquare, label: 'Create' },
    { id: 'reels', icon: Film, label: 'Reels' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 py-2.5 px-6 flex items-center justify-around max-w-lg mx-auto shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              isActive ? 'text-black font-semibold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
