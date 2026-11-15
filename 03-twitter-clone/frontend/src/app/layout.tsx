import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Microblog — Linkup',
  description: 'Fast, real-time microblogging and discovery platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-[#e7e9ea] min-h-screen antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
