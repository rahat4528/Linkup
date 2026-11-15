'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MeetingStage, ParticipantTile } from '../../../components/MeetingStage';
import { ControlBar } from '../../../components/ControlBar';
import { HostPanel, WaitingParticipant } from '../../../components/HostPanel';
import { WaitingRoom } from '../../../components/WaitingRoom';

export default function MeetingRoomPage({ params }: { params: { roomCode: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayName = searchParams.get('name') || 'Guest';
  const isHost = searchParams.get('host') === 'true';

  // Room state
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(!isHost && params.roomCode === 'eng-sync-2026');
  const [isLocked, setIsLocked] = useState(false);
  const [showHostPanel, setShowHostPanel] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // User media state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Active participants list
  const [participants, setParticipants] = useState<ParticipantTile[]>([
    {
      peerId: isHost ? 'my-peer-id' : 'host-sarah',
      displayName: isHost ? `${displayName} (Host)` : 'Sarah Connor (Host)',
      role: 'HOST',
      isMuted: false,
      isVideoOff: false,
      isHandRaised: false,
      isScreenSharing: false,
      isSpeaking: true
    },
    {
      peerId: isHost ? 'peer-john' : 'my-peer-id',
      displayName: isHost ? 'John Reese' : `${displayName} (You)`,
      role: 'PARTICIPANT',
      isMuted: isHost ? true : isMuted,
      isVideoOff: isHost ? false : isVideoOff,
      isHandRaised: isHost ? true : isHandRaised,
      isScreenSharing: false
    }
  ]);

  // Host waiting room queue
  const [waitingQueue, setWaitingQueue] = useState<WaitingParticipant[]>([
    { peerId: 'wait-101', displayName: 'Marcus Wright' }
  ]);

  // In-meeting chat messages
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Sarah Connor', text: 'Welcome everyone! We are starting the sprint demo now.', time: '10:00' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Host Controls Handlers
  const handleAdmit = (peerId: string) => {
    const toAdmit = waitingQueue.find((w) => w.peerId === peerId);
    if (!toAdmit) return;

    setWaitingQueue((prev) => prev.filter((w) => w.peerId !== peerId));
    setParticipants((prev) => [
      ...prev,
      {
        peerId: toAdmit.peerId,
        displayName: toAdmit.displayName,
        role: 'PARTICIPANT',
        isMuted: true,
        isVideoOff: false,
        isHandRaised: false,
        isScreenSharing: false
      }
    ]);
  };

  const handleReject = (peerId: string) => {
    setWaitingQueue((prev) => prev.filter((w) => w.peerId !== peerId));
  };

  const handleRemoteMute = (peerId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.peerId === peerId ? { ...p, isMuted: true } : p))
    );
  };

  const handleExpel = (peerId: string) => {
    setParticipants((prev) => prev.filter((p) => p.peerId !== peerId));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: displayName,
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  if (isInWaitingRoom) {
    return (
      <WaitingRoom
        roomTitle="Weekly Core Engineering Sync"
        roomCode={params.roomCode}
        displayName={displayName}
        onCancel={() => router.push('/')}
      />
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Meeting Stage & Sidebars */}
      <div className="flex-1 flex overflow-hidden relative">
        <MeetingStage participants={participants} currentPeerId="my-peer-id" />

        {/* In-Meeting Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-30">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">In-Call Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-200">{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 break-words">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 flex space-x-2">
              <input
                type="text"
                placeholder="Send a message to everyone..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Host Control Panel */}
        {showHostPanel && isHost && (
          <HostPanel
            isLocked={isLocked}
            waitingQueue={waitingQueue}
            participants={participants}
            onToggleLock={() => setIsLocked(!isLocked)}
            onAdmit={handleAdmit}
            onReject={handleReject}
            onRemoteMute={handleRemoteMute}
            onExpel={handleExpel}
            onClose={() => setShowHostPanel(false)}
          />
        )}
      </div>

      {/* Persistent Bottom Control Bar */}
      <ControlBar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        isHost={isHost}
        showChat={showChat}
        showHostPanel={showHostPanel}
        participantCount={participants.length}
        waitingCount={waitingQueue.length}
        onToggleMic={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
        onToggleHandRaise={() => setIsHandRaised(!isHandRaised)}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleHostPanel={() => setShowHostPanel(!showHostPanel)}
        onLeaveCall={() => router.push('/')}
      />
    </div>
  );
}
