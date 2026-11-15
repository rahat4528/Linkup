'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Settings, Sparkles, Volume2 } from 'lucide-react';

interface DevicePreviewProps {
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onJoin: (settings: { isMuted: boolean; isVideoOff: boolean }) => void;
  roomTitle?: string;
  isHost?: boolean;
}

export const DevicePreview: React.FC<DevicePreviewProps> = ({
  displayName,
  onDisplayNameChange,
  onJoin,
  roomTitle = 'Team Conference',
  isHost = false
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [audioLevel, setAudioLevel] = useState(25);

  // Simulate microphone VU meter pulsation
  useEffect(() => {
    if (isMuted) {
      setAudioLevel(0);
      return;
    }

    const interval = setInterval(() => {
      const noise = Math.floor(Math.random() * 45) + 15;
      setAudioLevel(noise);
    }, 150);

    return () => clearInterval(interval);
  }, [isMuted]);

  return (
    <div className="max-w-xl w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">{roomTitle}</h2>
        <p className="text-xs text-slate-400 mt-1">
          {isHost ? 'Start meeting as host' : 'Check your audio and video before entering'}
        </p>
      </div>

      {/* Video Preview Box */}
      <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner group">
        {!isVideoOff ? (
          <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center mx-auto text-white text-2xl font-bold shadow-lg">
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <p className="text-xs text-slate-300 mt-3 font-medium">Camera Feed Active</p>
            </div>

            {/* In-video name tag */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur text-[11px] text-white font-medium flex items-center space-x-1.5">
              <span>{displayName || 'You'}</span>
              {isMuted && <MicOff className="w-3 h-3 text-rose-400" />}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <VideoOff className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-400 mt-3">Camera is turned off</p>
          </div>
        )}

        {/* Quick Media Toggles on Preview */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-full transition shadow-md ${
              isMuted ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-slate-800/80 text-white hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-2.5 rounded-full transition shadow-md ${
              isVideoOff ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-slate-800/80 text-white hover:bg-slate-700'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mic Audio Level VU Meter */}
      <div className="mt-4 flex items-center space-x-3 bg-slate-950/60 px-3.5 py-2.5 rounded-xl border border-slate-800">
        <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Microphone Input Level</span>
            <span>{isMuted ? 'Muted' : `${audioLevel}%`}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 rounded-full ${
                audioLevel > 75 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${audioLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Name Input & Join Action */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <button
          onClick={() => onJoin({ isMuted, isVideoOff })}
          disabled={!displayName.trim()}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-blue-600/20"
        >
          {isHost ? 'Start Meeting' : 'Join Room'}
        </button>
      </div>
    </div>
  );
};
