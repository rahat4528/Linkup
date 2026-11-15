'use client';

import React, { useState } from 'react';
import { ThumbsUp, Heart, Award, MessageSquare, MoreHorizontal, ShieldAlert, UserX, Globe, Users, Lock } from 'lucide-react';

interface Props {
  post: any;
  currentUserId: string;
  onReact: (postId: string, type: string) => void;
  onComment: (postId: string, content: string) => void;
  onBlock: (targetUserId: string) => void;
  onReport: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onReact, onComment, onBlock, onReport }: Props) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText.trim());
    setCommentText('');
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'PUBLIC':
        return <Globe className="w-3 h-3 text-gray-400" title="Public" />;
      case 'FRIENDS':
        return <Users className="w-3 h-3 text-emerald-600" title="Friends Only" />;
      case 'ONLY_ME':
        return <Lock className="w-3 h-3 text-amber-600" title="Only Me" />;
      default:
        return null;
    }
  };

  return (
    <article className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            {post.author?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">{post.author?.name || 'Anonymous'}</span>
              {getVisibilityIcon()}
              {post.isEdited && <span className="text-[10px] text-gray-400">(edited)</span>}
            </div>
            <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onReport(post.id);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Report Post</span>
              </button>
              {post.authorId !== currentUserId && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onBlock(post.authorId);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <UserX className="w-4 h-4 text-red-600" />
                  <span>Block Author</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <p className="text-sm text-gray-800 whitespace-pre-line mb-3 leading-relaxed">{post.content}</p>

      {/* Media Attachment if available */}
      {post.mediaUrl && (
        <div className="rounded-lg overflow-hidden border border-gray-100 mb-3 bg-gray-50">
          <img src={post.mediaUrl} alt="Attached media" className="w-full max-h-96 object-cover" />
        </div>
      )}

      {/* Reactions Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500 mb-2">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-700">{post.reactionsCount || 0}</span>
          <span>reactions</span>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:underline cursor-pointer"
        >
          {post.commentsCount || 0} comments
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around border-t border-gray-100 pt-1">
        <button
          onClick={() => onReact(post.id, 'LIKE')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
            post.userReaction === 'LIKE' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Like</span>
        </button>
        <button
          onClick={() => onReact(post.id, 'LOVE')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
            post.userReaction === 'LOVE' ? 'text-rose-600 bg-rose-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Love</span>
        </button>
        <button
          onClick={() => onReact(post.id, 'CELEBRATE')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
            post.userReaction === 'CELEBRATE' ? 'text-amber-600 bg-amber-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Celebrate</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition cursor-pointer"
            >
              Reply
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
