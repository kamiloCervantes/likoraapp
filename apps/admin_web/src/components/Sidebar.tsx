'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Settings,
  CreditCard,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const generalItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard, exact: true },
    { label: 'Auditoría KYC (+18)', href: '/admin/kyc', icon: ShieldCheck },
    { label: 'Categorías', href: '/admin/categories', icon: Layers },
    { label: 'Productos & Stock', href: '/admin/products', icon: Package },
    { label: 'Pedidos & Despachos', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Usuarios & Clientes', href: '/admin/users', icon: Users },
  ];

  const toolsItems = [
    { label: 'Configuración General', href: '/admin/settings', icon: Settings },
  ];

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-w-[16rem] bg-[#181440] flex flex-col justify-between flex-shrink-0 min-h-screen text-white select-none shadow-2xl border-r border-indigo-950">
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-[#2e266d] border border-white/10 flex items-center justify-center text-white shadow-inner">
            <CreditCard className="w-5 h-5 text-indigo-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white leading-none">Likora Admin</span>
            <span className="text-[10px] text-[#928cb8] mt-1 font-medium">Backoffice Suite</span>
          </div>
        </div>

        <div className="px-4 py-4 space-y-6">
          <div>
            <div className="px-3 px-2 text-[11px] font-semibold text-[#928cb8] uppercase tracking-wider">General</div>
            <nav className="space-y-1">
              {generalItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                      active ? 'bg-[#3b3388] text-white shadow-md font-semibold ring-1 ring-white/10' : 'text-[#a5a0cb] hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', active ? 'text-white' : 'text-[#8b84b5]')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-[#928cb8] uppercase tracking-wider">Tools & Config</div>
            <nav className="space-y-1">
              {toolsItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                      active ? 'bg-[#3b3388] text-white shadow-md font-semibold ring-1 ring-white/10' : 'text-[#a5a0cb] hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', active ? 'text-white' : 'text-[#8b84b5]')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="p-4 m-4 bg-[#120f33] border border-white/5 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#3b3388] text-white font-bold text-xs flex items-center justify-center ring-1 ring-white/20">LA</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white truncate">Likora Admin</div>
          <div className="text-[10px] text-[#928cb8] truncate">admin@likora.app</div>
        </div>
      </div>
    </aside>
  );
}