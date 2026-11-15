'use client';

import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Hand,
  MessageSquare,
  Users,
  Shield,
  PhoneOff
} from 'lucide-react';

interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isHost: boolean;
  showChat: boolean;
  showHostPanel: boolean;
  participantCount: number;
  waitingCount: number;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  onToggleChat: () => void;
  onToggleHostPanel: () => void;
  onLeaveCall: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  isHost,
  showChat,
  showHostPanel,
  participantCount,
  waitingCount,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHandRaise,
  onToggleChat,
  onToggleHostPanel,
  onLeaveCall
}) => {
  return (
    <div className="h-20 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between z-40">
      {/* Left Meeting Info */}
      <div className="flex items-center space-x-3 text-xs text-slate-400 hidden sm:flex">
        <span className="font-mono text-slate-300">Room Secure</span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <Users className="w-3.5 h-3.5" />
          <span>{participantCount} participants</span>
        </span>
      </div>

      {/* Center Media Controls */}
      <div className="flex items-center space-x-2.5 mx-auto sm:mx-0">
        <button
          onClick={onToggleMic}
          className={`p-3 rounded-full transition shadow-md ${
            isMuted
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-full transition shadow-md ${
            isVideoOff
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        <button
          onClick={onToggleScreenShare}
          className={`p-3 rounded-full transition shadow-md ${
            isScreenSharing
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Share screen"
        >
          <Monitor className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleHandRaise}
          className={`p-3 rounded-full transition shadow-md ${
            isHandRaised
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Raise hand"
        >
          <Hand className="w-5 h-5" />
        </button>
      </div>

      {/* Right Side Utility & Host Controls */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={onToggleChat}
          className={`p-2.5 rounded-xl border transition flex items-center space-x-1.5 ${
            showChat
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="In-meeting Chat"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs hidden md:inline">Chat</span>
        </button>

        {isHost && (
          <button
            onClick={onToggleHostPanel}
            className={`relative p-2.5 rounded-xl border transition flex items-center space-x-1.5 ${
              showHostPanel
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Host Controls"
          >
            <Shield className="w-4 h-4" />
            <span className="text-xs hidden md:inline">Host Controls</span>
            {waitingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center">
                {waitingCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={onLeaveCall}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center space-x-1.5 transition shadow-lg shadow-rose-600/20"
        >
          <PhoneOff className="w-4 h-4" />
          <span>{isHost ? 'End Call' : 'Leave'}</span>
        </button>
      </div>
    </div>
  );
};
