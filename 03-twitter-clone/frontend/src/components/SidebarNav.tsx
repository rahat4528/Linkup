'use client';

import React from 'react';
import { Home, Hash, Bell, Mail, Bookmark, User, Feather } from 'lucide-react';

interface SidebarNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenComposer: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onTabChange,
  onOpenComposer
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Hash },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <aside className="w-64 flex flex-col justify-between h-screen sticky top-0 px-4 py-3 border-r border-[#2f3336]">
      <div className="flex flex-col gap-2">
        {/* Brand Icon */}
        <div className="p-3 w-fit rounded-full hover:bg-[#181818] cursor-pointer transition text-sky-400">
          <Feather className="w-8 h-8" />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-4 px-4 py-3 rounded-full text-xl transition hover:bg-[#181818] text-left ${
                  isActive ? 'font-bold text-white' : 'text-[#e7e9ea]'
                }`}
              >
                <Icon className={`w-7 h-7 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Primary Post Button */}
        <button
          onClick={onOpenComposer}
          className="mt-4 w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-3.5 px-6 rounded-full transition shadow-md active:scale-95"
        >
          Post
        </button>
      </div>

      {/* User profile footer */}
      <div className="flex items-center justify-between p-3 rounded-full hover:bg-[#181818] cursor-pointer transition mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-white text-base">
            U
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-[#e7e9ea]">You</span>
            <span className="text-xs text-[#71767b]">@linkup_user</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
