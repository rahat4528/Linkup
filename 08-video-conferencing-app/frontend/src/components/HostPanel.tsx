'use client';

import React from 'react';
import { Lock, Unlock, Check, X, MicOff, UserMinus, ShieldAlert, Users } from 'lucide-react';
import { ParticipantTile } from './MeetingStage';

export interface WaitingParticipant {
  peerId: string;
  displayName: string;
}

interface HostPanelProps {
  isLocked: boolean;
  waitingQueue: WaitingParticipant[];
  participants: ParticipantTile[];
  onToggleLock: () => void;
  onAdmit: (peerId: string) => void;
  onReject: (peerId: string) => void;
  onRemoteMute: (peerId: string) => void;
  onExpel: (peerId: string) => void;
  onClose: () => void;
}

export const HostPanel: React.FC<HostPanelProps> = ({
  isLocked,
  waitingQueue,
  participants,
  onToggleLock,
  onAdmit,
  onReject,
  onRemoteMute,
  onExpel,
  onClose
}) => {
  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-30">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Host Controls</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Room Security Options */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Room Security</h4>
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5">
              {isLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-slate-400" />}
              <div>
                <p className="text-xs font-medium text-slate-200">Lock Meeting Room</p>
                <p className="text-[10px] text-slate-400">Prevent new participants from joining</p>
              </div>
            </div>
            <button
              onClick={onToggleLock}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                isLocked ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
        </div>

        {/* Waiting Room Admission Queue */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Waiting Room ({waitingQueue.length})
            </h4>
          </div>

          {waitingQueue.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
              No participants currently waiting.
            </p>
          ) : (
            <div className="space-y-2">
              {waitingQueue.map((wp) => (
                <div
                  key={wp.peerId}
                  className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800"
                >
                  <span className="text-xs text-slate-200 font-medium truncate max-w-[120px]">
                    {wp.displayName}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onAdmit(wp.peerId)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="Admit"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onReject(wp.peerId)}
                      className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
                      title="Deny"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Participants Management */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            In Meeting ({participants.length})
          </h4>

          <div className="space-y-2">
            {participants.map((p) => (
              <div
                key={p.peerId}
                className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800"
              >
                <div className="truncate max-w-[130px]">
                  <p className="text-xs text-slate-200 font-medium truncate">{p.displayName}</p>
                  <span className="text-[10px] text-slate-400">{p.role}</span>
                </div>

                {p.role !== 'HOST' && (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onRemoteMute(p.peerId)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 border border-slate-700"
                      title="Mute Participant"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onExpel(p.peerId)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700"
                      title="Expel Participant"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
