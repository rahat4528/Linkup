'use client';

import React, { useState } from 'react';
import { ArrowLeft, Star, Archive, Trash2, Reply, ShieldAlert, Send } from 'lucide-react';
import { EmailThread, EmailMessage, EmailApi } from '../services/api';

interface EmailViewProps {
  thread: EmailThread;
  messages: EmailMessage[];
  onBack: () => void;
  onRefresh: () => void;
  onToggleStar: (threadId: string, e: React.MouseEvent) => void;
  onMoveFolder: (threadId: string, folder: string) => void;
}

export const EmailView: React.FC<EmailViewProps> = ({
  thread,
  messages,
  onBack,
  onRefresh,
  onToggleStar,
  onMoveFolder
}) => {
  const [loadExternalImages, setLoadExternalImages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || messages.length === 0) return;

    try {
      setIsSending(true);
      const lastMessage = messages[messages.length - 1];
      await EmailApi.sendEmail({
        to: [lastMessage.from],
        subject: `Re: ${thread.normalizedSubject}`,
        text: replyText.trim(),
        html: `<p>${replyText.trim()}</p>`,
        inReplyTo: lastMessage.messageId,
        references: [...(lastMessage.references || []), lastMessage.messageId]
      });

      setReplyText('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Action Toolbar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
            title="Back to inbox"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveFolder(thread.id, 'ARCHIVE')}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveFolder(thread.id, 'TRASH')}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={(e) => onToggleStar(thread.id, e)}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition"
        >
          <Star className={`w-4 h-4 ${thread.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Main Content View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Subject Title & Labels */}
        <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">{thread.normalizedSubject}</h1>
            {thread.labels && thread.labels.length > 0 && (
              <div className="flex gap-1.5">
                {thread.labels.map(l => (
                  <span
                    key={l.id}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${l.color}25`, color: l.color }}
                  >
                    {l.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Privacy Banner */}
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            <span>Images in this message are hidden to protect privacy.</span>
          </div>
          <button
            onClick={() => setLoadExternalImages(!loadExternalImages)}
            className="text-sky-400 hover:text-sky-300 font-semibold underline text-xs"
          >
            {loadExternalImages ? 'Hide Images' : 'Load Images'}
          </button>
        </div>

        {/* Chronological Message Stack */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3"
            >
              {/* Sender Details Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                    {msg.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-slate-100">{msg.from}</h3>
                    <p className="text-[11px] text-slate-500">to {msg.to.join(', ')}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500">{formatDate(msg.date)}</span>
              </div>

              {/* Message Body */}
              <div className="pt-2 text-sm text-slate-200 leading-relaxed overflow-x-auto">
                {msg.bodyHtml ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: loadExternalImages
                        ? msg.bodyHtml.replace(/data-original-src="([^"]+)"/g, 'src="$1"')
                        : msg.bodyHtml
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.bodyText || ''}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reply Composer Box */}
        <form onSubmit={handleSendReply} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Reply className="w-4 h-4" />
            <span>Reply to conversation</span>
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 outline-none focus:border-sky-500 resize-none placeholder-slate-500"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!replyText.trim() || isSending}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
