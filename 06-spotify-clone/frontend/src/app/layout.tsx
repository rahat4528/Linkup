import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spotify Clone — Linkup',
  description: 'Music catalog discovery and streaming playback platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white min-h-screen antialiased select-none">
        {children}
      </body>
    </html>
  );
}
