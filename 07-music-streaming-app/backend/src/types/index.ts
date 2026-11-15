export interface UserPayload {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'CREATOR' | 'ADMIN';
}

export interface RangeRequest {
  start: number;
  end: number;
  chunkSize: number;
  totalSize: number;
  isValid: boolean;
  contentRange: string;
}

export interface WaveformOptions {
  bins: number;
  normalizeMax?: number;
}

export interface AudioMetadata {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  durationSeconds: number;
  fileSize: number;
  mimeType: string;
  waveformData: number[];
}
