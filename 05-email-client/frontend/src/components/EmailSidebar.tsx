'use client';

import React from 'react';
import { Pen, Inbox, Star, Send, FileText, Archive, AlertOctagon, Trash2, Tag, Plus } from 'lucide-react';
import { EmailLabel } from '../services/api';

interface EmailSidebarProps {
  currentFolder: string;
  selectedLabelId: string | null;
  labels: EmailLabel[];
  onSelectFolder: (folder: string) => void;
  onSelectLabel: (labelId: string) => void;
  onOpenCompose: () => void;
}

export const EmailSidebar: React.FC<EmailSidebarProps> = ({
  currentFolder,
  selectedLabelId,
  labels,
  onSelectFolder,
  onSelectLabel,
  onOpenCompose
}) => {
  const folders = [
    { id: 'INBOX', label: 'Inbox', icon: Inbox },
    { id: 'STARRED', label: 'Starred', icon: Star },
    { id: 'SENT', label: 'Sent', icon: Send },
    { id: 'DRAFTS', label: 'Drafts', icon: FileText },
    { id: 'ARCHIVE', label: 'Archive', icon: Archive },
    { id: 'SPAM', label: 'Spam', icon: AlertOctagon },
    { id: 'TRASH', label: 'Trash', icon: Trash2 },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 p-3 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-3 py-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
          @
        </div>
        <span className="font-bold text-lg text-slate-100">Webmail</span>
      </div>

      {/* Compose Button */}
      <button
        onClick={onOpenCompose}
        className="flex items-center gap-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm px-5 py-3 rounded-2xl shadow-md transition mb-5 active:scale-95"
      >
        <Pen className="w-4 h-4" />
        <span>Compose</span>
      </button>

      {/* Folders List */}
      <nav className="flex flex-col gap-0.5">
        {folders.map(f => {
          const Icon = f.icon;
          const isActive = currentFolder === f.id && !selectedLabelId;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFolder(f.id)}
              className={`flex items-center gap-4 px-4 py-2.5 rounded-full text-xs font-semibold transition ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{f.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Labels Section */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2 text-xs font-bold text-slate-400">
          <span>Labels</span>
          <Tag className="w-3.5 h-3.5" />
        </div>

        <div className="flex flex-col gap-0.5">
          {labels.map(l => {
            const isLabelActive = selectedLabelId === l.id;
            return (
              <button
                key={l.id}
                onClick={() => onSelectLabel(l.id)}
                className={`flex items-center gap-3 px-4 py-2 rounded-full text-xs transition ${
                  isLabelActive
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: l.color }}
                />
                <span className="truncate">{l.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
