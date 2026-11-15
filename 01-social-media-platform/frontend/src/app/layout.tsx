import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Linkup — Community Social Network',
  description: 'General-purpose social networking, groups, events, and community feeds.',
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
