'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { Loader2, ShieldCheck } from 'lucide-react';

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // If on /login page, render only login page without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If still checking authentication status, show loading splash
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0d0b24] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#1d174d] border border-white/10 flex items-center justify-center shadow-xl animate-pulse">
          <ShieldCheck className="w-7 h-7 text-amber-400" />
        </div>
        <div className="flex items-center gap-2 text-sm text-[#9f98c8]">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Verificando credenciales de administrador...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, avoid flashing dashboard before redirect
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated admin layout
  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 antialiased">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8fafc]">
        <TopHeader />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
