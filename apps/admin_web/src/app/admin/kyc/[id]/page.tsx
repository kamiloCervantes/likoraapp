'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ZoomIn,
  RotateCw,
  RefreshCw,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function KycDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('BLURRY_IMAGE');
  const [customNotes, setCustomNotes] = useState('');

  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/v1/admin/kyc/${id}`);
      if (res.ok) {
        const json = await res.json();
        setDetail(json.data || json);
      }
    } catch (e) {
      console.error('Error fetching KYC detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const res = await fetch(`http://localhost:3000/api/v1/admin/kyc/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || '✅ ¡Solicitud KYC Aprobada con vigencia de 1 hora!');
        router.push('/admin/kyc');
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'No se pudo aprobar'}`);
      }
    } catch (e: any) {
      alert(`Error de red: ${e.message || e}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      const res = await fetch(`http://localhost:3000/api/v1/admin/kyc/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: rejectReason,
          custom_notes: customNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || '❌ Solicitud marcada como RECHAZADA');
        setShowRejectModal(false);
        router.push('/admin/kyc');
      } else {
        const err = await res.json();
        alert(`Error al rechazar: ${err.message || 'Error desconocido'}`);
      }
    } catch (e: any) {
      alert(`Error de red: ${e.message || e}`);
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 bg-slate-950 min-h-screen">
        <RefreshCw size={32} className="animate-spin mx-auto text-indigo-500 mb-3" />
        Cargando expediente de verificación...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-4 bg-slate-950 min-h-screen">
        <div className="text-lg text-white">No se encontró el expediente KYC.</div>
        <Link href="/admin/kyc" className="text-indigo-400 underline">Volver a la lista</Link>
      </div>
    );
  }

  const isVerified = detail.status === 'VERIFIED';
  const isRejected = detail.status === 'REJECTED';
  const isPending = detail.status === 'PENDING_REVIEW';

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6 bg-slate-950 min-h-screen text-slate-100">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/admin/kyc" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
          <ArrowLeft size={18} />
          Volver a la lista
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isRejecting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition border ${
              isRejected
                ? 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                : 'bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border-rose-500/30'
            }`}
          >
            <XCircle size={16} />
            {isRejected ? 'Actualizar Rechazo' : 'Rechazar'}
          </button>

          <button
            onClick={handleApprove}
            disabled={isApproving}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-bold shadow-lg transition ${
              isVerified
                ? 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-700/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
          >
            <CheckCircle2 size={16} />
            {isApproving ? 'Aprobando...' : isVerified ? 'Renovar Aprobación (1h)' : 'Aprobar Documento (1h)'}
          </button>
        </div>
      </div>

      {/* Status banner */}
      {isVerified && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={18} />
            Esta verificación se encuentra APROBADA (Vigencia de 1 hora activa).
          </div>
          {detail.expires_at && (
            <div className="text-xs font-mono text-emerald-400">
              Vence a las: {new Date(detail.expires_at).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {isRejected && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-sm font-semibold">
          <XCircle size={18} />
          Esta verificación se encuentra RECHAZADA. Motivo: {detail.rejection_reason || 'No especificado'}
        </div>
      )}

      {/* User & Document Metadata Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="text-xs text-slate-400 font-medium">Nombre del Usuario</div>
          <div className="text-base font-bold text-white mt-1">{detail.user?.display_name || 'N/A'}</div>
          <div className="text-xs text-slate-400 mt-0.5">{detail.user?.email || 'Sin email'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Documento Desencriptado</div>
          <div className="text-base font-bold text-indigo-300 font-mono mt-1">{detail.decrypted_document_number || 'Protegido'}</div>
          <div className="text-xs text-slate-400 mt-0.5">Tipo: {detail.document_type}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Fecha Nacimiento Extraída</div>
          <div className="text-base font-bold text-white font-mono mt-1">{detail.extracted_birth_date}</div>
          <div className="text-xs text-slate-400 mt-0.5">Formato AAAA-MM-DD</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Validación Legal (+18)</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-3 py-1 rounded-full font-bold text-xs ${
              detail.calculated_age >= 18 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              ✓ {detail.calculated_age} Años ({detail.calculated_age >= 18 ? 'Mayor de Edad Legal' : 'Menor de Edad'})
            </span>
          </div>
        </div>
      </div>

      {/* Image Inspection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Front Doc */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Anverso / Frontal</span>
            <div className="flex gap-1.5">
              <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                <RotateCw size={14} />
              </button>
              <button onClick={() => setZoomLevel((z) => (z === 1 ? 1.5 : 1))} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
          <div className="h-64 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
            {detail.front_image_url ? (
              <img
                src={detail.front_image_url}
                alt="Frontal"
                className="max-h-full max-w-full object-contain transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }}
              />
            ) : (
              <span className="text-slate-500 text-xs">Sin foto frontal</span>
            )}
          </div>
        </div>

        {/* Back Doc */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Reverso / Dorsal</span>
          </div>
          <div className="h-64 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
            {detail.back_image_url ? (
              <img src={detail.back_image_url} alt="Reverso" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-slate-500 text-xs">No requerida (Pasaporte) o no adjunta</span>
            )}
          </div>
        </div>

        {/* Selfie Live Photo */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Selfie (Prueba de Vida)</span>
          </div>
          <div className="h-64 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
            {detail.selfie_image_url ? (
              <img src={detail.selfie_image_url} alt="Selfie" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-slate-500 text-xs">Sin foto selfie</span>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="text-rose-500" size={22} />
              Rechazar Solicitud KYC
            </h3>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-2">Motivo Tipificado de Rechazo</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="BLURRY_IMAGE">Fotografía Borrosa o Ilegible</option>
                <option value="EXPIRED_DOCUMENT">Documento de Identidad Expirado</option>
                <option value="UNDERAGE_DETECTED">Menor de Edad Detectado</option>
                <option value="NAME_MISMATCH">Nombre no coincide con Documento</option>
                <option value="SELFIE_MISMATCH">Selfie no coincide con la foto del Documento</option>
                <option value="INVALID_DOCUMENT">Documento no Oficial / Inválido</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-2">Notas Adicionales para el Cliente (Opcional)</label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
                placeholder="Indica detalles para que el cliente pueda corregir su envío..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md"
              >
                {isRejecting ? 'Rechazando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
