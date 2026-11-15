'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { SidebarNav } from '../components/SidebarNav';
import { TrendingSidebar } from '../components/TrendingSidebar';
import { TimelineComposer } from '../components/TimelineComposer';
import { TweetCard } from '../components/TweetCard';
import { MicroblogApi, Post, TrendingTopic } from '../services/api';

export default function MicroblogHomePage() {
  const [activeTab, setActiveTab] = useState<'for_you' | 'following'>('for_you');
  const [posts, setPosts] = useState<Post[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadPosts, setThreadPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial mock seed if API not running
  const mockPosts: Post[] = [
    {
      id: 'mock_1',
      authorId: 'user_1',
      text: 'Just deployed the new microblogging core for #linkup. Fast, decentralized, grapheme-aware character counting with URL weighting and thread tombstones! 🚀',
      conversationId: 'mock_1',
      parentId: null,
      isDeleted: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: 'user_1',
        username: 'engineering',
        name: 'Linkup Team'
      },
      counts: { likes: 42, reposts: 12, replies: 5 },
      userEngagement: { isLiked: true, isReposted: false }
    },
    {
      id: 'mock_2',
      authorId: 'user_2',
      text: 'What is your primary backend language in 2026? Vote below! #developers #survey',
      conversationId: 'mock_2',
      parentId: null,
      isDeleted: false,
      isEdited: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      author: {
        id: 'user_2',
        username: 'techpolls',
        name: 'Tech Polls'
      },
      poll: {
        id: 'poll_mock',
        options: [
          { id: '1', text: 'TypeScript / Node.js', votesCount: 142 },
          { id: '2', text: 'Go / Rust', votesCount: 98 },
          { id: '3', text: 'Python', votesCount: 64 },
          { id: '4', text: 'Other', votesCount: 21 }
        ],
        totalVotes: 325,
        percentages: [44, 30, 20, 6]
      },
      counts: { likes: 88, reposts: 34, replies: 19 },
      userEngagement: { isLiked: false, isReposted: false }
    }
  ];

  const mockTrending: TrendingTopic[] = [
    { tag: '#linkup', count: 4820 },
    { tag: '#typescript', count: 2150 },
    { tag: '#developers', count: 1890 },
    { tag: '#webdev', count: 1240 },
    { tag: '#ai', count: 980 }
  ];

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const feedData = activeTab === 'for_you'
        ? await MicroblogApi.getForYouFeed()
        : await MicroblogApi.getFollowingFeed();

      if (feedData && feedData.length > 0) {
        setPosts(feedData);
      } else {
        setPosts(mockPosts);
      }
    } catch {
      setPosts(mockPosts);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const trendingData = await MicroblogApi.getTrending();
      if (trendingData && trendingData.length > 0) {
        setTrending(trendingData);
      } else {
        setTrending(mockTrending);
      }
    } catch {
      setTrending(mockTrending);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchTrending();
  }, [activeTab]);

  const handleSelectThread = async (conversationId: string) => {
    setActiveThreadId(conversationId);
    try {
      const threadData = await MicroblogApi.getThread(conversationId);
      if (threadData && threadData.length > 0) {
        setThreadPosts(threadData);
      } else {
        // Fallback to post filtered from existing state
        setThreadPosts(posts.filter(p => p.conversationId === conversationId || p.id === conversationId));
      }
    } catch {
      setThreadPosts(posts.filter(p => p.conversationId === conversationId || p.id === conversationId));
    }
  };

  const handleCreatePost = async (text: string, pollOptions?: string[]) => {
    await MicroblogApi.createPost(text, activeThreadId || undefined, pollOptions);
    if (activeThreadId) {
      handleSelectThread(activeThreadId);
    } else {
      fetchFeed();
      fetchTrending();
    }
  };

  const handleSearch = async (query: string) => {
    const res = await MicroblogApi.search(query);
    if (res.posts && res.posts.length > 0) {
      setPosts(res.posts);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center selection:bg-sky-500 selection:text-white">
      <div className="flex w-full max-w-7xl justify-between">
        {/* Left Sidebar Navigation */}
        <SidebarNav
          currentTab="home"
          onTabChange={() => setActiveThreadId(null)}
          onOpenComposer={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />

        {/* Center Timeline Feed */}
        <main className="flex-1 max-w-2xl min-h-screen border-r border-[#2f3336]">
          {/* Header */}
          <div className="sticky top-0 z-20 backdrop-blur-md bg-black/80 border-b border-[#2f3336]">
            {activeThreadId ? (
              <div className="flex items-center gap-6 px-4 py-3">
                <button
                  onClick={() => setActiveThreadId(null)}
                  className="p-2 rounded-full hover:bg-[#181818] transition text-[#e7e9ea]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-white">Post</h1>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between px-4 py-3">
                  <h1 className="text-xl font-bold text-white">Home</h1>
                  <Sparkles className="w-5 h-5 text-sky-400" />
                </div>
                {/* Tabs */}
                <div className="flex border-t border-[#2f3336]">
                  <button
                    onClick={() => setActiveTab('for_you')}
                    className="flex-1 py-3.5 text-center text-sm font-bold relative hover:bg-[#181818] transition text-[#e7e9ea]"
                  >
                    <span>For you</span>
                    {activeTab === 'for_you' && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-sky-500 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('following')}
                    className="flex-1 py-3.5 text-center text-sm font-bold relative hover:bg-[#181818] transition text-[#71767b]"
                  >
                    <span>Following</span>
                    {activeTab === 'following' && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-sky-500 rounded-full" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <TimelineComposer
            onPostCreated={() => {
              if (activeThreadId) {
                handleSelectThread(activeThreadId);
              } else {
                fetchFeed();
                fetchTrending();
              }
            }}
            onSubmitPost={handleCreatePost}
            placeholder={activeThreadId ? "Post your reply" : "What is happening?!"}
            parentId={activeThreadId}
          />

          {/* Feed Content */}
          <div className="flex flex-col">
            {activeThreadId ? (
              threadPosts.map((post) => (
                <TweetCard
                  key={post.id}
                  post={post}
                  onRefresh={() => handleSelectThread(activeThreadId)}
                  onSelectThread={handleSelectThread}
                />
              ))
            ) : (
              posts.map((post) => (
                <TweetCard
                  key={post.id}
                  post={post}
                  onRefresh={fetchFeed}
                  onSelectThread={handleSelectThread}
                />
              ))
            )}
          </div>
        </main>

        {/* Right Sidebar (Search, Trending, Suggestions) */}
        <TrendingSidebar
          trending={trending}
          onSearch={handleSearch}
          onTagClick={(tag) => handleSearch(tag)}
        />
      </div>
    </div>
  );
}
