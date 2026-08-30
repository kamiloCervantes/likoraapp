'use client';

import React, { useState } from 'react';
import { Search, Bell, PanelLeft, Command } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export function TopHeader() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="bg-white border-b border-slate-100 px-6 md:px-10 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-10 shadow-2xs">
      {/* Left: Sidebar Toggle Icon matching screenshot */}
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Toggle Sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Universal Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cédula, usuario, transacción..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          <div className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 py-1 px-3 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sistemas Operativos</span>
        </Badge>

        <button
          type="button"
          className="relative p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
