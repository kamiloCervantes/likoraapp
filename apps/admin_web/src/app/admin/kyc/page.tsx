'use client';

import React, { useState } from 'react';
import { ShieldCheck, Eye, CheckCircle2, XCircle, AlertTriangle, Search, Filter } from 'lucide-react';
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

const mockKycRequests: KycItem[] = [
  {
    id: 'kyc-001',
    user_id: 'usr-101',
    user_display_name: 'Santiago Morales',
    user_email: 'santiago.m@gmail.com',
    document_type: 'DNI',
    extracted_birth_date: '2004-03-12',
    calculated_age: 22,
    status: 'PENDING_REVIEW',
    submitted_at: 'Hace 5 minutos',
  },
  {
    id: 'kyc-002',
    user_id: 'usr-102',
    user_display_name: 'Valeria Gomez',
    user_email: 'valeria.g@outlook.com',
    document_type: 'PASSPORT',
    extracted_birth_date: '2007-09-20',
    calculated_age: 18,
    status: 'PENDING_REVIEW',
    submitted_at: 'Hace 12 minutos',
  },
  {
    id: 'kyc-003',
    user_id: 'usr-103',
    user_display_name: 'Mateo Fernandez',
    user_email: 'mateo.f@gmail.com',
    document_type: 'DRIVERS_LICENSE',
    extracted_birth_date: '1998-11-04',
    calculated_age: 27,
    status: 'PENDING_REVIEW',
    submitted_at: 'Hace 25 minutos',
  },
];

export default function KycAuditListPage() {
  const [items, setItems] = useState<KycItem[]>(mockKycRequests);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(
    (item) =>
      item.user_display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user_email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-indigo-400" size={28} />
            Auditoría de Verificación KYC (+18)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Revisión y validación legal de documentos para habilitación de compra de alcohol
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            {items.length} Solicitudes Pendientes
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o correo electrónico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Usuario</th>
              <th className="py-4 px-6">Tipo Doc</th>
              <th className="py-4 px-6">Fecha Nacimiento</th>
              <th className="py-4 px-6">Edad Calculada</th>
              <th className="py-4 px-6">Recibido</th>
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
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300">
                    {item.document_type}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                  {item.extracted_birth_date}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.calculated_age === 18
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {item.calculated_age === 18 && <AlertTriangle size={12} />}
                    {item.calculated_age} años
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-400 text-xs">{item.submitted_at}</td>
                <td className="py-4 px-6 text-right">
                  <Link
                    href={`/admin/kyc/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition"
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
    </div>
  );
}
