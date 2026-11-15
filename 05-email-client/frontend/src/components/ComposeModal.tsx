'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Paperclip, Send, Trash2, CheckCircle2 } from 'lucide-react';
import { EmailApi } from '../services/api';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSent
}) => {
  const [toInput, setToInput] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [autosaveStatus, setAutosaveStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setDraftId(undefined);
      setToInput('');
      setSubject('');
      setBody('');
      setAutosaveStatus(null);
    }
  }, [isOpen]);

  // Autosave trigger
  const triggerAutosave = () => {
    if (!toInput && !subject && !body) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        const recipients = toInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const res = await EmailApi.autosaveDraft({
          draftId,
          to: recipients,
          subject,
          bodyText: body,
          bodyHtml: `<p>${body}</p>`
        });
        if (res.draft) {
          setDraftId(res.draft.id);
          setAutosaveStatus('Draft saved');
        }
      } catch (err) {
        console.error('Autosave error', err);
      }
    }, 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipients = toInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (recipients.length === 0) return;

    try {
      setIsSending(true);
      await EmailApi.sendEmail({
        to: recipients,
        subject: subject || '(No Subject)',
        text: body,
        html: `<p>${body}</p>`,
        draftId
      });

      onSent();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-8 z-50 w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-xs text-slate-100">New Message</h3>
        <div className="flex items-center gap-1 text-slate-400">
          {autosaveStatus && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {autosaveStatus}
            </span>
          )}
          <button onClick={onClose} className="p-1 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSend} className="flex flex-col flex-1">
        {/* Recipients */}
        <div className="px-4 py-2 border-b border-slate-800/80 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 w-12">To:</span>
          <input
            type="text"
            value={toInput}
            onChange={(e) => {
              setToInput(e.target.value);
              triggerAutosave();
            }}
            placeholder="Recipients (comma separated)"
            className="flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder-slate-500"
          />
        </div>

        {/* Subject */}
        <div className="px-4 py-2 border-b border-slate-800/80 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 w-12">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              triggerAutosave();
            }}
            placeholder="Subject line"
            className="flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder-slate-500 font-semibold"
          />
        </div>

        {/* Body */}
        <div className="p-4 flex-1">
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              triggerAutosave();
            }}
            rows={10}
            placeholder="Compose your email..."
            className="w-full bg-transparent text-xs text-slate-100 outline-none resize-none placeholder-slate-500 leading-relaxed"
          />
        </div>

        {/* Footer Toolbar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSending || !toInput.trim()}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send'}</span>
            </button>
            <button
              type="button"
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition"
            title="Discard"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
