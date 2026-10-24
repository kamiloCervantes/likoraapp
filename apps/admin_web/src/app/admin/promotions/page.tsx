'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  RefreshCw,
  Tag,
  Percent,
  CheckCircle2,
  Trash2,
  Edit,
  Store,
  Layers,
  Calendar,
  Eye,
  Sliders,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';

interface Promotion {
  id: string;
  title: string;
  subtitle?: string;
  button_text: string;
  image_url?: string;
  gradient_color1: string;
  gradient_color2: string;
  discount_percentage?: number;
  discount_code?: string;
  store_id?: string;
  category_id?: string;
  is_active: boolean;
  priority: number;
  store?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface StoreOption {
  id: string;
  name: string;
}

const COLOR_PRESETS = [
  { name: 'Morado Likora', c1: '#5A189A', c2: '#7B2CBF' },
  { name: 'Uva & Cava', c1: '#3C096C', c2: '#5A189A' },
  { name: 'Noche Premium', c1: '#10002B', c2: '#240046' },
  { name: 'Gran Reserva', c1: '#4A0E17', c2: '#7209B7' },
  { name: 'Cerveza & Ámbar', c1: '#9A031E', c2: '#E36414' },
  { name: 'Esmeralda & Coctel', c1: '#0F4C5C', c2: '#0077B6' },
];

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStore, setFilterStore] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formButtonText, setFormButtonText] = useState('Ver Promociones');
  const [formColor1, setFormColor1] = useState('#5A189A');
  const [formColor2, setFormColor2] = useState('#7B2CBF');
  const [formDiscountPercent, setFormDiscountPercent] = useState<string>('20');
  const [formDiscountCode, setFormDiscountCode] = useState('OFERTA20');
  const [formStoreId, setFormStoreId] = useState<string>('');
  const [formPriority, setFormPriority] = useState<number>(5);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/v1/admin/promotions');
      if (res.ok) {
        const json = await res.json();
        setPromotions(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching promotions:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/stores');
      if (res.ok) {
        const json = await res.json();
        setStores(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching stores:', e);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchStores();
  }, []);

  const openCreateModal = () => {
    setEditingPromotion(null);
    setFormTitle('Punto de Venta Central');
    setFormSubtitle('20% OFF en selección de Vinos y Licores');
    setFormButtonText('Ver Promociones');
    setFormColor1('#5A189A');
    setFormColor2('#7B2CBF');
    setFormDiscountPercent('20');
    setFormDiscountCode('VINOS20');
    setFormStoreId('');
    setFormPriority(5);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormTitle(promo.title);
    setFormSubtitle(promo.subtitle || '');
    setFormButtonText(promo.button_text || 'Ver Promociones');
    setFormColor1(promo.gradient_color1 || '#5A189A');
    setFormColor2(promo.gradient_color2 || '#7B2CBF');
    setFormDiscountPercent(promo.discount_percentage ? String(promo.discount_percentage) : '');
    setFormDiscountCode(promo.discount_code || '');
    setFormStoreId(promo.store_id || '');
    setFormPriority(promo.priority || 1);
    setFormIsActive(promo.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: any = {
        title: formTitle,
        subtitle: formSubtitle,
        button_text: formButtonText,
        gradient_color1: formColor1,
        gradient_color2: formColor2,
        discount_percentage: formDiscountPercent ? Number(formDiscountPercent) : undefined,
        discount_code: formDiscountCode || undefined,
        store_id: formStoreId && formStoreId.trim() ? formStoreId : null,
        priority: Number(formPriority) || 1,
        is_active: formIsActive,
      };

      const url = editingPromotion
        ? `http://localhost:3000/api/v1/admin/promotions/${editingPromotion.id}`
        : 'http://localhost:3000/api/v1/admin/promotions';

      const method = editingPromotion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchPromotions();
      } else {
        const errorData = await res.json();
        alert(`Error al guardar promoción: ${errorData.message || 'Error en la petición'}`);
      }
    } catch (err) {
      console.error('Error saving promotion:', err);
      alert('Error de conexión al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/promotions/${id}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setPromotions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
        );
      }
    } catch (e) {
      console.error('Error toggling promotion status:', e);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Está seguro de eliminar la promoción "${title}"?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/promotions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Error deleting promotion:', e);
    }
  };

  const filteredPromotions = promotions.filter((p) => {
    if (filterStore === 'ALL') return true;
    if (filterStore === 'GLOBAL') return !p.store_id;
    return p.store_id === filterStore;
  });

  const activeCount = promotions.filter((p) => p.is_active).length;
  const discountsCount = promotions.filter((p) => p.discount_percentage && p.discount_percentage > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Promociones & Banners de la App
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestione las campañas de marketing, carruseles destacados, cupones y ofertas mostradas en la aplicación móvil de Likora.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchPromotions} disabled={loading} className="text-xs">
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} />
            Actualizar
          </Button>
          <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nueva Promoción
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Total Campañas</div>
              <div className="text-2xl font-bold text-foreground mt-1">{promotions.length}</div>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Promociones Activas</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Con Descuento %</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{discountsCount}</div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
              <Percent className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Puntos de Venta</div>
              <div className="text-2xl font-bold text-foreground mt-1">{stores.length}</div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <Store className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filtrar por Tienda:</span>
          <select
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Todas las Promociones ({promotions.length})</option>
            <option value="GLOBAL">Globales (Todas las tiendas)</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-muted-foreground">
          Mostrando {filteredPromotions.length} campaña{filteredPromotions.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Promotions Cards Grid with Visual Preview */}
      {filteredPromotions.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-foreground">No hay promociones registradas</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Cree una nueva campaña para que aparezca en el carrusel de inicio de la aplicación móvil.
          </p>
          <Button onClick={openCreateModal} size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Crear Primera Promoción
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promo) => (
            <Card key={promo.id} className="overflow-hidden border-border shadow-xs flex flex-col justify-between">
              <div>
                {/* Visual Banner Preview */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${promo.gradient_color1}, ${promo.gradient_color2})`,
                  }}
                  className="p-5 text-white relative flex flex-col justify-between min-h-[145px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      {promo.discount_percentage ? `${Number(promo.discount_percentage)}% OFF` : 'OFERTA'}
                    </span>
                    {promo.discount_code && (
                      <span className="font-mono text-[10px] bg-black/30 px-2 py-0.5 rounded border border-white/20">
                        {promo.discount_code}
                      </span>
                    )}
                  </div>

                  <div className="my-2">
                    <h3 className="font-bold text-base leading-tight drop-shadow-xs">{promo.title}</h3>
                    {promo.subtitle && (
                      <p className="text-xs text-white/80 line-clamp-2 mt-1 drop-shadow-xs">{promo.subtitle}</p>
                    )}
                  </div>

                  <div>
                    <span className="inline-block bg-white text-slate-900 text-[11px] font-bold px-3 py-1 rounded-lg shadow-xs">
                      {promo.button_text}
                    </span>
                  </div>
                </div>

                {/* Details Bar */}
                <div className="p-4 space-y-2 border-b border-border/60 bg-card">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      Tienda:
                    </span>
                    <span className="font-medium text-foreground truncate max-w-[170px]">
                      {promo.store?.name || 'Todas las tiendas (Global)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" />
                      Prioridad / Orden:
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-2">
                      Prioridad #{promo.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Estado en App:</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] py-0 px-2 font-semibold',
                        promo.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}
                    >
                      {promo.is_active ? 'HABILITADA' : 'DESACTIVADA'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <CardFooter className="p-3 bg-muted/20 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(promo.id)}
                  className="text-xs h-8 flex-1"
                >
                  {promo.is_active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(promo)}
                  className="text-xs h-8 px-2.5"
                  title="Editar"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(promo.id, promo.title)}
                  className="text-xs h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Crear / Editar Promoción */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-xl w-full shadow-2xl my-8">
            <form onSubmit={handleSave}>
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    {editingPromotion ? 'Editar Promoción' : 'Nueva Promoción & Banner'}
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-muted-foreground hover:text-foreground text-sm font-mono"
                  >
                    ✕
                  </button>
                </div>
                <CardDescription className="text-xs">
                  Configure el banner que se visualizará en el carrusel de promociones de la app.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
                {/* Live Preview Card inside Modal */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Vista Previa en Vivo:
                  </label>
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${formColor1}, ${formColor2})`,
                    }}
                    className="p-4 rounded-xl text-white shadow-sm flex flex-col justify-between min-h-[120px]"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                        {formDiscountPercent ? `${formDiscountPercent}% OFF` : 'OFERTA'}
                      </span>
                      {formDiscountCode && (
                        <span className="font-mono text-[10px] bg-black/30 px-2 py-0.5 rounded">
                          {formDiscountCode}
                        </span>
                      )}
                    </div>
                    <div className="my-1.5">
                      <h4 className="font-bold text-base leading-tight">{formTitle || 'Título de Promoción'}</h4>
                      <p className="text-xs text-white/80 line-clamp-2">{formSubtitle || 'Descripción u oferta atractiva'}</p>
                    </div>
                    <div>
                      <span className="inline-block bg-white text-slate-900 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs">
                        {formButtonText || 'Ver Promociones'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Título Principal</label>
                  <Input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="ej. Festival Cervecero IPA"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Subtítulo / Descripción de la Oferta</label>
                  <Input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="ej. Lleva 4 Cervezas Artesanales por el precio de 3"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Texto del Botón</label>
                    <Input
                      type="text"
                      required
                      value={formButtonText}
                      onChange={(e) => setFormButtonText(e.target.value)}
                      placeholder="Ver Promociones"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Tienda Asignada</label>
                    <select
                      value={formStoreId}
                      onChange={(e) => setFormStoreId(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Todas las tiendas (Global)</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Porcentaje de Descuento (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={formDiscountPercent}
                      onChange={(e) => setFormDiscountPercent(e.target.value)}
                      placeholder="ej. 20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Código de Cupón Promocional</label>
                    <Input
                      type="text"
                      value={formDiscountCode}
                      onChange={(e) => setFormDiscountCode(e.target.value.toUpperCase())}
                      placeholder="ej. LIKORA20"
                      className="font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Color Palettes */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Paleta de Colores del Banner</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setFormColor1(p.c1);
                          setFormColor2(p.c2);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border border-border hover:bg-muted/50"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
                        />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground">Color Inicial (Hex)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formColor1}
                          onChange={(e) => setFormColor1(e.target.value)}
                          className="w-8 h-8 rounded border border-border cursor-pointer p-0"
                        />
                        <Input
                          type="text"
                          value={formColor1}
                          onChange={(e) => setFormColor1(e.target.value)}
                          className="font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground">Color Final (Hex)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formColor2}
                          onChange={(e) => setFormColor2(e.target.value)}
                          className="w-8 h-8 rounded border border-border cursor-pointer p-0"
                        />
                        <Input
                          type="text"
                          value={formColor2}
                          onChange={(e) => setFormColor2(e.target.value)}
                          className="font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Prioridad en Carrusel (Mayor = Primero)</label>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={formPriority}
                      onChange={(e) => setFormPriority(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="rounded border-input text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      Habilitar Promoción Inmediatamente
                    </label>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-end gap-2 border-t border-border pt-3">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  {editingPromotion ? 'Guardar Cambios' : 'Crear Promoción'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
