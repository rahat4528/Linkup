'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasWaveformProps {
  waveformData: number[]; // Peaks 0..100
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  height?: number;
  barWidth?: number;
  barGap?: number;
}

export const CanvasWaveform: React.FC<CanvasWaveformProps> = ({
  waveformData = [],
  currentTime,
  duration,
  onSeek,
  height = 64,
  barWidth = 3,
  barGap = 2
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, width, h);

    if (!waveformData || waveformData.length === 0) {
      return;
    }

    const totalBars = Math.floor(width / (barWidth + barGap));
    const step = waveformData.length / totalBars;

    for (let i = 0; i < totalBars; i++) {
      const dataIndex = Math.min(Math.floor(i * step), waveformData.length - 1);
      const peak = waveformData[dataIndex] || 5;

      const barHeight = Math.max(4, (peak / 100) * (h - 8));
      const x = i * (barWidth + barGap);
      const y = (h - barHeight) / 2;

      const barProgress = x / width;

      // Color based on playback progress
      if (barProgress <= progress) {
        // Played region (gradient cyan-blue)
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#818cf8');
        ctx.fillStyle = grad;
      } else {
        // Unplayed region
        ctx.fillStyle = '#334155';
      }

      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }

    // Draw hover guide line if hovering
    if (hoverPercent !== null) {
      const hoverX = (hoverPercent / 100) * width;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [waveformData, progress, hoverPercent, height, barWidth, barGap]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = height;
        drawWaveform();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWaveform, height]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setHoverPercent(percent);
    setHoverTime((percent / 100) * (duration || 0));
  };

  const handleMouseLeave = () => {
    setHoverPercent(null);
    setHoverTime(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || duration <= 0) return;

    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const seekTime = (x / rect.width) * duration;
    onSeek(seekTime);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-pointer select-none group"
      style={{ height: `${height}px` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {hoverTime !== null && hoverPercent !== null && (
        <div
          className="absolute -top-7 px-2 py-0.5 text-[10px] font-mono font-medium bg-slate-900 border border-slate-700 text-slate-200 rounded shadow pointer-events-none transform -translate-x-1/2 transition-opacity"
          style={{ left: `${hoverPercent}%` }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
};
