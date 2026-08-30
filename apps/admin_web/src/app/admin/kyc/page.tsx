'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  ArrowRight,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';

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
        setItems(json.data || []);
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
    const q = searchTerm.toLowerCase();
    return (
      (item.user_display_name || '').toLowerCase().includes(q) ||
      (item.user_email || '').toLowerCase().includes(q) ||
      (item.document_type || '').toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string, expiresAt?: string) => {
    if (status === 'VERIFIED') {
      const isExpired = expiresAt && new Date(expiresAt).getTime() < Date.now();
      if (isExpired) {
        return <Badge variant="warning">Vencida (+1h)</Badge>;
      }
      return <Badge variant="success">Aprobada (+18)</Badge>;
    }
    if (status === 'REJECTED') {
      return <Badge variant="destructive">Rechazada</Badge>;
    }
    return <Badge variant="warning">Pendiente</Badge>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Auditoría de Identidad (KYC)</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Supervisión y cumplimiento legal +18 con vigencia temporal para venta y despacho de alcohol.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground shadow-xs">
          {[
            { id: 'PENDING_REVIEW', label: 'Pendientes' },
            { id: 'VERIFIED', label: 'Aprobadas' },
            { id: 'REJECTED', label: 'Rechazadas' },
            { id: 'ALL', label: 'Todas' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabType)}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none',
                activeTab === t.id && 'bg-background text-foreground shadow-xs font-semibold'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nombre o email..."
            className="pl-9 h-9"
          />
        </div>

        <Button variant="outline" size="sm" onClick={() => fetchKycList(activeTab)} disabled={loading}>
          <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} />
          Actualizar
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
              Cargando auditorías...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-1">
              <ShieldCheck className="w-6 h-6 mx-auto text-muted-foreground" />
              <div className="font-semibold text-foreground text-sm">Sin registros</div>
              <p>No se encontraron solicitudes para este filtro.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Usuario & Email</th>
                    <th className="py-3 px-4">Documento</th>
                    <th className="py-3 px-4">Edad Calculada</th>
                    <th className="py-3 px-4">Estado KYC</th>
                    <th className="py-3 px-4">Fecha Solicitud</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{item.user_display_name || 'Sin Nombre'}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{item.user_email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-mono">{item.document_type || 'Cédula'}</td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {item.calculated_age ? `${item.calculated_age} años` : 'Pendiente'}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(item.status, item.expires_at)}</td>
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">{new Date(item.submitted_at).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/admin/kyc/${item.id}`}>
                          <Button size="sm" variant="default" className="h-7 text-[11px] px-2.5">
                            Auditar <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
