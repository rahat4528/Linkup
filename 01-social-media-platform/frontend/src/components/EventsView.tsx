'use client';

import React, { useState } from 'react';
import { Calendar, Plus, MapPin, Clock, Users } from 'lucide-react';

interface Props {
  events: any[];
  onCreateEvent: (data: { title: string; description: string; location: string; eventDate: string }) => void;
  onRsvp: (eventId: string, status: string) => void;
}

export function EventsView({ events, onCreateEvent, onRsvp }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;
    onCreateEvent({ title: title.trim(), description: description.trim(), location: location.trim(), eventDate });
    setTitle('');
    setDescription('');
    setLocation('');
    setEventDate('');
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Community Events</h2>
          <p className="text-xs text-gray-500">Discover upcoming meetups, conferences, and virtual sessions.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Host Event</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {events.map((evt) => (
          <div key={evt.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-emerald-800 shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {new Date(evt.eventDate).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-lg font-extrabold leading-tight">
                  {new Date(evt.eventDate).getDate()}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{evt.title}</h3>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">{evt.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(evt.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {evt.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {evt.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {evt.goingCount || 0} Going
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onRsvp(evt.id, 'GOING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  evt.userRsvp === 'GOING'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Going
              </button>
              <button
                onClick={() => onRsvp(evt.id, 'INTERESTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  evt.userRsvp === 'INTERESTED'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Interested
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-4">Host Community Event</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virtual Tech Meetup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Event agenda and details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Location or Link</label>
                <input
                  type="text"
                  placeholder="Online (Link) or Physical Address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Date and Time</label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
