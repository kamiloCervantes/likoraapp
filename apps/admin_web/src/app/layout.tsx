import './globals.css';
import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';

export const metadata = {
  title: 'Likora Admin - Suite de Gestión',
  description: 'Panel de Control, Cumplimiento Legal +18 y Operaciones de Likora',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex antialiased">
        {/* Fixed Left Sidebar (Always Visible) */}
        <Sidebar />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8fafc]">
          <TopHeader />
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
