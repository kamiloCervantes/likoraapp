"use client";

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, RefreshCw, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';

interface Category {
  id: string;
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/v1/admin/categories');
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
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
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
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order,
      is_active: cat.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? ('http://localhost:3000/api/v1/admin/categories/' + editingCategory.id)
        : 'http://localhost:3000/api/v1/admin/categories';

      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'Error guardando categoría');
      }
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return;
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/categories/' + id, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'No se puede eliminar la categoría');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Gestión de Categorías
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organización del catálogo de licores, bebidas y complementos para la plataforma.
          </p>
        </div>

        <Button onClick={openCreateModal} className="shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva Categoría
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o slug..."
            className="pl-9 h-9"
          />
        </div>

        <Button variant="outline" size="sm" onClick={fetchCategories} disabled={loading}>
          <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} />
          Actualizar
        </Button>
      </div>

      <Card>
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
              <p>No se encontraron categorías registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Imagen y Nombre</th>
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
              <div>
                <label className="block font-medium text-muted-foreground mb-1">Nombre *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Ron y Destilados"
                />
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">Slug (Opcional)</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej: ron-destilados"
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
