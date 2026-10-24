'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Store as StoreIcon,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

interface Store {
  id: string;
  name: string;
  code: string | null;
  city: string;
}

interface Category {
  id: string;
  store_id: string | null;
  store?: Store | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    store_id: '',
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true,
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
      let res = await fetch('http://localhost:3000/api/v1/admin/stores', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        res = await fetch('http://localhost:3000/api/v1/stores');
      }
      if (res.ok) {
        const json = await res.json();
        setStores(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching stores:', e);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const url = (selectedStoreId !== 'all' && selectedStoreId !== 'global')
        ? 'http://localhost:3000/api/v1/admin/categories?store_id=' + selectedStoreId
        : 'http://localhost:3000/api/v1/admin/categories';
      let res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const fallbackUrl = (selectedStoreId !== 'all' && selectedStoreId !== 'global')
          ? 'http://localhost:3000/api/v1/categories?store_id=' + selectedStoreId
          : 'http://localhost:3000/api/v1/categories';
        res = await fetch(fallbackUrl);
      }
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [selectedStoreId]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      store_id: selectedStoreId !== 'all' ? selectedStoreId : (stores[0]?.id || ''),
      name: '',
      slug: '',
      description: '',
      image_url: '',
      display_order: categories.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      store_id: cat.store_id || '',
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order,
      is_active: cat.is_active,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al eliminar categoría');
      }
    } catch (e) {
      console.error('Error deleting category:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `http://localhost:3000/api/v1/admin/categories/${editingCategory.id}`
        : 'http://localhost:3000/api/v1/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          store_id: formData.store_id ? formData.store_id : null,
          slug: formData.slug || undefined,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al guardar categoría');
      }
    } catch (e) {
      console.error('Error saving category:', e);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStore =
      selectedStoreId === 'all' ||
      (selectedStoreId === 'global' ? !c.store_id : (!c.store_id || c.store_id === selectedStoreId));

    return matchesSearch && matchesStore;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Categorías del Catálogo
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Administra las categorías y asígnalas a su tienda / punto de venta correspondiente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCategories} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={openCreateModal} className="bg-primary text-white shadow-md">
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar categoría por nombre o slug..."
                className="pl-9 text-xs h-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter by Store (Required) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <StoreIcon className="w-3.5 h-3.5 text-primary" />
                <span>Filtrar por Tienda:</span>
              </div>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">🏬 Todas las Tiendas y Globales</option>
                  <option value="global">🌐 Solo Categorías Globales</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
              Cargando categorías...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-1">
              <Layers className="w-6 h-6 mx-auto text-muted-foreground" />
              <div className="font-semibold text-foreground text-sm">Sin categorías</div>
              <p>No se encontraron categorías asociadas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Imagen y Nombre</th>
                    <th className="py-3 px-4">Tienda Asociada</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Descripción</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-muted-foreground">
                        #{cat.display_order}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {cat.image_url ? (
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              className="w-8 h-8 rounded-lg object-cover bg-muted border border-border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="font-semibold text-foreground">{cat.name}</div>
                        </div>
                      </td>
                      {/* Tienda Asociada Column */}
                      <td className="py-3.5 px-4">
                        {cat.store ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                            <StoreIcon className="w-3 h-3" />
                            {cat.store.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                            Global (Todas)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-mono">{cat.slug}</td>
                      <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {cat.is_active ? (
                          <Badge variant="success">Activa</Badge>
                        ) : (
                          <Badge variant="destructive">Inactiva</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => openEditModal(cat)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Tienda Selector */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1">
                  Tienda / Punto de Venta Asociado *
                </label>
                <select
                  value={formData.store_id}
                  onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">🌐 Global (Disponible en todas las tiendas)</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      🏬 {s.name} ({s.city})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Asocia esta categoría exclusivamente a un punto de venta o déjala global.
                </p>
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">Nombre *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Tequila y Mezcal"
                />
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">Slug (Opcional)</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej: tequila-mezcal"
                />
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">URL Imagen</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Orden Visual</label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="is_active_cat"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="is_active_cat" className="font-medium text-foreground cursor-pointer">
                    Activa
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[70px]"
                  placeholder="Detalles de la categoría..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Guardar Categoría
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
