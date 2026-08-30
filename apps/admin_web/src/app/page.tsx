'use client';

import React from 'react';
import {
  ShieldCheck,
  Settings,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
  Wine,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome Likora Admin!
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Panel de operaciones en tiempo real, auditoría KYC y métricas del sistema.
        </p>
      </div>

      {/* KPI Cards Grid (Matching reference screenshot exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Total Facturación</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            $152.9K
          </div>
          <div className="text-xs font-bold text-emerald-600">
            +15.0 / month
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Ventas Completadas</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            $109.3K
          </div>
          <div className="text-xs font-bold text-emerald-600">
            +10.47 / month
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Auditorías KYC (+18)</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            142
          </div>
          <div className="text-xs font-bold text-amber-600">
            12 pendientes de revisión
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>Usuarios Registrados</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            1,280
          </div>
          <div className="text-xs font-bold text-indigo-600">
            +88 esta semana
          </div>
        </div>
      </div>

      {/* Quick Access Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Link href="/admin/kyc" className="group">
          <div className="bg-white border border-slate-200/80 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Auditoría KYC (+18)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Validación de cédulas, selfies y vigencia de 1 hora.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link href="/admin/settings" className="group">
          <div className="bg-white border border-slate-200/80 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Configuración General</h3>
                <p className="text-xs text-slate-500 mt-0.5">Buckets Cloudflare R2 / S3, Servidor SMTP y Permisos.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
