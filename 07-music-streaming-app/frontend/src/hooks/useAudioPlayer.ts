'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationSeconds: number;
  waveformData: number[];
}

export function useAudioPlayer(initialTrack?: TrackItem | null) {
  const [currentTrack, setCurrentTrack] = useState<TrackItem | null>(initialTrack || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || currentTrack?.durationSeconds || 0);
      setIsBuffering(false);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const playTrack = useCallback((track: TrackItem) => {
    setCurrentTrack(track);
    setDuration(track.durationSeconds);
    setCurrentTime(0);

    if (audioRef.current) {
      // In production point to backend stream URL
      audioRef.current.src = `/api/stream/${track.id}`;
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [isPlaying, currentTrack]);

  const seek = useCallback((timeSeconds: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(timeSeconds, duration || 100));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const seekByPercentage = useCallback((percentage: number) => {
    const total = duration || currentTrack?.durationSeconds || 100;
    const targetSeconds = (percentage / 100) * total;
    seek(targetSeconds);
  }, [duration, currentTrack, seek]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isMuted]);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration: duration || currentTrack?.durationSeconds || 0,
    volume,
    isMuted,
    isBuffering,
    playTrack,
    togglePlay,
    seek,
    seekByPercentage,
    setVolume: handleVolumeChange,
    toggleMute
  };
}
