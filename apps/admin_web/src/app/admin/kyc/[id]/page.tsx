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
  FileText,
  User,
  Calendar,
  Sparkles,
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
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    setIsApproving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/kyc/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_user_id: '00000000-0000-0000-0000-000000000001' }),
      });
      if (res.ok) {
        setToastMessage({ type: 'success', text: '¡Verificación aprobada exitosamente por 1 hora!' });
        fetchDetail();
      } else {
        const err = await res.json();
        setToastMessage({ type: 'error', text: err.message || 'Error al aprobar KYC' });
      }
    } catch (e: any) {
      setToastMessage({ type: 'error', text: 'Error de red: ' + e.message });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/kyc/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_user_id: '00000000-0000-0000-0000-000000000001',
          reason: rejectReason,
          custom_notes: customNotes,
        }),
      });
      if (res.ok) {
        setToastMessage({ type: 'success', text: 'Verificación rechazada correctamente.' });
        setShowRejectModal(false);
        fetchDetail();
      } else {
        const err = await res.json();
        setToastMessage({ type: 'error', text: err.message || 'Error al rechazar' });
      }
    } catch (e: any) {
      setToastMessage({ type: 'error', text: 'Error de red: ' + e.message });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between border-b border-[#e6e1d8] pb-4">
        <Link
          href="/admin/kyc"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#6b7770] hover:text-[#0b1a13] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de auditoría</span>
        </Link>

        {detail && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isRejecting || isApproving}
              className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all"
            >
              Rechazar Solicitud
            </button>

            <button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="px-6 py-2 bg-[#0b1a13] hover:bg-[#142a20] text-[#e5c396] rounded-xl text-xs font-bold shadow-md shadow-black/20 flex items-center gap-2 transition-all"
            >
              {isApproving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Aprobar Verificación (+1 hora)</span>
            </button>
          </div>
        )}
      </div>

      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-xs text-[#8a948e]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#b48a4c]" />
          Cargando expediente fotográfico KYC...
        </div>
      ) : !detail ? (
        <div className="p-16 text-center text-xs text-[#8a948e]">Expediente no encontrado.</div>
      ) : (
        <div className="space-y-6">
          {/* User & Document Metadata Card */}
          <div className="bg-white border border-[#e6e1d8] rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8a948e] font-bold">Cliente</span>
              <h3 className="font-bold text-sm text-[#0b1a13]">{detail.user_display_name || 'Sin Nombre'}</h3>
              <p className="text-xs text-[#6b7770] font-mono">{detail.user_email}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8a948e] font-bold">Tipo Documento</span>
              <p className="font-bold text-sm text-[#0b1a13]">{detail.document_type || 'Cédula de Ciudadanía'}</p>
              <p className="text-xs text-[#6b7770]">Documento Oficial</p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8a948e] font-bold">Fecha Nacimiento</span>
              <p className="font-bold text-sm text-[#0b1a13]">{detail.extracted_birth_date || 'No extraída'}</p>
              <p className="text-xs text-[#b48a4c] font-bold">{detail.calculated_age ? `${detail.calculated_age} años (+18)` : 'Edad desconocida'}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8a948e] font-bold">Estado Actual</span>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  detail.status === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : detail.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {detail.status}
                </span>
              </div>
            </div>
          </div>

          {/* Photo Comparison Studio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Document */}
            <div className="bg-white border border-[#e6e1d8] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif-title font-bold text-sm text-[#0b1a13]">Documento Frontal</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="p-2 bg-[#fcfbf9] border border-[#e6e1d8] rounded-xl text-xs text-[#141c18] hover:border-[#b48a4c]"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((prev) => (prev === 1 ? 1.5 : 1))}
                    className="p-2 bg-[#fcfbf9] border border-[#e6e1d8] rounded-xl text-xs text-[#141c18] hover:border-[#b48a4c]"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="w-full h-80 bg-[#0b1a13]/5 rounded-2xl flex items-center justify-center overflow-hidden border border-[#e6e1d8]">
                {detail.front_image_url ? (
                  <img
                    src={detail.front_image_url}
                    alt="Documento Frontal"
                    style={{ transform: `rotate(${rotation}deg) scale(${zoomLevel})`, transition: 'all 0.3s ease' }}
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />
                ) : (
                  <span className="text-xs text-[#8a948e]">Sin imagen frontal</span>
                )}
              </div>
            </div>

            {/* Selfie Biometrics */}
            <div className="bg-white border border-[#e6e1d8] rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="font-serif-title font-bold text-sm text-[#0b1a13]">Selfie en Vivo</h4>

              <div className="w-full h-80 bg-[#0b1a13]/5 rounded-2xl flex items-center justify-center overflow-hidden border border-[#e6e1d8]">
                {detail.selfie_image_url ? (
                  <img
                    src={detail.selfie_image_url}
                    alt="Selfie Biometría"
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />
                ) : (
                  <span className="text-xs text-[#8a948e]">Sin selfie</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-[#0b1a13]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e6e1d8] rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5">
            <h3 className="font-serif-title font-bold text-base text-[#0b1a13]">Rechazar Verificación KYC</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#141c18]">Motivo Principal</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#fcfbf9] border border-[#e6e1d8] rounded-xl px-3.5 py-2.5 text-xs text-[#141c18]"
              >
                <option value="BLURRY_IMAGE">Fotografía Borrosa o Ilegible</option>
                <option value="UNDERAGE">Menor de Edad (+18)</option>
                <option value="EXPIRED_DOCUMENT">Documento Expirado</option>
                <option value="FACE_MISMATCH">No coincide el rostro con la cédula</option>
                <option value="OTHER">Otro motivo</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#141c18]">Notas Adicionales (Opcional)</label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Indique detalles para el usuario..."
                className="w-full bg-[#fcfbf9] border border-[#e6e1d8] rounded-xl p-3 text-xs text-[#141c18] h-24"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#e6e1d8]">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6b7770]"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md"
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
