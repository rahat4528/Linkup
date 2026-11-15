'use client';

import React from 'react';
import { Home, Users, Calendar, UserCheck, Bookmark, ShieldAlert, User, Bell } from 'lucide-react';

interface Props {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: any;
  unreadCount?: number;
}

export function NavigationSidebar({ currentTab, onTabChange, currentUser, unreadCount = 0 }: Props) {
  const navItems = [
    { id: 'feed', label: 'News Feed', icon: Home },
    { id: 'groups', label: 'Communities & Groups', icon: Users },
    { id: 'events', label: 'Community Events', icon: Calendar },
    { id: 'friends', label: 'Friends & Network', icon: UserCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside className="w-64 p-4 flex flex-col gap-2 shrink-0 bg-white border-r border-gray-100 min-h-screen">
      <div className="flex items-center gap-3 px-3 py-4 mb-2 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          L
        </div>
        <div>
          <h1 className="font-bold text-gray-900 leading-tight">Linkup</h1>
          <p className="text-xs text-gray-500">Community Social Network</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {currentUser && (
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold text-sm">
            {currentUser.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate">@{currentUser.username}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
