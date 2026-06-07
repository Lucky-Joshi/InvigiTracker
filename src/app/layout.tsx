import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'InvigiTracker - Invigilation Management System',
  description: 'Manage invigilators, exam duties, attendance, centres, and payments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
