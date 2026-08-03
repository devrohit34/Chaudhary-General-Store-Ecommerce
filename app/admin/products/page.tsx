'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, Product, Category } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Search, Package, Upload, X, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', name_hi: '', slug: '', description: '', brand: '', price: '', original_price: '',
    stock_quantity: '', weight: '', image_url: '', category_id: '', is_featured: false, is_flash_sale: false, unit: 'piece',
  });

  useEffect(() => {
    fetchProducts();
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []));
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '', name_hi: '', slug: '', description: '', brand: '', price: '', original_price: '',
      stock_quantity: '', weight: '', image_url: '', category_id: '', is_featured: false, is_flash_sale: false, unit: 'piece',
    });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, name_hi: p.name_hi || '', slug: p.slug, description: p.description || '', brand: p.brand || '',
      price: String(p.price), original_price: String(p.original_price || ''), stock_quantity: String(p.stock_quantity),
      weight: p.weight || '', image_url: p.image_url || '', category_id: p.category_id || '', is_featured: p.is_featured,
      is_flash_sale: p.is_flash_sale, unit: p.unit || 'piece',
    });
    setDialogOpen(true);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    setUploading(true);

    try {
      const compressedFile = await compressImage(file);
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setForm((current) => ({ ...current, image_url: urlData.publicUrl }));
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Failed to upload image');
    }
    setUploading(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await uploadImage(files[0]);
    }
  }, [uploadImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadImage(files[0]);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        let { width, height } = img;
        const maxSize = 1200;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8
          );
        } else {
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const clearImage = () => {
    setForm((current) => ({ ...current, image_url: '' }));
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const payload = {
      name: form.name.trim(),
      name_hi: form.name_hi.trim() || null,
      slug,
      description: form.description.trim() || null,
      brand: form.brand.trim() || null,
      price: Number(form.price) || 0,
      original_price: form.original_price ? Number(form.original_price) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
      weight: form.weight.trim() || null,
      image_url: form.image_url.trim() || null,
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      is_flash_sale: form.is_flash_sale,
      is_active: true,
      unit: form.unit || 'piece',
      discount_percent: form.original_price && Number(form.original_price) > Number(form.price)
        ? Math.round(((Number(form.original_price) - Number(form.price)) / Number(form.original_price)) * 100) : 0,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success('Product added successfully');
      }
      setDialogOpen(false);
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Product deleted'); fetchProducts(); }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} total products</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 max-w-md bg-white" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">No products available.</p>
          <p className="text-gray-400 mb-6">Click &quot;Add Product&quot; to create your first product.</p>
          <Button onClick={openAdd} className="gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm">
                  <th className="p-4 font-semibold text-gray-600">Product</th>
                  <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Brand</th>
                  <th className="p-4 font-semibold text-gray-600">Price</th>
                  <th className="p-4 font-semibold text-gray-600 hidden sm:table-cell">Stock</th>
                  <th className="p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                          {p.image_url ? (
                            <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 line-clamp-1">{p.name}</div>
                          <div className="flex gap-1 mt-0.5">
                            {p.is_featured && <Badge className="bg-green-100 text-green-700 text-xs">Featured</Badge>}
                            {p.is_flash_sale && <Badge className="bg-orange-100 text-orange-700 text-xs">Flash</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 hidden md:table-cell">{p.brand || '-'}</td>
                    <td className="p-4">
                      <span className="font-bold text-gray-900">₹{p.price}</span>
                      {p.original_price && p.original_price > p.price && (
                        <span className="text-xs text-gray-400 line-through ml-1">₹{p.original_price}</span>
                      )}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`${p.stock_quantity < 20 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {p.stock_quantity}
                      </span>
                      {p.stock_quantity < 20 && <AlertTriangle className="h-3 w-3 inline ml-1 text-red-500" />}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="hover:bg-gray-100">
                          <Pencil className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(p.id)} className="hover:bg-red-50">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Image Upload Section */}
            <div>
              <Label className="mb-2 block">Product Image</Label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-green-500 bg-green-50'
                    : form.image_url
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !form.image_url && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : form.image_url ? (
                  <div className="relative inline-block">
                    <Image
                      src={form.image_url}
                      alt="Product preview"
                      width={160}
                      height={160}
                      className="h-40 w-40 object-cover rounded-lg mx-auto shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearImage(); }}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600 font-medium">Drag & drop an image here</p>
                    <p className="text-xs text-gray-400">or click to browse (JPG, PNG, WebP - Max 5MB)</p>
                  </div>
                )}
              </div>

              {/* External URL option */}
              <div className="mt-3">
                <Label className="text-xs text-gray-500">Or paste external image URL</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <Label>Product Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Chana Daal 1Kg"
                />
              </div>
              <div>
                <Label>Name (Hindi)</Label>
                <Input
                  value={form.name_hi}
                  onChange={(e) => setForm({ ...form, name_hi: e.target.value })}
                  placeholder="हिंदी में"
                />
              </div>
              <div>
                <Label>Brand</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Brand name"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Original Price (₹)</Label>
                <Input
                  type="number"
                  value={form.original_price}
                  onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                  placeholder="For discount display"
                />
              </div>
              <div>
                <Label>Stock Quantity *</Label>
                <Input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Weight/Volume</Label>
                <Input
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="e.g. 500g, 1L, 1Kg"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="L">Litre (L)</SelectItem>
                    <SelectItem value="mL">Millilitre (mL)</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Product description..."
                />
              </div>
              <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                  <span className="text-sm font-medium">Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={form.is_flash_sale} onCheckedChange={(v) => setForm({ ...form, is_flash_sale: v })} />
                  <span className="text-sm font-medium">Flash Sale</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
