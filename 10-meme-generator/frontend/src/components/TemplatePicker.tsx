'use client';

import React, { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';

export interface TemplateItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
}

interface TemplatePickerProps {
  templates: TemplateItem[];
  selectedTemplateId: string;
  onSelect: (template: TemplateItem) => void;
  onClose: () => void;
  onUploadCustom?: (imageUrl: string) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
  onClose,
  onUploadCustom
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Decisions', 'Reactions', 'Classic'];

  const filtered = templates.filter(
    (t) => activeCategory === 'All' || t.category.toLowerCase() === activeCategory.toLowerCase()
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadCustom) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUploadCustom(reader.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Choose a Meme Template</h3>
            <p className="text-xs text-slate-400">Select a classic layout or upload your own image</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories & Upload */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  activeCategory === c
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelect(t);
                onClose();
              }}
              className={`group text-left rounded-xl overflow-hidden border transition-all ${
                selectedTemplateId === t.id
                  ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-lg shadow-amber-950/40'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950'
              }`}
            >
              <div className="aspect-square bg-slate-950 overflow-hidden">
                <img
                  src={t.imageUrl}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-2.5 bg-slate-900 truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{t.name}</p>
                <span className="text-[10px] text-slate-500">{t.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
