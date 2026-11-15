'use client';

import React from 'react';
import { Star, RotateCw, Archive, Trash2, Search } from 'lucide-react';
import { EmailThread } from '../services/api';

interface EmailListProps {
  threads: EmailThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onToggleStar: (threadId: string, e: React.MouseEvent) => void;
  onRefresh: () => void;
  onSearch: (q: string) => void;
  searchQuery: string;
}

export const EmailList: React.FC<EmailListProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  onToggleStar,
  onRefresh,
  onSearch,
  searchQuery
}) => {
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Search & Actions Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search mail by subject, sender, or content..."
            className="w-full bg-slate-800 text-sm text-slate-100 pl-9 pr-4 py-2 rounded-xl outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-400"
          />
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {threads.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No messages found in this folder.
          </div>
        ) : (
          threads.map(thread => {
            const isSelected = thread.id === activeThreadId;

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition select-none ${
                  isSelected
                    ? 'bg-sky-500/10'
                    : thread.isRead
                    ? 'bg-slate-950/40 hover:bg-slate-900/60 text-slate-300'
                    : 'bg-slate-900/80 hover:bg-slate-850 text-white font-semibold'
                }`}
              >
                {/* Star Toggle */}
                <button
                  onClick={(e) => onToggleStar(thread.id, e)}
                  className="p-1 text-slate-500 hover:text-amber-400 transition"
                >
                  <Star
                    className={`w-4 h-4 ${
                      thread.isStarred ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>

                {/* Sender */}
                <div className="w-44 truncate text-xs flex-shrink-0">
                  <span className={thread.isRead ? 'text-slate-300' : 'text-slate-100 font-bold'}>
                    {thread.from}
                  </span>
                  {thread.messageCount > 1 && (
                    <span className="text-[10px] text-slate-500 ml-1">({thread.messageCount})</span>
                  )}
                </div>

                {/* Subject & Snippet Preview */}
                <div className="flex-1 min-w-0 flex items-center gap-2 text-xs">
                  <span className={`truncate ${thread.isRead ? 'text-slate-200' : 'text-white font-bold'}`}>
                    {thread.normalizedSubject}
                  </span>
                  <span className="text-slate-500 font-normal truncate hidden sm:inline">
                    - {thread.snippet || 'No preview available'}
                  </span>
                </div>

                {/* Labels */}
                {thread.labels && thread.labels.length > 0 && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {thread.labels.map(l => (
                      <span
                        key={l.id}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{ backgroundColor: `${l.color}20`, color: l.color }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date */}
                <div className="text-[11px] text-slate-500 flex-shrink-0 text-right w-16">
                  {formatDate(thread.lastMessageAt)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
