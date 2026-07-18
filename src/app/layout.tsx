import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '../components/common/Toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gym HR, Memberships & Inventory System - Provolution Technologies',
  description: 'Interactive MVP Portal for Client Continuity, Coach Scheduling, Payments Ledgers, and Health Club Logistics Management.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
