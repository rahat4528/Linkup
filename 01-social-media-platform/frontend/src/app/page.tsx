'use client';

import React, { useEffect, useState } from 'react';
import { NavigationSidebar } from '../components/NavigationSidebar';
import { RightSidebar } from '../components/RightSidebar';
import { StoryReel } from '../components/StoryReel';
import { PostComposer } from '../components/PostComposer';
import { PostCard } from '../components/PostCard';
import { GroupsView } from '../components/GroupsView';
import { EventsView } from '../components/EventsView';
import { FriendsView } from '../components/FriendsView';
import { ProfileModal } from '../components/ProfileModal';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { api } from '../services/api';
import { Sparkles, Clock, LogIn, UserPlus } from 'lucide-react';

export default function SocialMediaApp() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('feed');
  const [feedMode, setFeedMode] = useState<'ranked' | 'chronological'>('ranked');
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');

  const loadUserData = async () => {
    try {
      const data = await api.getMe();
      setCurrentUser(data.user);
      setCurrentProfile(data.profile);
      setShowAuthModal(false);
    } catch {
      setShowAuthModal(true);
    }
  };

  const loadFeed = async () => {
    try {
      const res = await api.getFeed(feedMode);
      setPosts(res.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSidebarAndAux = async () => {
    try {
      const [storyRes, groupRes, evtRes, friendRes, suggRes, notifRes] = await Promise.all([
        api.getStories().catch(() => ({ stories: [] })),
        api.getGroups().catch(() => ({ groups: [] })),
        api.getEvents().catch(() => ({ events: [] })),
        api.getFriends().catch(() => ({ friends: [] })),
        api.getSuggestions().catch(() => ({ suggestions: [] })),
        api.getNotifications().catch(() => ({ notifications: [] })),
      ]);

      setStories(storyRes.stories || []);
      setGroups(groupRes.groups || []);
      setEvents(evtRes.events || []);
      setFriends(friendRes.friends || []);
      setSuggestions(suggRes.suggestions || []);
      setNotifications(notifRes.notifications || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadFeed();
      loadSidebarAndAux();
    }
  }, [currentUser, feedMode]);

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
      await loadUserData();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleQuickDemoLogin = async (userEmail: string) => {
    setAuthError('');
    try {
      const res = await api.login({ email: userEmail, password: 'Password123!' });
      api.setToken(res.token);
      await loadUserData();
    } catch (err: any) {
      setAuthError(err.message || 'Quick login failed');
    }
  };

  const handlePublishPost = async (postData: any) => {
    try {
      await api.createPost(postData);
      await loadFeed();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReact = async (postId: string, type: string) => {
    try {
      await api.reactToPost(postId, type);
      await loadFeed();
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      await api.addComment(postId, content);
      await loadFeed();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleBlockUser = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to block this user? Mutual connections will be severed.')) return;
    try {
      await api.blockUser(targetUserId);
      await loadFeed();
      await loadSidebarAndAux();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReport = async (postId: string) => {
    const reason = prompt('Select report reason (SPAM, HARASSMENT, HATE_SPEECH, INAPPROPRIATE):', 'SPAM');
    if (!reason) return;
    try {
      await api.reportContent('POST', postId, reason);
      alert('Report submitted to moderation queue.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleConnect = async (targetUserId: string) => {
    try {
      const res = await api.sendFriendRequest(targetUserId);
      alert(res.message);
      await loadSidebarAndAux();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRsvp = async (eventId: string, status: string) => {
    try {
      await api.rsvpEvent(eventId, status);
      await loadSidebarAndAux();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateStory = async (mediaUrl: string, caption?: string) => {
    try {
      await api.createStory(mediaUrl, caption);
      await loadSidebarAndAux();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'notifications') {
      setShowNotifications(true);
    } else if (tab === 'profile') {
      setShowProfileModal(true);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* 1. Left Navigation Column */}
      <NavigationSidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
        unreadCount={notifications.filter((n) => !n.isRead).length}
      />

      {/* 2. Central Content Column */}
      <main className="flex-1 max-w-2xl mx-auto py-6 px-4">
        {currentTab === 'feed' && (
          <div>
            <StoryReel stories={stories} onCreateStory={handleCreateStory} />
            <PostComposer onPublish={handlePublishPost} currentUser={currentUser} />

            {/* Feed Mode Toggle */}
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-sm font-bold text-gray-800">Activity Stream</h2>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 text-xs shadow-2xs">
                <button
                  onClick={() => setFeedMode('ranked')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                    feedMode === 'ranked'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalized</span>
                </button>
                <button
                  onClick={() => setFeedMode('chronological')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                    feedMode === 'chronological'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Latest</span>
                </button>
              </div>
            </div>

            {/* Feed Stream */}
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-xs text-gray-400">
                No posts in this feed yet. Share an update above to start the conversation!
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id}
                  onReact={handleReact}
                  onComment={handleComment}
                  onBlock={handleBlockUser}
                  onReport={handleReport}
                />
              ))
            )}
          </div>
        )}

        {currentTab === 'groups' && (
          <GroupsView
            groups={groups}
            onCreateGroup={async (data) => {
              await api.createGroup(data);
              await loadSidebarAndAux();
            }}
            onJoinGroup={async (id) => {
              await api.joinGroup(id);
              await loadSidebarAndAux();
            }}
          />
        )}

        {currentTab === 'events' && (
          <EventsView
            events={events}
            onCreateEvent={async (data) => {
              await api.createEvent(data);
              await loadSidebarAndAux();
            }}
            onRsvp={handleRsvp}
          />
        )}

        {currentTab === 'friends' && (
          <FriendsView
            friends={friends}
            onUnfriend={async (id) => {
              await api.request(`/friends/${id}`, { method: 'DELETE' });
              await loadSidebarAndAux();
            }}
          />
        )}
      </main>

      {/* 3. Right Sidebar Column */}
      <RightSidebar
        suggestions={suggestions}
        events={events}
        onConnect={handleConnect}
        onRsvp={handleRsvp}
      />

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={currentUser}
          profile={currentProfile}
          onClose={() => setShowProfileModal(false)}
          onUpdate={async (data) => {
            await api.updateProfile(data);
            await loadUserData();
          }}
          onDeleteAccount={async () => {
            if (confirm('Permanently delete your account and all data?')) {
              await api.request('/users/me', { method: 'DELETE' });
              api.setToken(null);
              setCurrentUser(null);
              setShowProfileModal(false);
              setShowAuthModal(true);
            }
          }}
        />
      )}

      {/* Notification Drawer */}
      {showNotifications && (
        <NotificationDrawer
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                L
              </div>
              <h2 className="font-bold text-gray-900 text-lg">
                {authMode === 'login' ? 'Welcome Back to Linkup' : 'Create Linkup Account'}
              </h2>
              <p className="text-xs text-gray-500">
                {authMode === 'login'
                  ? 'Sign in to access your social community'
                  : 'Join friends, groups, and community events'}
              </p>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2.5 rounded-lg mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="janedoe"
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg mt-2 shadow-xs transition cursor-pointer"
              >
                {authMode === 'login' ? 'Sign In' : 'Register'}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-400 mb-2">Or quick sign-in with demo accounts:</p>
              <div className="flex justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('alice@example.com')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-medium rounded transition cursor-pointer"
                >
                  Alice
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('bob@example.com')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-medium rounded transition cursor-pointer"
                >
                  Bob
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('charlie@example.com')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-medium rounded transition cursor-pointer"
                >
                  Charlie
                </button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs text-emerald-600 hover:underline font-medium cursor-pointer"
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
