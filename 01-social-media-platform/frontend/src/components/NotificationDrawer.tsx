'use client';

import React from 'react';
import { Bell, CheckCircle2, UserCheck, MessageSquare, Heart } from 'lucide-react';

interface Props {
  notifications: any[];
  onClose: () => void;
}

export function NotificationDrawer({ notifications, onClose }: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'REACTION':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'COMMENT':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-100 z-50 flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-lg border text-xs transition flex gap-3 ${
                n.isRead
                  ? 'bg-white border-gray-100 text-gray-600'
                  : 'bg-emerald-50/40 border-emerald-100 text-gray-900 font-medium'
              }`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
              <div>
                <p className="font-semibold text-gray-900 mb-0.5">{n.title}</p>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-1">{n.message}</p>
                <span className="text-[10px] text-gray-400">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
