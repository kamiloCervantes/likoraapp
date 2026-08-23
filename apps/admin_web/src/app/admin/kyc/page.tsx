'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Eye,
  AlertTriangle,
  Search,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

interface KycItem {
  id: string;
  user_id: string;
  user_display_name: string;
  user_email: string;
  document_type: string;
  extracted_birth_date: string;
  calculated_age: number;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  rejection_reason?: string;
  verified_at?: string;
  expires_at?: string;
  submitted_at: string;
}

type TabType = 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'ALL';

export default function KycAuditListPage() {
  const [items, setItems] = useState<KycItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('PENDING_REVIEW');

  const fetchKycList = async (tab: TabType) => {
    try {
      setLoading(true);
      const url = `http://localhost:3000/api/v1/admin/kyc/list?status=${tab}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json || [];
        setItems(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error('Error fetching KYC list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycList(activeTab);
  }, [activeTab]);

  const filteredItems = items.filter((item) => {
    const name = item.user_display_name || '';
    const email = item.user_email || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (item: KycItem) => {
    if (item.status === 'VERIFIED') {
      const isExpired = item.expires_at ? new Date(item.expires_at) <= new Date() : false;
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          isExpired ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          <CheckCircle2 size={13} />
          {isExpired ? 'Aprobada (Expirada)' : 'Aprobada (Vigente 1h)'}
        </span>
      );
    }

    if (item.status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <XCircle size={13} />
          Rechazada
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <Clock size={13} />
        Pendiente Revisión
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6 bg-slate-950 min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-indigo-400" size={28} />
            Auditoría de Verificación KYC (+18)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Revisa, aprueba (vigencia de 1h) o rechaza solicitudes de mayoría de edad legal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings/storage"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold transition border border-indigo-500/30"
          >
            ⚙️ Configurar Buckets
          </Link>
          <button
            onClick={() => fetchKycList(activeTab)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('PENDING_REVIEW')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'PENDING_REVIEW'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={14} />
            Pendientes
          </button>

          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'VERIFIED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 size={14} />
            Aprobadas
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'REJECTED'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <XCircle size={14} />
            Rechazadas
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'ALL'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Filter size={14} />
            Todas
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por usuario o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {loading && items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw size={28} className="animate-spin mx-auto text-indigo-500 mb-3" />
            Cargando solicitudes...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <UserCheck size={44} className="mx-auto text-slate-600" />
            <div className="text-white font-medium text-base">No hay solicitudes en esta sección</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'PENDING_REVIEW'
                ? '¡Bandeja al día! No hay verificaciones pendientes de auditar.'
                : 'No se encontraron registros para la pestaña seleccionada.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Usuario</th>
                  <th className="py-4 px-6">Tipo Doc</th>
                  <th className="py-4 px-6">Edad</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6">Fecha Envío / Vigencia</th>
                  <th className="py-4 px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{item.user_display_name}</div>
                      <div className="text-xs text-slate-400">{item.user_email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300 font-semibold">
                        {item.document_type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.calculated_age < 18
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {item.calculated_age} años
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(item)}
                      {item.rejection_reason && (
                        <div className="text-xs text-rose-400/80 mt-1 max-w-xs truncate" title={item.rejection_reason}>
                          Motivo: {item.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      <div>Recibido: {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'Reciente'}</div>
                      {item.expires_at && item.status === 'VERIFIED' && (
                        <div className="text-emerald-400/80 text-[11px] font-mono mt-0.5">
                          Vence: {new Date(item.expires_at).toLocaleTimeString()}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/kyc/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
                      >
                        <Eye size={14} />
                        Auditar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
