import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linkup Meet — Real-Time Video Conferencing',
  description: 'Multi-party WebRTC video meetings with waiting room admission, host controls, screen sharing, and audio level monitoring.',
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
