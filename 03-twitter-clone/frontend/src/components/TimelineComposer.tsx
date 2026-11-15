'use client';

import React, { useState } from 'react';
import { Image, BarChart2, Smile, Calendar, X, Plus } from 'lucide-react';

interface TimelineComposerProps {
  onPostCreated: () => void;
  onSubmitPost: (text: string, pollOptions?: string[]) => Promise<void>;
  placeholder?: string;
  parentId?: string | null;
}

export const TimelineComposer: React.FC<TimelineComposerProps> = ({
  onPostCreated,
  onSubmitPost,
  placeholder = "What is happening?!",
  parentId = null
}) => {
  const [text, setText] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side character calculation (URL weighting = 23 chars, graphemes)
  const calculateLength = (val: string): number => {
    if (!val) return 0;
    const urlReplaced = val.replace(/https?:\/\/[^\s]+/gi, () => 'X'.repeat(23));
    return Array.from(urlReplaced).length;
  };

  const currentLength = calculateLength(text);
  const maxChars = 280;
  const remaining = maxChars - currentLength;
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining <= 20 && remaining >= 0;

  // Radial progress stroke calculation
  const progressRatio = Math.min(currentLength / maxChars, 1);
  const strokeDashoffset = 100 - progressRatio * 100;

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handlePollChange = (idx: number, val: string) => {
    const updated = [...pollOptions];
    updated[idx] = val;
    setPollOptions(updated);
  };

  const handleSubmit = async () => {
    if (currentLength === 0 || isOverLimit || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const filteredOptions = showPoll ? pollOptions.map(o => o.trim()).filter(o => o.length > 0) : undefined;
      await onSubmitPost(text, filteredOptions && filteredOptions.length >= 2 ? filteredOptions : undefined);
      setText('');
      setShowPoll(false);
      setPollOptions(['', '']);
      onPostCreated();
    } catch (err) {
      console.error('Failed to submit post', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-[#2f3336] p-4 flex gap-3">
      {/* User Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex-shrink-0 flex items-center justify-center font-bold text-white text-base">
        U
      </div>

      <div className="flex-1 flex flex-col">
        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-transparent text-white placeholder-[#71767b] text-lg outline-none resize-none"
        />

        {/* Poll Builder Drawer */}
        {showPoll && (
          <div className="my-3 p-3 border border-[#2f3336] rounded-xl flex flex-col gap-2 bg-[#16181c]">
            <div className="flex items-center justify-between text-xs text-[#71767b] font-semibold mb-1">
              <span>Create Poll (2 to 4 options)</span>
              <button
                type="button"
                onClick={() => setShowPoll(false)}
                className="hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {pollOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handlePollChange(idx, e.target.value)}
                  placeholder={`Choice ${idx + 1}`}
                  className="flex-1 bg-black border border-[#2f3336] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePollOption(idx)}
                    className="p-1 hover:text-red-400 text-[#71767b]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={handleAddPollOption}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs font-semibold mt-1 w-fit"
              >
                <Plus className="w-4 h-4" /> Add option
              </button>
            )}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between border-t border-[#2f3336] pt-3 mt-1">
          <div className="flex items-center gap-1 text-sky-400">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-sky-500/10 transition"
              title="Media"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className={`p-2 rounded-full hover:bg-sky-500/10 transition ${showPoll ? 'text-sky-300 bg-sky-500/20' : ''}`}
              title="Poll"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-sky-500/10 transition"
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-sky-500/10 transition"
              title="Schedule"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Radial Indicator */}
            {currentLength > 0 && (
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      className="stroke-[#2f3336]"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      className={
                        isOverLimit
                          ? 'stroke-red-500'
                          : isNearLimit
                          ? 'stroke-amber-400'
                          : 'stroke-sky-500'
                      }
                      strokeWidth="2.5"
                      strokeDasharray="88"
                      strokeDashoffset={88 - (Math.min(currentLength, maxChars) / maxChars) * 88}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                {isNearLimit && (
                  <span className={`text-xs font-semibold ${isOverLimit ? 'text-red-500' : 'text-amber-400'}`}>
                    {remaining}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={currentLength === 0 || isOverLimit || isSubmitting}
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold text-sm px-5 py-2 rounded-full transition"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
