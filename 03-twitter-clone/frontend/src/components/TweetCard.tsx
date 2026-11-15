'use client';

import React, { useState } from 'react';
import { MessageCircle, Repeat2, Heart, Share, Info, CheckCircle2 } from 'lucide-react';
import { Post, MicroblogApi } from '../services/api';

interface TweetCardProps {
  post: Post;
  onRefresh: () => void;
  onSelectThread: (conversationId: string) => void;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  post,
  onRefresh,
  onSelectThread
}) => {
  const [isLiked, setIsLiked] = useState(post.userEngagement?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.counts?.likes || 0);
  const [isReposted, setIsReposted] = useState(post.userEngagement?.isReposted || false);
  const [repostsCount, setRepostsCount] = useState(post.counts?.reposts || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [poll, setPoll] = useState(post.poll);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await MicroblogApi.toggleLike(post.id);
      setIsLiked(res.liked);
      setLikesCount(prev => (res.liked ? prev + 1 : Math.max(prev - 1, 0)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await MicroblogApi.toggleRepost(post.id);
      setIsReposted(res.reposted);
      setRepostsCount(prev => (res.reposted ? prev + 1 : Math.max(prev - 1, 0)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (e: React.MouseEvent, optionIndex: number) => {
    e.stopPropagation();
    if (!poll || isVoting) return;

    try {
      setIsVoting(true);
      const res = await MicroblogApi.votePoll(poll.id, optionIndex);
      if (res && res.poll) {
        setPoll(res.poll);
      }
    } catch (err) {
      console.error('Vote failed', err);
    } finally {
      setIsVoting(false);
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <article
      onClick={() => onSelectThread(post.conversationId || post.id)}
      className="border-b border-[#2f3336] p-4 flex gap-3 hover:bg-[#080808] transition cursor-pointer"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-white text-base">
        {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Author Header */}
        <div className="flex items-center gap-1.5 text-sm leading-tight">
          <span className="font-bold text-[#e7e9ea] hover:underline">
            {post.author?.name || 'Anonymous User'}
          </span>
          <span className="text-[#71767b]">
            @{post.author?.username || 'user'}
          </span>
          <span className="text-[#71767b]">·</span>
          <span className="text-[#71767b]">{formatTime(post.createdAt)}</span>

          {post.isEdited && (
            <span className="text-xs text-[#71767b] border border-[#2f3336] px-1.5 py-0.5 rounded ml-1">
              Edited
            </span>
          )}
        </div>

        {/* Post Text */}
        <p className="text-[15px] text-[#e7e9ea] mt-1 whitespace-pre-wrap leading-relaxed">
          {post.text}
        </p>

        {/* Poll Component */}
        {poll && (
          <div className="mt-3 p-3 rounded-2xl border border-[#2f3336] bg-[#16181c]/60 flex flex-col gap-2">
            {poll.options.map((option, idx) => {
              const pct = poll.percentages?.[idx] || 0;
              return (
                <button
                  key={option.id || idx}
                  onClick={(e) => handleVote(e, idx)}
                  disabled={isVoting}
                  className="relative overflow-hidden w-full text-left border border-[#2f3336] hover:border-sky-500 rounded-xl px-4 py-2.5 transition flex items-center justify-between"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-sky-500/20 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                  <span className="relative z-10 text-sm font-medium text-white">
                    {option.text}
                  </span>
                  <span className="relative z-10 text-xs font-semibold text-[#71767b]">
                    {pct}%
                  </span>
                </button>
              );
            })}
            <div className="text-xs text-[#71767b] px-1 pt-1">
              {poll.totalVotes || 0} votes · Final results
            </div>
          </div>
        )}

        {/* Community Note Callout */}
        {post.communityNotes && post.communityNotes.length > 0 && (
          <div className="mt-3 p-3 rounded-xl border border-sky-500/30 bg-sky-950/20 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
              <Info className="w-4 h-4" />
              <span>Readers added context they thought people might want to know</span>
            </div>
            {post.communityNotes.map((note) => (
              <p key={note.id} className="text-xs text-sky-100/90 leading-normal pl-5">
                {note.text}
              </p>
            ))}
          </div>
        )}

        {/* Engagement Action Bar */}
        <div className="flex items-center justify-between text-[#71767b] mt-3 pt-1 max-w-md">
          {/* Reply */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectThread(post.conversationId || post.id);
            }}
            className="flex items-center gap-2 group hover:text-sky-400 transition"
          >
            <div className="p-2 rounded-full group-hover:bg-sky-500/10 transition">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-xs">{post.counts?.replies || 0}</span>
          </button>

          {/* Repost */}
          <button
            onClick={handleRepost}
            className={`flex items-center gap-2 group transition ${isReposted ? 'text-emerald-500' : 'hover:text-emerald-400'}`}
          >
            <div className="p-2 rounded-full group-hover:bg-emerald-500/10 transition">
              <Repeat2 className="w-4 h-4" />
            </div>
            <span className="text-xs">{repostsCount}</span>
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 group transition ${isLiked ? 'text-rose-500' : 'hover:text-rose-400'}`}
          >
            <div className="p-2 rounded-full group-hover:bg-rose-500/10 transition">
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            </div>
            <span className="text-xs">{likesCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 group hover:text-sky-400 transition"
          >
            <div className="p-2 rounded-full group-hover:bg-sky-500/10 transition">
              <Share className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </article>
  );
};
