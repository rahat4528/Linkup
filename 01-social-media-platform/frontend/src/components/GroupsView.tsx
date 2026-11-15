'use client';

import React, { useState } from 'react';
import { Users, Plus, Shield, Globe, Lock } from 'lucide-react';

interface Props {
  groups: any[];
  onCreateGroup: (data: { name: string; description: string; privacy: string }) => void;
  onJoinGroup: (groupId: string) => void;
}

export function GroupsView({ groups, onCreateGroup, onJoinGroup }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('PUBLIC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateGroup({ name: name.trim(), description: description.trim(), privacy });
    setName('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Communities & Groups</h2>
          <p className="text-xs text-gray-500">Connect around shared technical topics, hobbies, and ideas.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Community</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  <Users className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 border border-gray-200 text-gray-600">
                  {group.privacy === 'PUBLIC' ? (
                    <>
                      <Globe className="w-3 h-3 text-emerald-600" /> Public
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-amber-600" /> Private
                    </>
                  )}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{group.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                {group.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">{group.memberCount || 1} members</span>
              {group.isMember ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Member
                </span>
              ) : (
                <button
                  onClick={() => onJoinGroup(group.id)}
                  className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-md transition cursor-pointer"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-4">Create New Group</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Enthusiasts"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="What is this community about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Privacy Level</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PUBLIC">Public — Anyone can view and join</option>
                  <option value="PRIVATE">Private — Content visible only to approved members</option>
                </select>
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
