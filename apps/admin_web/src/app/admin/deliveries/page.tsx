'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  User,
  FileText,
  Eye,
  X,
  CheckCircle,
  Camera,
  AlertTriangle,
} from 'lucide-react';

interface DeliveryVerification {
  id: string;
  order_id: string;
  driver_id: string | null;
  driver_name: string;
  receiver_name: string;
  receiver_id_number: string | null;
  receiver_relationship: string;
  id_image_url: string;
  signature_url: string | null;
  delivery_latitude: number;
  delivery_longitude: number;
  delivery_address: string | null;
  delivery_accuracy: number;
  verification_status: string;
  is_adult_verified: boolean;
  notes: string | null;
  delivered_at: string;
}

export default function DeliveriesPage() {
  const [verifications, setVerifications] = useState<DeliveryVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<DeliveryVerification | null>(null);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/v1/deliveries/verifications');
      if (res.ok) {
        const body = await res.json();
        setVerifications(body.data || []);
      }
    } catch (e) {
      console.error('Error cargando verificaciones:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const filtered = verifications.filter(v =>
    v.order_id.toLowerCase().includes(search.toLowerCase()) ||
    v.receiver_name.toLowerCase().includes(search.toLowerCase()) ||
    v.driver_name.toLowerCase().includes(search.toLowerCase()) ||
    (v.receiver_id_number && v.receiver_id_number.includes(search))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#1e1b4b] to-[#120f33] p-6 rounded-2xl border border-indigo-900/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Actas y Verificaciones de Entrega</h1>
            <p className="text-xs text-indigo-200/70 mt-1">
              Registro legal de entregas con captura de foto de ID del cliente, coordenadas GPS y validación +18
            </p>
          </div>
        </div>

        <button
          onClick={fetchVerifications}
          className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-2"
        >
          <Clock className="w-3.5 h-3.5" />
          Refrescar Actas
        </button>
      </div>

      {/* Search Bar & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
          <input
            type="text"
            placeholder="Buscar por pedido (#ORD), nombre o cédula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#181440]/60 border border-indigo-950 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-indigo-300/40 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{verifications.length} Entregas Verificadas</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#181440]/40 rounded-2xl border border-indigo-950 overflow-hidden shadow-xl backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center text-indigo-300 text-xs">Cargando bitácora de entregas...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-indigo-300/60 text-xs">
            No se encontraron actas de entrega registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e1b4b]/60 text-indigo-200/70 border-b border-indigo-950 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Pedido & Fecha</th>
                  <th className="px-6 py-4">Conductor</th>
                  <th className="px-6 py-4">Receptor del Pedido</th>
                  <th className="px-6 py-4">Foto Documento ID</th>
                  <th className="px-6 py-4">Ubicación GPS de Entrega</th>
                  <th className="px-6 py-4">Estado Legal</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-950/60 text-indigo-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    {/* Pedido */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">#{item.order_id}</div>
                      <div className="text-[11px] text-indigo-300/60 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.delivered_at).toLocaleString()}
                      </div>
                    </td>

                    {/* Conductor */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{item.driver_name}</div>
                      <div className="text-[10px] text-indigo-300/60 font-mono">ID: {item.driver_id || 'N/A'}</div>
                    </td>

                    {/* Receptor */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        {item.receiver_name}
                      </div>
                      <div className="text-[11px] text-indigo-300/80 mt-0.5">
                        Doc: <span className="font-mono font-medium">{item.receiver_id_number || 'No especificado'}</span>
                      </div>
                      <div className="text-[10px] text-purple-300/70 uppercase font-semibold mt-0.5">
                        {item.receiver_relationship}
                      </div>
                    </td>

                    {/* Foto ID */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedVerification(item)}
                        className="group relative w-16 h-12 rounded-lg overflow-hidden border border-purple-500/40 bg-purple-950/40 flex items-center justify-center hover:ring-2 hover:ring-purple-400 transition"
                      >
                        {item.id_image_url.startsWith('data:image') || item.id_image_url.startsWith('http') ? (
                          <img
                            src={item.id_image_url}
                            alt="ID"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <Camera className="w-5 h-5 text-purple-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    </td>

                    {/* Ubicación GPS */}
                    <td className="px-6 py-4">
                      <div className="text-white text-[11px] font-mono flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        [{item.delivery_latitude.toFixed(5)}, {item.delivery_longitude.toFixed(5)}]
                      </div>
                      <div className="text-[10px] text-indigo-300/60 mt-0.5 truncate max-w-[200px]">
                        {item.delivery_address || 'Medellín, Colombia'}
                      </div>
                      <a
                        href={`https://maps.google.com/?q=${item.delivery_latitude},${item.delivery_longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:text-indigo-200 mt-1 inline-flex items-center gap-1 font-semibold"
                      >
                        Ver en Google Maps <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    {/* Estado Legal */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          {item.verification_status}
                        </span>
                        {item.is_adult_verified && (
                          <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                            <span>🔞 +18 Verificado</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Acción */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedVerification(item)}
                        className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition"
                      >
                        Ver Acta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle y Foto Completa del ID */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181440] border border-indigo-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Acta Legal de Entrega #{selectedVerification.order_id}
                  </h3>
                  <p className="text-xs text-indigo-300/70">
                    Comprobante y foto del documento de identidad capturada por el repartidor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="p-1 rounded-lg text-indigo-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview Big */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                Foto del Documento de Identidad Presentado
              </label>
              <div className="w-full bg-[#100d2b] border border-indigo-950 rounded-xl p-3 flex items-center justify-center min-h-[220px]">
                {selectedVerification.id_image_url ? (
                  <img
                    src={selectedVerification.id_image_url}
                    alt="ID Documento"
                    className="max-h-72 object-contain rounded-lg border border-indigo-900/50 shadow-md"
                  />
                ) : (
                  <div className="text-indigo-400/50 text-xs">Sin imagen disponible</div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#120f33] p-3.5 rounded-xl border border-indigo-950 space-y-1">
                <span className="text-indigo-400 text-[10px] uppercase font-bold">Receptor del Pedido</span>
                <div className="font-bold text-white text-sm">{selectedVerification.receiver_name}</div>
                <div className="text-indigo-200">Doc: {selectedVerification.receiver_id_number || 'N/A'}</div>
                <div className="text-purple-300 text-[11px] font-semibold">{selectedVerification.receiver_relationship}</div>
              </div>

              <div className="bg-[#120f33] p-3.5 rounded-xl border border-indigo-950 space-y-1">
                <span className="text-indigo-400 text-[10px] uppercase font-bold">Conductor / Repartidor</span>
                <div className="font-bold text-white text-sm">{selectedVerification.driver_name}</div>
                <div className="text-indigo-200">ID: {selectedVerification.driver_id || 'N/A'}</div>
                <div className="text-emerald-300 text-[11px] font-semibold">Estado: {selectedVerification.verification_status}</div>
              </div>

              <div className="bg-[#120f33] p-3.5 rounded-xl border border-indigo-950 space-y-1 sm:col-span-2">
                <span className="text-indigo-400 text-[10px] uppercase font-bold">Ubicación y Telemetría</span>
                <div className="text-white font-mono text-[11px]">
                  Lat: {selectedVerification.delivery_latitude} • Lng: {selectedVerification.delivery_longitude} (±{selectedVerification.delivery_accuracy}m)
                </div>
                <div className="text-indigo-300/80">{selectedVerification.delivery_address}</div>
                {selectedVerification.notes && (
                  <div className="mt-2 text-indigo-200/90 italic bg-white/5 p-2 rounded-lg">
                    "{selectedVerification.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVerification(null)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
