'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Shield } from 'lucide-react';
import { Conversation, Message, ChatApi } from '../services/api';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  conversation: Conversation | null;
  currentUserId: string;
  onRefreshConversations: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  onRefreshConversations
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!conversation) return;
    const msgs = await ChatApi.getMessages(conversation.id);
    setMessages(msgs);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || !inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    await ChatApi.sendMessage(conversation.id, text);
    fetchMessages();
    onRefreshConversations();
  };

  if (!conversation) {
    return (
      <div className="flex-1 h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-500">
        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-300">Select a conversation</h2>
        <p className="text-xs text-slate-500 mt-1">Choose a conversation from the sidebar or start a new chat.</p>
      </div>
    );
  }

  const title = conversation.title || (conversation.type === 'DIRECT' ? conversation.members[0]?.name : 'Group Chat');

  return (
    <div className="flex-1 h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-white text-base">
            {title.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">{title}</h2>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {conversation.type === 'DIRECT' ? 'Online' : `${conversation.members.length} members`}
            </p>
          </div>
        </div>

        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isSelf={msg.senderId === currentUserId}
            onRefresh={fetchMessages}
          />
        ))}
        {isTyping && (
          <div className="text-xs italic text-slate-400 flex items-center gap-2">
            <span className="animate-pulse">Someone is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Toolbar */}
      <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          title="Attach"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          title="Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 text-sm text-slate-100 px-4 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-400"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white transition shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
