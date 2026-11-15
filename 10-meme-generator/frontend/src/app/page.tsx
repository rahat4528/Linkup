'use client';

import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Flame, Download, ThumbsUp, Layers } from 'lucide-react';
import { MemeCanvas, MemeTextLayer } from '../components/MemeCanvas';
import { LayerControls } from '../components/LayerControls';
import { TemplatePicker, TemplateItem } from '../components/TemplatePicker';

const initialTemplates: TemplateItem[] = [
  {
    id: 'tmpl-diverging-paths',
    name: 'Two Diverging Paths',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop',
    category: 'Decisions'
  },
  {
    id: 'tmpl-eureka-moment',
    name: 'Eureka Breakthrough',
    imageUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=600&fit=crop',
    category: 'Reactions'
  },
  {
    id: 'tmpl-unshakable-optimism',
    name: 'Unshakable Optimism',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&fit=crop',
    category: 'Classic'
  }
];

export default function MemeStudioPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem>(initialTemplates[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Layers state
  const [layers, setLayers] = useState<MemeTextLayer[]>([
    {
      id: 'top-text',
      text: 'ONE DOES NOT SIMPLY',
      x: 250,
      y: 50,
      fontSize: 32,
      fontFamily: 'Impact',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      align: 'center',
      uppercase: true
    },
    {
      id: 'bottom-text',
      text: 'DEPLOY ON FRIDAY EVENING',
      x: 250,
      y: 450,
      fontSize: 32,
      fontFamily: 'Impact',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      align: 'center',
      uppercase: true
    }
  ]);

  // Gallery memes
  const [gallery, setGallery] = useState([
    {
      id: '1',
      title: 'Deploying on Friday',
      upvotes: 142,
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop',
      topText: 'WRITE TESTS FIRST',
      bottomText: 'PUSH TO PROD'
    },
    {
      id: '2',
      title: 'Cache Invalidation',
      upvotes: 98,
      imageUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=600&fit=crop',
      topText: 'TWO HARD PROBLEMS IN CS',
      bottomText: 'CACHE AND NAMING THINGS'
    }
  ]);

  const handleUpdateLayer = (id: string, updates: Partial<MemeTextLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleAddLayer = () => {
    const newId = `layer-${Date.now()}`;
    setLayers((prev) => [
      ...prev,
      {
        id: newId,
        text: 'NEW TEXT CAPTION',
        x: 250,
        y: 250,
        fontSize: 28,
        fontFamily: 'Impact',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 4,
        align: 'center',
        uppercase: true
      }
    ]);
  };

  const handleRemoveLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `meme-${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveToGallery = () => {
    const top = layers[0]?.text || 'MEME TITLE';
    const bottom = layers[1]?.text || '';
    setGallery((prev) => [
      {
        id: `m-${Date.now()}`,
        title: top,
        upvotes: 1,
        imageUrl: selectedTemplate.imageUrl,
        topText: top,
        bottomText: bottom
      },
      ...prev
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">MemeForge</span>
              <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50 font-mono">
                Canvas 2D / SVG Engine
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Editor */}
      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Canvas Preview Stage */}
          <div className="lg:col-span-7 space-y-3">
            <MemeCanvas
              imageUrl={selectedTemplate.imageUrl}
              layers={layers}
              width={500}
              height={500}
              onExportReady={setDownloadUrl}
            />
            <p className="text-center text-xs text-slate-500">
              Template: <strong className="text-slate-300">{selectedTemplate.name}</strong> • Real-time Canvas Rendering
            </p>
          </div>

          {/* Editor Controls */}
          <div className="lg:col-span-5">
            <LayerControls
              layers={layers}
              onUpdateLayer={handleUpdateLayer}
              onAddLayer={handleAddLayer}
              onRemoveLayer={handleRemoveLayer}
              onDownload={handleDownload}
              onSaveToGallery={handleSaveToGallery}
              onOpenTemplates={() => setShowPicker(true)}
            />
          </div>
        </div>

        {/* Community Gallery Feed */}
        <section className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-white">Trending Community Memes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-950">
                  <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 right-3 text-center pointer-events-none">
                    <p className="font-extrabold text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase">
                      {m.topText}
                    </p>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
                    <p className="font-extrabold text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase">
                      {m.bottomText}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 truncate">{m.title}</span>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>{m.upvotes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Template Picker Modal */}
      {showPicker && (
        <TemplatePicker
          templates={initialTemplates}
          selectedTemplateId={selectedTemplate.id}
          onSelect={(tmpl) => setSelectedTemplate(tmpl)}
          onClose={() => setShowPicker(false)}
          onUploadCustom={(url) => {
            setSelectedTemplate({
              id: `custom-${Date.now()}`,
              name: 'Custom Image',
              imageUrl: url,
              category: 'Custom'
            });
          }}
        />
      )}
    </div>
  );
}
