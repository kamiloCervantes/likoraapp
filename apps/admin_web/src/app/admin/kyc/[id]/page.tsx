'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, CheckCircle2, XCircle, RotateCw, ZoomIn, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function KycAuditDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('BLURRY_IMAGE');
  const [customNotes, setCustomNotes] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const mockDetail = {
    id: params.id,
    user: {
      id: 'usr-101',
      display_name: 'Santiago Morales',
      email: 'santiago.m@gmail.com',
      phone_number: '+52 55 1234 5678',
    },
    document_type: 'DNI / Cédula',
    decrypted_document_number: '74829103-X',
    extracted_birth_date: '2004-03-12',
    calculated_age: 22,
    is_legal_age: true,
    front_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
    back_image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    selfie_image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80',
  };

  const handleApprove = async () => {
    setIsApproving(true);
    await new Promise((r) => setTimeout(r, 800));
    alert('✅ Solicitud KYC Aprobada exitosamente. El usuario ha sido notificado.');
    router.push('/admin/kyc');
  };

  const handleReject = async () => {
    await new Promise((r) => setTimeout(r, 600));
    alert(`❌ Solicitud Rechazada por motivo: ${rejectReason}`);
    setShowRejectModal(false);
    router.push('/admin/kyc');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/admin/kyc" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
          <ArrowLeft size={18} />
          Volver a la lista
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-sm font-semibold transition"
          >
            <XCircle size={16} />
            Rechazar
          </button>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition"
          >
            <CheckCircle2 size={16} />
            {isApproving ? 'Aprobando...' : 'Aprobar Documento'}
          </button>
        </div>
      </div>

      {/* User & Document Metadata Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="text-xs text-slate-400">Nombre del Usuario</div>
          <div className="text-base font-bold text-white mt-0.5">{mockDetail.user.display_name}</div>
          <div className="text-xs text-slate-400">{mockDetail.user.email}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Tipo y Número de Doc</div>
          <div className="text-base font-bold text-indigo-300 font-mono mt-0.5">{mockDetail.decrypted_document_number}</div>
          <div className="text-xs text-slate-400">{mockDetail.document_type}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Fecha Nacimiento Extraída</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">{mockDetail.extracted_birth_date}</div>
          <div className="text-xs text-slate-400">Formato AAAA-MM-DD</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Validación de Mayoría de Edad</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
              ✓ {mockDetail.calculated_age} Años (Mayor de Edad)
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
            <img
              src={mockDetail.front_image_url}
              alt="Frontal"
              className="max-h-full max-w-full object-contain transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }}
            />
          </div>
        </div>

        {/* Back Doc */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Reverso / Dorsal</span>
          </div>
          <div className="h-64 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
            <img src={mockDetail.back_image_url} alt="Reverso" className="max-h-full max-w-full object-contain" />
          </div>
        </div>

        {/* Selfie Live Photo */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Selfie (Prueba de Vida)</span>
          </div>
          <div className="h-64 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
            <img src={mockDetail.selfie_image_url} alt="Selfie" className="max-h-full max-w-full object-contain" />
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
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
