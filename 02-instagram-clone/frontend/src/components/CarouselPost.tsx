'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, ChevronLeft, ChevronRight, MapPin, MoreHorizontal } from 'lucide-react';

interface Props {
  post: any;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
}

export function CarouselPost({ post, onLike, onComment }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const mediaSlides = post.media || [];

  const handleNext = () => {
    if (currentSlide < mediaSlides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <article className="bg-white border-b border-gray-100 pb-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-800">
              {post.author?.username?.charAt(0) || 'U'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-gray-900 leading-tight">
                {post.author?.username || 'user'}
              </span>
              {post.author?.isVerified && (
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">
                  ✓
                </span>
              )}
            </div>
            {post.location && (
              <p className="text-[10px] text-gray-500 flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 text-gray-400" />
                <span>{post.location}</span>
              </p>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-700 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Media Carousel */}
      <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
        {mediaSlides.length > 0 ? (
          <img
            src={mediaSlides[currentSlide]?.url}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover select-none"
          />
        ) : (
          <div className="text-xs text-gray-500">No media available</div>
        )}

        {/* Carousel Slide Counter */}
        {mediaSlides.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {currentSlide + 1}/{mediaSlides.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {mediaSlides.length > 1 && currentSlide > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 w-7 h-7 rounded-full bg-white/70 hover:bg-white text-gray-900 flex items-center justify-center shadow-md transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {mediaSlides.length > 1 && currentSlide < mediaSlides.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 w-7 h-7 rounded-full bg-white/70 hover:bg-white text-gray-900 flex items-center justify-center shadow-md transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Slide Pagination Dots */}
        {mediaSlides.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1">
            {mediaSlides.map((_: any, idx: number) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-blue-500 w-3' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post.id)}
            className="cursor-pointer transition hover:scale-110"
          >
            <Heart
              className={`w-6 h-6 ${
                post.isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-800'
              }`}
            />
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-gray-800 hover:text-black cursor-pointer"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="text-gray-800 hover:text-black cursor-pointer">
            <Send className="w-5 h-5 -rotate-12" />
          </button>
        </div>
        <button className="text-gray-800 hover:text-black cursor-pointer">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {/* Likes Count */}
      <div className="px-4 mb-1">
        <p className="text-xs font-bold text-gray-900">
          {post.likesCount || 0} like{post.likesCount === 1 ? '' : 's'}
        </p>
      </div>

      {/* Caption & Hashtags */}
      {post.caption && (
        <div className="px-4 text-xs leading-relaxed text-gray-800 mb-2">
          <span className="font-bold mr-1.5 text-gray-900">{post.author?.username}</span>
          <span>{post.caption}</span>
        </div>
      )}

      {/* Comments Preview */}
      {post.comments && post.comments.length > 0 && (
        <div className="px-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-[11px] text-gray-400 block mb-1 hover:underline cursor-pointer"
          >
            View all {post.comments.length} comments
          </button>
          {showComments && (
            <div className="flex flex-col gap-1.5 my-2">
              {post.comments.map((c: any) => (
                <div key={c.id} className="text-xs">
                  <span className="font-semibold text-gray-900 mr-1.5">{c.author}</span>
                  <span className="text-gray-700">{c.content}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inline Comment Input */}
      <form onSubmit={handleCommentSubmit} className="px-4 mt-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full text-xs placeholder-gray-400 focus:outline-none py-1"
        />
        {commentText.trim() && (
          <button
            type="submit"
            className="text-xs font-bold text-blue-500 hover:text-blue-700 cursor-pointer"
          >
            Post
          </button>
        )}
      </form>
    </article>
  );
}
