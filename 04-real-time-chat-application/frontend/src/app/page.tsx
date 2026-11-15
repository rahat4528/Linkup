'use client';

import React, { useState, useEffect } from 'react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';
import { NewChatModal } from '../components/NewChatModal';
import { Conversation, ChatApi } from '../services/api';

export default function ChatAppHomePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUserId = 'usr_current_demo_user';

  // Seed mock conversations if backend isn't populated
  const mockConversations: Conversation[] = [
    {
      id: 'mock_conv_1',
      type: 'DIRECT',
      members: [
        {
          userId: 'usr_sarah',
          role: 'MEMBER',
          name: 'Sarah Connor',
          username: 'sarah_c'
        }
      ],
      lastMessage: {
        id: 'msg_m1',
        senderId: 'usr_sarah',
        content: 'Hey, did you review the real-time websocket specs?',
        createdAt: new Date().toISOString()
      },
      unreadCount: 1
    },
    {
      id: 'mock_conv_2',
      type: 'GROUP',
      title: 'DevOps & Infrastructure',
      members: [
        { userId: 'usr_1', role: 'OWNER', name: 'DevOps Lead', username: 'devops' },
        { userId: currentUserId, role: 'MEMBER', name: 'You', username: 'you' }
      ],
      lastMessage: {
        id: 'msg_m2',
        senderId: 'usr_1',
        content: 'Postgres 16 and Redis cluster metrics look fantastic!',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      unreadCount: 0
    }
  ];

  const fetchConversations = async () => {
    try {
      const data = await ChatApi.getConversations();
      if (data && data.length > 0) {
        setConversations(data);
        if (!activeConversationId) {
          setActiveConversationId(data[0].id);
        }
      } else {
        setConversations(mockConversations);
        if (!activeConversationId) {
          setActiveConversationId(mockConversations[0].id);
        }
      }
    } catch {
      setConversations(mockConversations);
      if (!activeConversationId) {
        setActiveConversationId(mockConversations[0].id);
      }
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onOpenNewChat={() => setIsModalOpen(true)}
      />

      {/* Main Chat Stream */}
      <ChatWindow
        conversation={activeConversation}
        currentUserId={currentUserId}
        onRefreshConversations={fetchConversations}
      />

      {/* New Conversation Modal */}
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newId) => {
          fetchConversations();
          setActiveConversationId(newId);
        }}
      />
    </div>
  );
}
