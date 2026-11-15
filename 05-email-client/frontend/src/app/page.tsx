'use client';

import React, { useState, useEffect } from 'react';
import { EmailSidebar } from '../components/EmailSidebar';
import { EmailList } from '../components/EmailList';
import { EmailView } from '../components/EmailView';
import { ComposeModal } from '../components/ComposeModal';
import { EmailThread, EmailMessage, EmailLabel, EmailApi } from '../services/api';

export default function WebmailHomePage() {
  const [currentFolder, setCurrentFolder] = useState<string>('INBOX');
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [labels, setLabels] = useState<EmailLabel[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<EmailThread | null>(null);
  const [activeMessages, setActiveMessages] = useState<EmailMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Fallback initial seeds
  const mockThreads: EmailThread[] = [
    {
      id: 'mock_t1',
      normalizedSubject: 'Welcome to your Linkup Webmail Inbox',
      snippet: 'Your IMAP and SMTP configurations are active. Try composing, labeling, or threading replies.',
      folder: 'INBOX',
      isStarred: true,
      isRead: false,
      messageCount: 1,
      lastMessageAt: new Date().toISOString(),
      from: 'system@linkup.local',
      labels: [{ id: 'lbl_1', name: 'Work', color: '#10b981' }]
    },
    {
      id: 'mock_t2',
      normalizedSubject: 'Quarterly Security Audit & RFC Conformance',
      snippet: 'We have concluded the RFC 5322 conversation threading verification tests.',
      folder: 'INBOX',
      isStarred: false,
      isRead: true,
      messageCount: 2,
      lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
      from: 'security@linkup.local',
      labels: [{ id: 'lbl_2', name: 'Urgent', color: '#ef4444' }]
    }
  ];

  const mockLabels: EmailLabel[] = [
    { id: 'lbl_1', name: 'Work', color: '#10b981' },
    { id: 'lbl_2', name: 'Urgent', color: '#ef4444' },
    { id: 'lbl_3', name: 'Personal', color: '#8b5cf6' }
  ];

  const fetchThreads = async () => {
    try {
      const data = await EmailApi.listEmails(currentFolder, selectedLabelId || undefined);
      if (data && data.length > 0) {
        setThreads(data);
      } else {
        setThreads(mockThreads);
      }
    } catch {
      setThreads(mockThreads);
    }
  };

  const fetchLabels = async () => {
    try {
      const data = await EmailApi.listLabels();
      if (data && data.length > 0) {
        setLabels(data);
      } else {
        setLabels(mockLabels);
      }
    } catch {
      setLabels(mockLabels);
    }
  };

  useEffect(() => {
    fetchThreads();
    fetchLabels();
  }, [currentFolder, selectedLabelId]);

  const handleSelectThread = async (threadId: string) => {
    setActiveThreadId(threadId);
    try {
      const result = await EmailApi.getThreadMessages(threadId);
      if (result) {
        setActiveThread(result.thread);
        setActiveMessages(result.messages);
      } else {
        // Fallback to thread from state
        const fallback = threads.find(t => t.id === threadId);
        if (fallback) {
          setActiveThread(fallback);
          setActiveMessages([
            {
              id: 'mock_m1',
              threadId: fallback.id,
              messageId: '<welcome@linkup.local>',
              from: fallback.from,
              to: ['you@linkup.local'],
              cc: [],
              bcc: [],
              subject: fallback.normalizedSubject,
              bodyHtml: `<p>${fallback.snippet}</p>`,
              references: [],
              isDraft: false,
              date: fallback.lastMessageAt
            }
          ]);
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleToggleStar = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await EmailApi.toggleStar(threadId);
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, isStarred: !t.isStarred } : t))
    );
  };

  const handleMoveFolder = async (threadId: string, folder: string) => {
    await EmailApi.moveToFolder(threadId, folder);
    setActiveThreadId(null);
    fetchThreads();
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      fetchThreads();
      return;
    }
    const results = await EmailApi.search(q);
    setThreads(results);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <EmailSidebar
        currentFolder={currentFolder}
        selectedLabelId={selectedLabelId}
        labels={labels}
        onSelectFolder={(f) => {
          setSelectedLabelId(null);
          setCurrentFolder(f);
          setActiveThreadId(null);
        }}
        onSelectLabel={(lid) => {
          setSelectedLabelId(lid);
          setActiveThreadId(null);
        }}
        onOpenCompose={() => setIsComposeOpen(true)}
      />

      {/* Main Content Area */}
      {activeThreadId && activeThread ? (
        <EmailView
          thread={activeThread}
          messages={activeMessages}
          onBack={() => setActiveThreadId(null)}
          onRefresh={() => handleSelectThread(activeThreadId)}
          onToggleStar={handleToggleStar}
          onMoveFolder={handleMoveFolder}
        />
      ) : (
        <EmailList
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          onToggleStar={handleToggleStar}
          onRefresh={fetchThreads}
          onSearch={handleSearch}
          searchQuery={searchQuery}
        />
      )}

      {/* Floating Compose Dialog */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSent={fetchThreads}
      />
    </div>
  );
}
