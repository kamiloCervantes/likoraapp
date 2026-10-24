'use client';

import React, { useState, useEffect } from 'react';
import {
  Store as StoreIcon,
  Plus,
  Search,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  RefreshCw,
  Navigation,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  Boxes,
  Zap,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';

interface Store {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | string;
  longitude: number | string;
  coverage_radius_km: number | string;
  opening_time: string;
  closing_time: string;
  pos_type: 'physical_store' | 'dark_store' | 'express_kiosk' | 'warehouse';
  is_active: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export default function StoresAdminPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: 'Medellín',
    state: 'Antioquia',
    country: 'Colombia',
    latitude: '6.2085710',
    longitude: '-75.5684340',
    coverage_radius_km: 5.0,
    opening_time: '10:00',
    closing_time: '02:00',
    pos_type: 'physical_store' as 'physical_store' | 'dark_store' | 'express_kiosk' | 'warehouse',
    is_active: true,
    is_main: false,
  });

    const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('likora_admin_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    };
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/v1/admin/stores', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setStores(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching stores:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const openCreateModal = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      code: `POS-MED-0${stores.length + 1}`,
      description: '',
      phone: '',
      email: '',
      address: '',
      city: 'Medellín',
      state: 'Antioquia',
      country: 'Colombia',
      latitude: '6.2085710',
      longitude: '-75.5684340',
      coverage_radius_km: 5.0,
      opening_time: '10:00',
      closing_time: '02:00',
      pos_type: 'physical_store',
      is_active: true,
      is_main: stores.length === 0,
    });
    setStatusMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      code: store.code || '',
      description: store.description || '',
      phone: store.phone || '',
      email: store.email || '',
      address: store.address,
      city: store.city,
      state: store.state,
      country: store.country,
      latitude: store.latitude.toString(),
      longitude: store.longitude.toString(),
      coverage_radius_km: Number(store.coverage_radius_km) || 5.0,
      opening_time: store.opening_time,
      closing_time: store.closing_time,
      pos_type: store.pos_type,
      is_active: store.is_active,
      is_main: store.is_main,
    });
    setStatusMessage(null);
    setModalOpen(true);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no es soportada por tu navegador actual.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7),
        }));
        setDetectingGps(false);
      },
      (err) => {
        console.error('Error de geolocalización:', err);
        alert('No se pudo obtener la ubicación GPS actual: ' + err.message);
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/stores/${id}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchStores();
      }
    } catch (e) {
      console.error('Error toggling store status:', e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la tienda "${name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/stores/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchStores();
      }
    } catch (e) {
      console.error('Error deleting store:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setStatusMessage({ type: 'error', text: 'Latitud inválida. Debe estar entre -90 y 90.' });
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setStatusMessage({ type: 'error', text: 'Longitud inválida. Debe estar entre -180 y 180.' });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim() || undefined,
      description: formData.description.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      latitude: lat,
      longitude: lng,
      coverage_radius_km: Number(formData.coverage_radius_km) || 5.0,
      opening_time: formData.opening_time,
      closing_time: formData.closing_time,
      pos_type: formData.pos_type,
      is_active: formData.is_active,
      is_main: formData.is_main,
    };

    try {
      const url = editingStore
        ? `http://localhost:3000/api/v1/admin/stores/${editingStore.id}`
        : 'http://localhost:3000/api/v1/admin/stores';
      const method = editingStore ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: jsonEncodeSafe(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchStores();
      } else {
        const errJson = await res.json();
        setStatusMessage({
          type: 'error',
          text: errJson.message || 'Error al guardar la tienda en el servidor.',
        });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Error de conexión: ' + e.message });
    }
  };

  function jsonEncodeSafe(obj: any) {
    return JSON.stringify(obj);
  }

  const getPosTypeBadge = (type: string) => {
    switch (type) {
      case 'physical_store':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-3 h-3" /> Tienda Física
          </span>
        );
      case 'dark_store':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
            <Zap className="w-3 h-3" /> Dark Store (Hub)
          </span>
        );
      case 'express_kiosk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <StoreIcon className="w-3 h-3" /> Kiosco Express
          </span>
        );
      case 'warehouse':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Boxes className="w-3 h-3" /> Almacén Central
          </span>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Filtered stores
  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(search.toLowerCase())) ||
      s.address.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'all' || s.pos_type === selectedType;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && s.is_active) ||
      (selectedStatus === 'inactive' && !s.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCount = stores.filter((s) => s.is_active).length;
  const darkStoresCount = stores.filter((s) => s.pos_type === 'dark_store').length;
  const physicalCount = stores.filter((s) => s.pos_type === 'physical_store').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <StoreIcon className="w-7 h-7 text-primary" />
            Gestión de Tiendas y Puntos de Venta
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Administra sucursales, dark stores para despachos rápidos, bodegas y su geolocalización GPS (latitud y longitud).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStores} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={openCreateModal} className="bg-primary text-white shadow-md">
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva Tienda / POS
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-xs border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Puntos</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">{stores.length}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Puntos de venta registrados</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <StoreIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Puntos Activos</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{activeCount}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Habilitados para pedidos</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tiendas Físicas</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-0.5">{physicalCount}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Atención presencial & cavas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Dark Stores</p>
              <h3 className="text-2xl font-extrabold text-purple-600 mt-0.5">{darkStoresCount}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Despacho ultra-rápido</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
              <Zap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código POS, dirección o ciudad..."
                className="pl-9 text-xs h-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">Todos los Tipos de POS</option>
                <option value="physical_store">Tiendas Físicas</option>
                <option value="dark_store">Dark Stores (Hubs)</option>
                <option value="express_kiosk">Kioscos Express</option>
                <option value="warehouse">Almacén Central</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">Todos los Estados</option>
                <option value="active">Solo Activos</option>
                <option value="inactive">Solo Inactivos</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-xs text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Cargando puntos de venta...
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="p-16 text-center text-xs text-muted-foreground space-y-2">
              <StoreIcon className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
              <div className="font-semibold text-foreground text-sm">Sin puntos de venta encontrados</div>
              <p>No hay tiendas o puntos de venta que coincidan con los criterios seleccionados.</p>
              <Button size="sm" variant="outline" onClick={openCreateModal} className="mt-2">
                <Plus className="w-3.5 h-3.5 mr-1" /> Crear Primera Tienda
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Código & Nombre</th>
                    <th className="py-3 px-4">Tipo POS</th>
                    <th className="py-3 px-4">Dirección & Ciudad</th>
                    <th className="py-3 px-4">Geolocalización (GPS)</th>
                    <th className="py-3 px-4">Horario & Cobertura</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStores.map((store) => {
                    const latNum = Number(store.latitude);
                    const lngNum = Number(store.longitude);
                    const mapsUrl = `https://www.google.com/maps?q=${latNum},${lngNum}`;

                    return (
                      <tr key={store.id} className="hover:bg-muted/30 transition-colors">
                        {/* Name and Code */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                              {store.name}
                              {store.is_main && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                                  Matriz
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-muted-foreground mt-0.5">
                              {store.code || 'SIN CÓDIGO'}
                            </span>
                          </div>
                        </td>

                        {/* POS Type */}
                        <td className="py-3.5 px-4">{getPosTypeBadge(store.pos_type)}</td>

                        {/* Address */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col max-w-xs">
                            <span className="font-medium text-foreground truncate">{store.address}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {store.city}, {store.state}
                            </span>
                          </div>
                        </td>

                        {/* GPS Coordinates (Required by user) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col font-mono text-[11px] bg-muted/60 px-2.5 py-1 rounded-lg border border-border">
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                Lat: {Number(store.latitude).toFixed(6)}
                              </span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                Lng: {Number(store.longitude).toFixed(6)}
                              </span>
                            </div>
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Abrir ubicación en Google Maps"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-primary" />
                            </a>
                          </div>
                        </td>

                        {/* Schedule & Radius */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span>
                                {store.opening_time} - {store.closing_time}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              Radio: <strong>{Number(store.coverage_radius_km)} km</strong>
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(store.id)}
                            className="focus:outline-none cursor-pointer"
                            title="Haz clic para alternar estado"
                          >
                            {store.is_active ? (
                              <Badge variant="success">Activa</Badge>
                            ) : (
                              <Badge variant="destructive">Inactiva</Badge>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => openEditModal(store)}
                            title="Editar tienda"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(store.id, store.name)}
                            title="Eliminar tienda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl w-full max-w-xl shadow-2xl p-6 my-8 space-y-5 animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">
                  {editingStore ? 'Editar Tienda / Punto de Venta' : 'Nuevo Punto de Venta / Tienda'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Status Alert */}
            {statusMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold ${
                  statusMessage.type === 'error'
                    ? 'bg-destructive/15 text-destructive border border-destructive/20'
                    : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Sección 1: Datos Básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-muted-foreground mb-1">Nombre de la Tienda / POS *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Likora Express - Laureles"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Código Identificador POS</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ej: POS-MED-02"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Tipo de Punto de Venta *</label>
                  <select
                    value={formData.pos_type}
                    onChange={(e) => setFormData({ ...formData, pos_type: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="physical_store">🏪 Tienda Física (Atención al público)</option>
                    <option value="dark_store">⚡ Dark Store (Bodega Despacho Express)</option>
                    <option value="express_kiosk">🎪 Kiosco Express / Módulo</option>
                    <option value="warehouse">📦 Almacén Central de Distribución</option>
                  </select>
                </div>
              </div>

              {/* Sección 2: Dirección y Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className="block font-medium text-muted-foreground mb-1">Dirección Completa *</label>
                  <Input
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej: Cra. 43A # 5A-113, El Poblado"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Ciudad *</label>
                  <Input
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Medellín"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Departamento</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Antioquia"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">País</label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Colombia"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block font-medium text-muted-foreground mb-1">Teléfono</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 (4) 444-5456"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-muted-foreground mb-1">Email de Contacto</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tienda@likora.app"
                  />
                </div>
              </div>

              {/* SECCIÓN 3: GEOLOCALIZACIÓN (LATITUD Y LONGITUD) */}
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                    <Navigation className="w-4 h-4" />
                    <span>Coordenadas Geográficas (Latitud & Longitud) *</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDetectGPS}
                    disabled={detectingGps}
                    className="h-7 text-[11px] bg-background hover:bg-muted"
                  >
                    <Navigation className={`w-3 h-3 mr-1 ${detectingGps ? 'animate-spin' : ''}`} />
                    {detectingGps ? 'Detectando GPS...' : 'Usar mi GPS Actual'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-foreground mb-1">Latitud (Decimal) *</label>
                    <Input
                      required
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="6.208571"
                      className="font-mono bg-background"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1">Longitud (Decimal) *</label>
                    <Input
                      required
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="-75.568434"
                      className="font-mono bg-background"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Radio de Cobertura Delivery (km):</span>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      value={formData.coverage_radius_km}
                      onChange={(e) => setFormData({ ...formData, coverage_radius_km: parseFloat(e.target.value) || 5.0 })}
                      className="h-7 text-xs bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 4: Horarios y Opciones */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Hora Apertura</label>
                  <Input
                    type="time"
                    value={formData.opening_time}
                    onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Hora Cierre</label>
                  <Input
                    type="time"
                    value={formData.closing_time}
                    onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active_store"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-border w-4 h-4 text-primary"
                  />
                  <label htmlFor="is_active_store" className="font-semibold text-foreground cursor-pointer">
                    Punto de Venta Activo para Operación
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_main_store"
                    checked={formData.is_main}
                    onChange={(e) => setFormData({ ...formData, is_main: e.target.checked })}
                    className="rounded border-border w-4 h-4 text-amber-500"
                  />
                  <label htmlFor="is_main_store" className="font-semibold text-foreground cursor-pointer">
                    ¿Es Tienda Matriz / Principal?
                  </label>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-white">
                  {editingStore ? 'Guardar Cambios' : 'Registrar Tienda'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
