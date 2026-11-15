'use client';

import React, { useRef, useEffect, useCallback } from 'react';

export interface MemeTextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  align: 'left' | 'center' | 'right';
  uppercase: boolean;
}

interface MemeCanvasProps {
  imageUrl: string;
  layers: MemeTextLayer[];
  width?: number;
  height?: number;
  onExportReady?: (dataUrl: string) => void;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({
  imageUrl,
  layers,
  width = 600,
  height = 600,
  onExportReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw base image scaled to canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw text layers
      layers.forEach((layer) => {
        const textToRender = layer.uppercase !== false ? layer.text.toUpperCase() : layer.text;
        if (!textToRender) return;

        ctx.font = `bold ${layer.fontSize || 36}px ${layer.fontFamily || 'Impact'}, Arial, sans-serif`;
        ctx.textAlign = layer.align || 'center';
        ctx.textBaseline = 'middle';

        // Draw stroke outline
        ctx.strokeStyle = layer.strokeColor || '#000000';
        ctx.lineWidth = layer.strokeWidth !== undefined ? layer.strokeWidth : 4;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(textToRender, layer.x, layer.y);

        // Draw fill text
        ctx.fillStyle = layer.color || '#ffffff';
        ctx.fillText(textToRender, layer.x, layer.y);
      });

      if (onExportReady) {
        try {
          const url = canvas.toDataURL('image/png');
          onExportReady(url);
        } catch {
          // Ignore cross-origin canvas security errors in dev preview
        }
      }
    };
  }, [imageUrl, layers, onExportReady]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div className="relative aspect-square max-w-[500px] w-full mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block w-full h-full object-contain"
      />
    </div>
  );
};
