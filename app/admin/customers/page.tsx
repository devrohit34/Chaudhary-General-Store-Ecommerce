'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, User, ShoppingBag, Phone, MapPin, Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  full_name: string | null;
  phone: string | null;
  loyalty_points: number;
  created_at: string;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [orderStats, setOrderStats] = useState<Record<string, { count: number; total: number }>>({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setCustomers(data || []);

    if (data && data.length > 0) {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('user_id, total_amount, status');
      if (ordersData) {
        const stats: Record<string, { count: number; total: number }> = {};
        ordersData.forEach((o) => {
          if (!o.user_id) return;
          if (!stats[o.user_id]) stats[o.user_id] = { count: 0, total: 0 };
          stats[o.user_id].count++;
          stats[o.user_id].total += Number(o.total_amount);
        });
        setOrderStats(stats);
      }
    }
    setLoading(false);
  }

  const viewCustomer = async (c: Customer) => {
    setSelected(c);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', c.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setOrders(data || []);
  };

  const filtered = customers.filter(
    (c) =>
      (c.full_name?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (c.phone?.includes(search) || false)
  );

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">{customers.length} registered customers</p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No customers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 hidden sm:table-cell">Orders</th>
                <th className="px-4 py-3 hidden lg:table-cell">Total Spent</th>
                <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => {
                const stats = orderStats[c.id] || { count: 0, total: 0 };
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold text-sm flex-shrink-0">
                          {(c.full_name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{c.full_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-400">
                            {c.loyalty_points > 0 ? `${c.loyalty_points} pts` : 'No points'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge className="bg-blue-50 text-blue-700 border-0">{stats.count} orders</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm font-semibold text-gray-900">
                      ₹{stats.total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => viewCustomer(c)} className="gap-1">
                        <Eye className="h-4 w-4" /> View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-sm">
                {(selected?.full_name?.[0] || '?').toUpperCase()}
              </div>
              {selected?.full_name || 'Customer Details'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="font-medium text-sm mt-0.5">{selected.phone || '—'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Loyalty Points</div>
                  <div className="font-medium text-sm mt-0.5">{selected.loyalty_points}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Total Orders</div>
                  <div className="font-medium text-sm mt-0.5">{orderStats[selected.id]?.count || 0}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Total Spent</div>
                  <div className="font-medium text-sm mt-0.5">
                    ₹{(orderStats[selected.id]?.total || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <div className="font-medium text-sm">#{o.order_number}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(o.created_at).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">₹{o.total_amount}</div>
                          <Badge className="text-xs capitalize">{o.status.replace(/_/g, ' ')}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
