'use client';

import React, { useEffect, useState } from 'react';
import { BottomTabBar } from '../components/BottomTabBar';
import { StoryTray } from '../components/StoryTray';
import { CarouselPost } from '../components/CarouselPost';
import { ReelsView } from '../components/ReelsView';
import { ExploreView } from '../components/ExploreView';
import { ProfileView } from '../components/ProfileView';
import { NewPostModal } from '../components/NewPostModal';
import { api } from '../services/api';
import { Camera, Send, PlusCircle } from 'lucide-react';

export default function InstagramCloneApp() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('feed');
  const [feed, setFeed] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [explorePosts, setExplorePosts] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');

  const loadFeed = async () => {
    try {
      const res = await api.getFeed();
      setFeed(res.feed || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAuxData = async () => {
    try {
      const [storyRes, reelRes, expRes] = await Promise.all([
        api.getStories().catch(() => ({ stories: [] })),
        api.getReels().catch(() => ({ reels: [] })),
        api.getExplore().catch(() => ({ explore: [], trendingTags: [] })),
      ]);
      setStories(storyRes.stories || []);
      setReels(reelRes.reels || []);
      setExplorePosts(expRes.explore || []);
      setTrendingTags(expRes.trendingTags || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProfile = async (targetUsername?: string) => {
    try {
      const uname = targetUsername || currentUser?.username;
      if (uname) {
        const data = await api.getProfile(uname);
        setProfileData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setShowAuthModal(true);
    } else {
      // Load mock/active session
      handleQuickLogin('elena@example.com');
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadFeed();
      loadAuxData();
      if (currentTab === 'profile') {
        loadProfile();
      }
    }
  }, [currentUser, currentTab]);

  const handleQuickLogin = async (userEmail: string) => {
    setAuthError('');
    try {
      const res = await api.login({ email: userEmail, password: 'Password123!' });
      api.setToken(res.token);
      setCurrentUser(res.user);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      let res;
      if (authMode === 'login') {
        res = await api.login({ email, password });
      } else {
        res = await api.register({ email, password, name, username });
      }
      api.setToken(res.token);
      setCurrentUser(res.user);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.toggleLike(postId);
      setFeed((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: res.isLiked, likesCount: res.totalLikes }
            : p
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (postId: string, text: string) => {
    try {
      const res = await api.addComment(postId, text);
      setFeed((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...(p.comments || []),
                  { id: res.comment.id, author: currentUser.username, content: text },
                ],
              }
            : p
        )
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreatePost = async (postData: any) => {
    try {
      await api.createPost(postData);
      await loadFeed();
      setCurrentTab('feed');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateStory = async () => {
    const url = prompt('Enter image URL for your 24h story:', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800');
    if (!url) return;
    try {
      await api.createStory(url);
      await loadAuxData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-2.5 flex items-center justify-between max-w-lg mx-auto w-full">
        <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
          Instagram Clone
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewPostModal(true)}
            className="text-gray-800 hover:text-black cursor-pointer"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
          <button className="text-gray-800 hover:text-black cursor-pointer">
            <Send className="w-5 h-5 -rotate-12" />
          </button>
        </div>
      </header>

      {/* Main Tab View */}
      <main className="flex-1 max-w-lg mx-auto w-full bg-white min-h-screen shadow-xs">
        {currentTab === 'feed' && (
          <div>
            <StoryTray
              stories={stories}
              currentUser={currentUser}
              onCreateStory={handleCreateStory}
            />
            {feed.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400">
                Your visual feed is empty. Follow creators or post a carousel photo!
              </div>
            ) : (
              feed.map((post) => (
                <CarouselPost
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              ))
            )}
          </div>
        )}

        {currentTab === 'explore' && (
          <ExploreView
            explore={explorePosts}
            trendingTags={trendingTags}
            onSelectTag={(tag) => alert(`Browsing hashtag #${tag}`)}
          />
        )}

        {currentTab === 'reels' && <ReelsView reels={reels} />}

        {currentTab === 'profile' && (
          <ProfileView
            profileData={profileData}
            onEditProfile={() => alert('Profile editing modal')}
          />
        )}
      </main>

      {/* Bottom Mobile Tab Bar */}
      <BottomTabBar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'create') {
            setShowNewPostModal(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        currentUser={currentUser}
      />

      {/* New Post / Carousel Composer Modal */}
      {showNewPostModal && (
        <NewPostModal
          onClose={() => setShowNewPostModal(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="font-bold text-center text-lg mb-1">Visual Discovery Platform</h2>
            <p className="text-xs text-center text-gray-500 mb-4">
              Sign in to explore photographic carousels and reels
            </p>

            {authError && (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-3">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              {authMode === 'register' && (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </>
              )}
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition"
              >
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-400 mb-2">Or quick login with demo creators:</p>
              <div className="flex justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('elena@example.com')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-medium rounded"
                >
                  Elena (Public)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('marcus@example.com')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-medium rounded"
                >
                  Marcus
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('sophia@example.com')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-medium rounded"
                >
                  Sophia (Private)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
