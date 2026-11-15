'use client';

import React from 'react';
import { Type, Plus, Trash2, Download, Share2, Sparkles, Sliders } from 'lucide-react';
import { MemeTextLayer } from './MemeCanvas';

interface LayerControlsProps {
  layers: MemeTextLayer[];
  onUpdateLayer: (id: string, updates: Partial<MemeTextLayer>) => void;
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onDownload: () => void;
  onSaveToGallery?: () => void;
  onOpenTemplates: () => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  onUpdateLayer,
  onAddLayer,
  onRemoveLayer,
  onDownload,
  onSaveToGallery,
  onOpenTemplates
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Template picker action */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white">Meme Canvas Studio</h2>
          <p className="text-xs text-slate-400">Customize text layers & export</p>
        </div>
        <button
          onClick={onOpenTemplates}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          Change Template
        </button>
      </div>

      {/* Text Layers Inputs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Text Layers ({layers.length})
          </span>
          <button
            onClick={onAddLayer}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Box</span>
          </button>
        </div>

        {layers.map((layer, idx) => (
          <div key={layer.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                {idx === 0 ? 'Top Text' : idx === 1 ? 'Bottom Text' : `Text Box ${idx + 1}`}
              </span>
              {layers.length > 1 && (
                <button
                  onClick={() => onRemoveLayer(layer.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                  title="Remove layer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <input
              type="text"
              value={layer.text}
              onChange={(e) => onUpdateLayer(layer.id, { text: e.target.value })}
              placeholder="Enter caption text..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition uppercase"
            />

            {/* Formatting Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Font Size ({layer.fontSize}px)</label>
                <input
                  type="range"
                  min="16"
                  max="72"
                  value={layer.fontSize}
                  onChange={(e) => onUpdateLayer(layer.id, { fontSize: parseInt(e.target.value, 10) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 justify-end pt-3">
                <label className="flex items-center space-x-1 text-[10px] text-slate-400 cursor-pointer">
                  <span>Color:</span>
                  <input
                    type="color"
                    value={layer.color}
                    onChange={(e) => onUpdateLayer(layer.id, { color: e.target.value })}
                    className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                  />
                </label>

                <label className="flex items-center space-x-1 text-[10px] text-slate-400 cursor-pointer">
                  <span>Stroke:</span>
                  <input
                    type="color"
                    value={layer.strokeColor}
                    onChange={(e) => onUpdateLayer(layer.id, { strokeColor: e.target.value })}
                    className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export & Save Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDownload}
          className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-500/20"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG</span>
        </button>

        {onSaveToGallery && (
          <button
            onClick={onSaveToGallery}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center space-x-2 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Save & Share</span>
          </button>
        )}
      </div>
    </div>
  );
};
