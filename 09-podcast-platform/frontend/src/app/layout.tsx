import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CastFlow — Independent Podcast Publishing Platform',
  description: 'Podcast creator platform with RSS 2.0 XML feeds, chapter navigation, and clean distribution.',
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
