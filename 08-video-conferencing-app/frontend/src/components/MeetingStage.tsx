'use client';

import React from 'react';
import { MicOff, Hand, Shield, Monitor } from 'lucide-react';

export interface ParticipantTile {
  peerId: string;
  displayName: string;
  role: 'HOST' | 'COHOST' | 'PARTICIPANT';
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  isSpeaking?: boolean;
}

interface MeetingStageProps {
  participants: ParticipantTile[];
  currentPeerId: string;
}

export const MeetingStage: React.FC<MeetingStageProps> = ({ participants, currentPeerId }) => {
  const count = participants.length;

  const getGridCols = () => {
    if (count <= 1) return 'grid-cols-1 max-w-2xl';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl';
    if (count <= 4) return 'grid-cols-2 max-w-5xl';
    return 'grid-cols-2 md:grid-cols-3 max-w-6xl';
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`grid gap-4 w-full mx-auto ${getGridCols()}`}>
        {participants.map((p) => {
          const isMe = p.peerId === currentPeerId;
          const isHost = p.role === 'HOST';

          return (
            <div
              key={p.peerId}
              className={`relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-200 shadow-lg flex items-center justify-center ${
                p.isSpeaking
                  ? 'border-emerald-500 shadow-emerald-950/30 ring-2 ring-emerald-500/50'
                  : 'border-slate-800'
              }`}
            >
              {/* Video Stream or Avatar Box */}
              {!p.isVideoOff ? (
                <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-850 to-indigo-950/40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto text-white text-xl font-bold shadow-md">
                      {p.displayName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400 font-semibold text-xl">
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}

              {/* Hand raised floating badge */}
              {p.isHandRaised && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-md animate-bounce">
                  <Hand className="w-3.5 h-3.5" />
                  <span>Hand Raised</span>
                </div>
              )}

              {/* Screen share indicator */}
              {p.isScreenSharing && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-semibold flex items-center space-x-1 shadow">
                  <Monitor className="w-3 h-3" />
                  <span>Screen</span>
                </div>
              )}

              {/* Bottom Info Pill */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-xs text-white font-medium flex items-center space-x-1.5 truncate max-w-[80%]">
                  <span className="truncate">
                    {p.displayName} {isMe ? '(You)' : ''}
                  </span>
                  {isHost && (
                    <span className="px-1.5 py-0.2 bg-blue-500/30 text-blue-300 rounded text-[10px] font-mono flex items-center space-x-0.5">
                      <Shield className="w-2.5 h-2.5 inline" />
                      <span>Host</span>
                    </span>
                  )}
                </div>

                {p.isMuted && (
                  <div className="p-1 rounded bg-rose-600/90 text-white shadow">
                    <MicOff className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
