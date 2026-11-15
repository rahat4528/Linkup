'use client';

import React from 'react';
import { Check, CheckCheck, Smile, Trash2 } from 'lucide-react';
import { Message, ChatApi } from '../services/api';

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
  onRefresh: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSelf,
  onRefresh
}) => {
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleToggleReaction = async (emoji: string) => {
    await ChatApi.toggleReaction(message.id, emoji);
    onRefresh();
  };

  const handleDelete = async () => {
    await ChatApi.deleteMessage(message.id);
    onRefresh();
  };

  return (
    <div className={`flex flex-col mb-3 group ${isSelf ? 'items-end' : 'items-start'}`}>
      {!isSelf && (
        <span className="text-[11px] text-slate-400 font-medium mb-1 px-1">
          {message.senderName}
        </span>
      )}

      <div className="flex items-center gap-2 max-w-[75%]">
        {/* Quick action bar for self */}
        {isSelf && !message.isDeleted && (
          <div className="hidden group-hover:flex items-center gap-1 text-slate-400">
            <button
              onClick={() => handleToggleReaction('❤️')}
              className="p-1 hover:text-rose-400 hover:bg-slate-800 rounded transition"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:text-red-400 hover:bg-slate-800 rounded transition"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Message Container */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm relative ${
            isSelf
              ? 'bg-sky-600 text-white rounded-br-none'
              : 'bg-slate-800 text-slate-100 rounded-bl-none'
          } ${message.isDeleted ? 'italic text-slate-400/80 bg-slate-800/50' : ''}`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-300/80">
            {message.isEdited && <span>(edited)</span>}
            <span>{formatTime(message.createdAt)}</span>

            {/* Delivery / Read Receipts for sender */}
            {isSelf && !message.isDeleted && (
              <span className="ml-0.5">
                {message.receiptStatus === 'READ' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-200 stroke-[2.5]" title="Read" />
                ) : message.receiptStatus === 'DELIVERED' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-slate-300" title="Delivered" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-slate-300" title="Sent" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Emoji Reactions Tray */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 px-1">
          {message.reactions.map((rxn, idx) => (
            <button
              key={idx}
              onClick={() => handleToggleReaction(rxn.emoji)}
              className="bg-slate-800/80 border border-slate-700/60 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:bg-slate-700 transition"
            >
              <span>{rxn.emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
