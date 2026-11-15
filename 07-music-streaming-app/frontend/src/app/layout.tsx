import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StreamWave - High Fidelity Audio Streaming Player',
  description: 'Minimalist music streaming player with HTTP Range request slicing, dynamic canvas waveform visualization, and dockable compact player.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
