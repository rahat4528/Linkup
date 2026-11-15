'use client';

import React from 'react';
import { Loader2, ShieldCheck, Clock } from 'lucide-react';

interface WaitingRoomProps {
  roomTitle: string;
  roomCode: string;
  displayName: string;
  onCancel: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  roomTitle,
  roomCode,
  displayName,
  onCancel
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Waiting for Host to Admit You</h2>
          <p className="text-sm text-slate-300 font-medium mt-1">{roomTitle}</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Code: {roomCode}</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <p>
            You are waiting as <strong className="text-slate-200">{displayName}</strong>.
          </p>
          <div className="flex items-center justify-center space-x-2 text-slate-400 pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>The meeting host will let you in shortly...</span>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
        >
          Cancel & Leave
        </button>
      </div>
    </div>
  );
};
