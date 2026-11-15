'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Plus, ArrowRight, ShieldCheck, Sparkles, Mic, Monitor } from 'lucide-react';
import { DevicePreview } from '../components/DevicePreview';

export default function MeetingLobbyPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [meetingMode, setMeetingMode] = useState<'lobby' | 'preview'>('lobby');
  const [targetRoomCode, setTargetRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);

  const handleInstantMeeting = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const rand = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const newCode = `${rand()}-${rand()}a-${rand()}`;
    setTargetRoomCode(newCode);
    setIsHost(true);
    setMeetingMode('preview');
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    setTargetRoomCode(roomCodeInput.trim().toLowerCase());
    setIsHost(false);
    setMeetingMode('preview');
  };

  const handleJoinRoom = () => {
    if (!displayName.trim() || !targetRoomCode) return;
    router.push(`/room/${targetRoomCode}?name=${encodeURIComponent(displayName)}&host=${isHost}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">Linkup Meet</span>
              <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/50 font-mono">
                WebRTC SFU
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>E2E Encrypted</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 flex items-center justify-center">
        {meetingMode === 'lobby' ? (
          <div className="grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Left pitch */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Low Latency WebRTC Video</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Secure, seamless video meetings for modern teams.
              </h1>

              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                Crystal clear WebRTC video calls with waiting room admissions, host moderation controls, screen sharing, and integrated mic VU meters.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleInstantMeeting}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/25"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Instant Meeting</span>
                </button>

                <form onSubmit={handleJoinByCode} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter meeting code"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono w-44"
                  />
                  <button
                    type="submit"
                    disabled={!roomCodeInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    Join
                  </button>
                </form>
              </div>
            </div>

            {/* Right preview banner */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
                    <Video className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Ready to connect</p>
                  <p className="text-[10px] text-slate-500">Fast connection via STUN/TURN servers</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80">
                  <Mic className="w-4 h-4 mx-auto text-blue-400" />
                  <p className="text-[10px] text-slate-400 mt-1">Noise Cancelling</p>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80">
                  <Monitor className="w-4 h-4 mx-auto text-blue-400" />
                  <p className="text-[10px] text-slate-400 mt-1">1080p Screen Share</p>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80">
                  <ShieldCheck className="w-4 h-4 mx-auto text-blue-400" />
                  <p className="text-[10px] text-slate-400 mt-1">Waiting Room</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <DevicePreview
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            onJoin={handleJoinRoom}
            roomTitle={isHost ? 'New Meeting Setup' : `Meeting ${targetRoomCode}`}
            isHost={isHost}
          />
        )}
      </main>
    </div>
  );
}
