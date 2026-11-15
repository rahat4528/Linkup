'use client';

import React, { useState } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import { ChatApi } from '../services/api';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (convId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [tab, setTab] = useState<'DIRECT' | 'GROUP'>('DIRECT');
  const [targetUserId, setTargetUserId] = useState('');
  const [groupTitle, setGroupTitle] = useState('');
  const [memberIdsInput, setMemberIdsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (tab === 'DIRECT') {
        if (!targetUserId.trim()) {
          setError('Target user ID is required');
          return;
        }
        const res = await ChatApi.createDirect(targetUserId.trim());
        if (res.conversation) {
          onCreated(res.conversation.id);
          onClose();
        } else {
          setError(res.error || 'Failed to create direct chat');
        }
      } else {
        if (!groupTitle.trim()) {
          setError('Group title is required');
          return;
        }
        const members = memberIdsInput
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        const res = await ChatApi.createGroup(groupTitle.trim(), members);
        if (res.conversation) {
          onCreated(res.conversation.id);
          onClose();
        } else {
          setError(res.error || 'Failed to create group');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error creating conversation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-100">Start New Conversation</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setTab('DIRECT')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              tab === 'DIRECT' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Direct Message
          </button>
          <button
            onClick={() => setTab('GROUP')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              tab === 'GROUP' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Group Chat
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {tab === 'DIRECT' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Recipient User ID
              </label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="e.g. usr_12345"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Group Title
                </label>
                <input
                  type="text"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="e.g. Engineering Team"
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Participant User IDs (comma-separated)
                </label>
                <input
                  type="text"
                  value={memberIdsInput}
                  onChange={(e) => setMemberIdsInput(e.target.value)}
                  placeholder="usr_1, usr_2, usr_3"
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white transition shadow-md"
            >
              {isSubmitting ? 'Creating...' : 'Create Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
