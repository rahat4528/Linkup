'use client';

import React, { useState } from 'react';
import { Search, Plus, Users, MessageSquare } from 'lucide-react';
import { Conversation } from '../services/api';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenNewChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenNewChat
}) => {
  const [filter, setFilter] = useState('');

  const filtered = conversations.filter(c => {
    const title = c.title || (c.type === 'DIRECT' ? c.members[0]?.name : 'Group');
    return title.toLowerCase().includes(filter.toLowerCase());
  });

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="w-80 h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg text-slate-100">Messages</h1>
        </div>
        <button
          onClick={onOpenNewChat}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-slate-800/80 text-sm text-slate-200 pl-9 pr-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No conversations found.
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const displayTitle = conv.title || (conv.type === 'DIRECT' ? conv.members[0]?.name || 'Direct Chat' : 'Group Chat');

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                  isActive ? 'bg-sky-500/20 text-white' : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                {/* Avatar with type indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base">
                    {conv.type === 'GROUP' ? <Users className="w-5 h-5" /> : displayTitle.charAt(0).toUpperCase()}
                  </div>
                  {conv.type === 'DIRECT' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate text-slate-100">{displayTitle}</h3>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">
                      {formatTime(conv.lastMessage?.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-sky-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
