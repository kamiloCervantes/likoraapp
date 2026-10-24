'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Store as StoreIcon,
  Tag,
  Star,
  Flame,
  ArrowUpDown,
  Boxes,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
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
  name: string;
}

interface Product {
  id: string;
  store_id: string | null;
  store?: Store | null;
  category_id: string;
  category?: Category | null;
  subcategory_id: string | null;
  sku: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  stock_quantity: number;
  images: Array<{ url: string; isCover?: boolean; alt?: string }>;
  is_featured: boolean;
  is_offer: boolean;
  rating: number | string;
  is_active: boolean;
  created_at: string;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    store_id: '',
    category_id: '',
    sku: '',
    name: '',
    slug: '',
    description: '',
    price: '0.00',
    compare_at_price: '',
    stock_quantity: 10,
    image_url: '',
    is_featured: false,
    is_offer: false,
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
      const res = await fetch('http://localhost:3000/api/v1/admin/stores', {
        headers: getAuthHeaders(),
      });
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
      const res = await fetch('http://localhost:3000/api/v1/admin/categories', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStoreId !== 'all' && selectedStoreId !== 'global') params.append('store_id', selectedStoreId);
      if (selectedCategoryId !== 'all') params.append('category_id', selectedCategoryId);
      if (searchTerm) params.append('q', searchTerm);
            params.append('limit', '20');

      const url = 'http://localhost:3000/api/v1/admin/products' + (params.toString() ? '?' + params.toString() : '');
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
              }
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedStoreId, selectedCategoryId]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      store_id: selectedStoreId !== 'all' ? selectedStoreId : (stores[0]?.id || ''),
      category_id: categories[0]?.id || '',
      sku: '',
      name: '',
      slug: '',
      description: '',
      price: '25.00',
      compare_at_price: '',
      stock_quantity: 20,
      image_url: '',
      is_featured: false,
      is_offer: false,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    const coverImg = prod.images && prod.images.length > 0 ? prod.images[0].url : '';
    setFormData({
      store_id: prod.store_id || '',
      category_id: prod.category_id || '',
      sku: prod.sku || '',
      name: prod.name,
      slug: prod.slug,
      description: prod.description || '',
      price: prod.price.toString(),
      compare_at_price: prod.compare_at_price ? prod.compare_at_price.toString() : '',
      stock_quantity: prod.stock_quantity,
      image_url: coverImg,
      is_featured: prod.is_featured,
      is_offer: prod.is_offer,
      is_active: prod.is_active,
    });
    setModalOpen(true);
  };

  const handleUpdateStock = async (id: string, adjustment: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ adjustment }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error('Error updating stock:', e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al eliminar producto');
      }
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `http://localhost:3000/api/v1/admin/products/${editingProduct.id}`
        : 'http://localhost:3000/api/v1/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        store_id: formData.store_id || null,
        category_id: formData.category_id,
        sku: formData.sku.trim() || undefined,
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : undefined,
        stock_quantity: parseInt(formData.stock_quantity.toString()) || 0,
        images: formData.image_url.trim() ? [{ url: formData.image_url.trim(), isCover: true }] : undefined,
        is_featured: formData.is_featured,
        is_offer: formData.is_offer,
        is_active: formData.is_active,
      };

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al guardar producto');
      }
    } catch (e) {
      console.error('Error saving product:', e);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStore =
      selectedStoreId === 'all' ||
      (selectedStoreId === 'global' ? !p.store_id : (!p.store_id || p.store_id === selectedStoreId));

    const matchesCategory =
      selectedCategoryId === 'all' || p.category_id === selectedCategoryId;

    return matchesSearch && matchesStore && matchesCategory;
  });

  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
  const featuredCount = products.filter((p) => p.is_featured).length;
  const offersCount = products.filter((p) => p.is_offer).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Productos & Control de Stock
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestiona el inventario de bebidas, precios, ofertas y asócialos a cada tienda o punto de venta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={openCreateModal} className="bg-primary text-white shadow-md">
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Productos</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">{products.length}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">En catálogo activo</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Unidades Stock</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{totalStockUnits}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Total unidades en tiendas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Boxes className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">En Oferta</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{offersCount}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Con precio promocional</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Destacados</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-0.5">{featuredCount}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">En carrusel principal</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Star className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, SKU o descripción..."
                className="pl-9 text-xs h-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Store Filter */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <StoreIcon className="w-3.5 h-3.5 text-primary" />
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">🏬 Todas las Tiendas y Globales</option>
                  <option value="global">🌐 Solo Productos Globales</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">🍹 Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
            <div className="p-16 text-center text-xs text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Cargando productos del catálogo...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center text-xs text-muted-foreground space-y-1">
              <Package className="w-6 h-6 mx-auto text-muted-foreground" />
              <div className="font-semibold text-foreground text-sm">Sin productos encontrados</div>
              <p>No se encontraron productos que coincidan con la búsqueda o la tienda seleccionada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Tienda Asociada</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Banderas</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((prod) => {
                    const imgUrl = prod.images && prod.images.length > 0
                      ? prod.images[0].url
                      : 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=200&q=80';

                    return (
                      <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                        {/* Image & Title */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={imgUrl}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover bg-muted border border-border flex-shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground text-sm truncate max-w-xs">
                                {prod.name}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                SKU: {prod.sku || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tienda Asociada Column (Required) */}
                        <td className="py-3.5 px-4">
                          {prod.store ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                              <StoreIcon className="w-3 h-3" />
                              {prod.store.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                              Global (Todas)
                            </span>
                          )}
                        </td>

                        {/* Categoría */}
                        <td className="py-3.5 px-4">
                          <span className="text-foreground font-medium">
                            {prod.category?.name || 'Sin Categoría'}
                          </span>
                        </td>

                        {/* Precio */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground font-mono">
                              ${Number(prod.price).toFixed(2)}
                            </span>
                            {prod.compare_at_price && Number(prod.compare_at_price) > Number(prod.price) && (
                              <span className="text-[10px] text-muted-foreground line-through font-mono">
                                ${Number(prod.compare_at_price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock & Quick Adjust */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUpdateStock(prod.id, -1)}
                              disabled={prod.stock_quantity <= 0}
                              className="w-5 h-5 rounded border border-border bg-background hover:bg-muted flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                              title="Restar 1 unidad"
                            >
                              -
                            </button>
                            <span className={`font-mono font-bold text-xs px-1 ${
                              prod.stock_quantity <= 5 ? 'text-destructive' : 'text-foreground'
                            }`}>
                              {prod.stock_quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateStock(prod.id, 1)}
                              className="w-5 h-5 rounded border border-border bg-background hover:bg-muted flex items-center justify-center text-xs font-bold cursor-pointer"
                              title="Sumar 1 unidad"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Flags */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            {prod.is_offer && (
                              <span className="p-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20" title="En Oferta">
                                <Flame className="w-3 h-3" />
                              </span>
                            )}
                            {prod.is_featured && (
                              <span className="p-1 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20" title="Destacado">
                                <Star className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4">
                          {prod.is_active ? (
                            <Badge variant="success">Activo</Badge>
                          ) : (
                            <Badge variant="destructive">Inactivo</Badge>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => openEditModal(prod)}
                            title="Editar producto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(prod.id, prod.name)}
                            title="Eliminar producto"
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
          <div className="bg-background border border-border rounded-xl w-full max-w-xl shadow-2xl p-6 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Tienda & Categoría Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">
                    Tienda / Punto de Venta Asociado *
                  </label>
                  <select
                    value={formData.store_id}
                    onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">🌐 Global (Todas las tiendas)</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        🏬 {s.name} ({s.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">
                    Categoría Principal *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        🍹 {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nombre & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-muted-foreground mb-1">Nombre del Producto *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Tequila Don Julio 70 Cristalino (750ml)"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Código SKU</label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="TEQ-DJ-70"
                  />
                </div>
              </div>

              {/* Precios & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Precio Venta ($) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45.00"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Precio Antes ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    placeholder="55.00"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Stock Inicial</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* URL Imagen */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1">URL Imagen</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px]"
                  placeholder="Notas de cata, maridaje, añejamiento..."
                />
              </div>

              {/* Flags */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active_prod"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-border text-primary"
                  />
                  <label htmlFor="is_active_prod" className="font-semibold text-foreground cursor-pointer">
                    Activo
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_offer_prod"
                    checked={formData.is_offer}
                    onChange={(e) => setFormData({ ...formData, is_offer: e.target.checked })}
                    className="rounded border-border text-amber-500"
                  />
                  <label htmlFor="is_offer_prod" className="font-semibold text-foreground cursor-pointer">
                    En Oferta
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured_prod"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-border text-indigo-500"
                  />
                  <label htmlFor="is_featured_prod" className="font-semibold text-foreground cursor-pointer">
                    Destacado
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-white">
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
