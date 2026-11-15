'use client';

import React from 'react';
import { UserPlus, Calendar, Clock } from 'lucide-react';

interface Props {
  suggestions: any[];
  events: any[];
  onConnect: (userId: string) => void;
  onRsvp: (eventId: string, status: string) => void;
}

export function RightSidebar({ suggestions, events, onConnect, onRsvp }: Props) {
  return (
    <aside className="w-80 p-4 flex flex-col gap-6 shrink-0 border-l border-gray-100 bg-white min-h-screen">
      {/* Suggested Connections */}
      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Suggested Friends</h3>
          <span className="text-xs text-gray-500">Based on connections</span>
        </div>
        <div className="flex flex-col gap-3">
          {suggestions.length === 0 ? (
            <p className="text-xs text-gray-400">No suggestions right now.</p>
          ) : (
            suggestions.map((item) => (
              <div key={item.user.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {item.user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-900 truncate">{item.user.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {item.mutualCount} mutual friend{item.mutualCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onConnect(item.user.id)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md flex items-center gap-1 shrink-0 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Upcoming Events</h3>
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex flex-col gap-3">
          {events.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming events scheduled.</p>
          ) : (
            events.slice(0, 3).map((evt) => (
              <div key={evt.id} className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-2xs">
                <p className="text-xs font-semibold text-gray-900 mb-1">{evt.title}</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{new Date(evt.eventDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onRsvp(evt.id, 'GOING')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded border transition ${
                      evt.userRsvp === 'GOING'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Going ({evt.goingCount || 0})
                  </button>
                  <button
                    onClick={() => onRsvp(evt.id, 'INTERESTED')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded border transition ${
                      evt.userRsvp === 'INTERESTED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Interested
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
