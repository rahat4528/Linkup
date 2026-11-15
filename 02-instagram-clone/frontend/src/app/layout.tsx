import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Visual Media Discovery Platform',
  description: 'Visual-first mobile-friendly photographic carousels, reels, and stories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
