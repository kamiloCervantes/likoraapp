'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Eye, AlertTriangle, Search, RefreshCw, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface KycItem {
  id: string;
  user_id: string;
  user_display_name: string;
  user_email: string;
  document_type: string;
  extracted_birth_date: string;
  calculated_age: number;
  status: string;
  submitted_at: string;
}

export default function KycAuditListPage() {
  const [items, setItems] = useState<KycItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPendingKyc = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/v1/admin/kyc/pending');
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json || [];
        setItems(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error('Error fetching KYC pending list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKyc();
  }, []);

  const filteredItems = items.filter((item) => {
    const name = item.user_display_name || '';
    const email = item.user_email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
            Revisión y validación legal de documentos para habilitación de compra de alcohol en Likora
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/settings/storage" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold transition border border-indigo-500/30">⚙️ Configurar Buckets</Link>
          <button
            onClick={fetchPendingKyc}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            {items.length} Solicitudes Pendientes
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre de cliente o correo electrónico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {loading && items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw size={28} className="animate-spin mx-auto text-indigo-500 mb-3" />
            Cargando solicitudes pendientes desde la base de datos...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <UserCheck size={44} className="mx-auto text-emerald-500/60" />
            <div className="text-white font-medium text-base">¡Bandeja al día!</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hay solicitudes pendientes de validación de edad en este momento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Usuario</th>
                  <th className="py-4 px-6">Tipo Doc</th>
                  <th className="py-4 px-6">Fecha Nacimiento</th>
                  <th className="py-4 px-6">Edad Calculada</th>
                  <th className="py-4 px-6">Fecha Envío</th>
                  <th className="py-4 px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{item.user_display_name || 'Sin Nombre'}</div>
                      <div className="text-xs text-slate-400">{item.user_email || 'Sin Correo'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300 font-semibold">
                        {item.document_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                      {item.extracted_birth_date}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          item.calculated_age < 18
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : item.calculated_age === 18
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.calculated_age <= 18 && <AlertTriangle size={12} />}
                        {item.calculated_age} años
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'Reciente'}
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
