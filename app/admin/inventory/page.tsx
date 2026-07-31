'use client';

import { useEffect, useState } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, AlertTriangle, PackageX, Package, TrendingDown, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

type StockStatus = 'all' | 'low' | 'out';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StockStatus>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('stock_quantity', { ascending: true });
    setProducts(data || []);
    setLoading(false);
  }

  const updateStock = async () => {
    if (!editing) return;
    const qty = parseInt(newStock);
    if (isNaN(qty) || qty < 0) {
      toast.error('Enter a valid stock quantity');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: qty })
      .eq('id', editing.id);
    if (error) {
      toast.error('Failed to update stock');
    } else {
      toast.success(`Stock updated to ${qty}`);
      setEditing(null);
      fetchProducts();
    }
    setSaving(false);
  };

  const getStockStatus = (p: Product) => {
    if (p.stock_quantity === 0) return 'out';
    if (p.stock_quantity < (p.min_stock_alert || 10)) return 'low';
    return 'ok';
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand?.toLowerCase().includes(search.toLowerCase()) || false);
    const status = getStockStatus(p);
    const matchFilter =
      filter === 'all' || (filter === 'out' && status === 'out') || (filter === 'low' && status === 'low');
    return matchSearch && matchFilter;
  });

  const outCount = products.filter((p) => p.stock_quantity === 0).length;
  const lowCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < (p.min_stock_alert || 10)).length;

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-500 text-sm mt-1">{products.length} products</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Products</div>
              <div className="text-xl font-bold text-gray-900">{products.length}</div>
            </div>
          </div>
        </div>
        <div
          className="bg-white rounded-xl border p-4 shadow-sm cursor-pointer hover:border-amber-300 transition-colors"
          onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Low Stock</div>
              <div className="text-xl font-bold text-amber-600">{lowCount}</div>
            </div>
          </div>
        </div>
        <div
          className="bg-white rounded-xl border p-4 shadow-sm cursor-pointer hover:border-red-300 transition-colors"
          onClick={() => setFilter(filter === 'out' ? 'all' : 'out')}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <PackageX className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Out of Stock</div>
              <div className="text-xl font-bold text-red-600">{outCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {(['all', 'low', 'out'] as StockStatus[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 hidden md:table-cell">Brand</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const status = getStockStatus(p);
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-9 w-9 rounded-lg object-cover border" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div className="font-medium text-sm text-gray-900 line-clamp-1">{p.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">{p.brand || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${status === 'out' ? 'text-red-600' : status === 'low' ? 'text-amber-600' : 'text-gray-900'}`}>
                        {p.stock_quantity}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/ min {p.min_stock_alert}</span>
                    </td>
                    <td className="px-4 py-3">
                      {status === 'out' ? (
                        <Badge className="bg-red-100 text-red-700 border-0 gap-1">
                          <PackageX className="h-3 w-3" /> Out of Stock
                        </Badge>
                      ) : status === 'low' ? (
                        <Badge className="bg-amber-100 text-amber-700 border-0 gap-1">
                          <AlertTriangle className="h-3 w-3" /> Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-0">In Stock</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditing(p); setNewStock(String(p.stock_quantity)); }}
                        className="gap-1 text-green-700 hover:bg-green-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Update
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">No products match your filter</div>
          )}
        </div>
      )}

      {/* Update Stock Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                {editing.image_url && (
                  <img src={editing.image_url} alt={editing.name} className="h-12 w-12 rounded-lg object-cover" />
                )}
                <div>
                  <div className="font-medium">{editing.name}</div>
                  <div className="text-sm text-gray-500">Current: {editing.stock_quantity} units</div>
                </div>
              </div>
              <div>
                <Label>New Stock Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Enter quantity"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Cancel</Button>
                <Button onClick={updateStock} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700">
                  {saving ? 'Saving...' : 'Update Stock'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
