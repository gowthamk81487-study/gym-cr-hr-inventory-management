import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '../components/common/Toast';

export const metadata: Metadata = {
  title: 'Gym HR, Memberships & Inventory System - The Gym Fitness Club',
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
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
