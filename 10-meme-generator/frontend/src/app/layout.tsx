import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MemeForge — Interactive Meme Graphic Generator',
  description: 'Multi-layer meme canvas editor with custom typography, SVG/raster compositing, and instant export.',
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
