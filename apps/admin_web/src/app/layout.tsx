import './globals.css';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Users, Package, ShoppingCart, LayoutDashboard } from 'lucide-react';

export const metadata = {
  title: 'Likora Admin Hub - Auditoría KYC & Operaciones',
  description: 'Panel de Control, Catálogo y Cumplimiento Legal de Venta de Alcohol',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30">
              L
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight">Likora Admin</h1>
              <span className="text-xs text-indigo-400 font-medium">Backoffice +18</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/kyc" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-500/20 hover:bg-indigo-600/20 transition">
              <ShieldCheck size={18} />
              <span>Auditoría KYC</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
              <ShoppingCart size={18} />
              <span>Pedidos</span>
            </Link>
            <Link href="/admin/catalog" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
              <Package size={18} />
              <span>Catálogo Licores</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
              <Users size={18} />
              <span>Usuarios</span>
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
            <span>v1.0.0 Monorepo</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
