'use client';

import { useEffect, useState } from 'react';
import { supabase, Order } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, MapPin, Clock, CheckCircle, Package, Zap } from 'lucide-react';
import { toast } from 'sonner';

const deliveryStatuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  processing: { color: 'bg-purple-100 text-purple-700', icon: Package },
  out_for_delivery: { color: 'bg-orange-100 text-orange-700', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-700', icon: Clock },
};

export default function DeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('active');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : null,
      })
      .eq('id', id);
    if (error) toast.error('Failed to update status');
    else { toast.success('Delivery status updated'); fetchOrders(); }
  };

  const filtered = orders.filter((o) => {
    if (filterStatus === 'active') return !['delivered', 'cancelled'].includes(o.status);
    if (filterStatus === 'delivered') return o.status === 'delivered';
    if (filterStatus === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  const activeCount = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
  const outForDelivery = orders.filter((o) => o.status === 'out_for_delivery').length;
  const deliveredToday = orders.filter((o) => {
    if (o.status !== 'delivered' || !o.delivered_at) return false;
    return new Date(o.delivered_at).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
        <p className="text-gray-500 text-sm mt-1">Track and update delivery status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Deliveries', value: activeCount, icon: Truck, color: 'bg-blue-100 text-blue-600' },
          { label: 'Out for Delivery', value: outForDelivery, icon: MapPin, color: 'bg-orange-100 text-orange-600' },
          { label: 'Delivered Today', value: deliveredToday, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'active', label: 'Active' },
          { value: 'all', label: 'All Orders' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filterStatus === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(f.value)}
            className={filterStatus === f.value ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          No orders in this category
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div key={order.id} className="bg-white rounded-xl border shadow-sm p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">#{order.order_number}</span>
                      {order.is_express && (
                        <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 text-xs">
                          <Zap className="h-3 w-3" /> Express
                        </Badge>
                      )}
                      <Badge className={`${config.color} border-0 gap-1 text-xs`}>
                        <StatusIcon className="h-3 w-3" />
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    {order.address_snapshot && (
                      <div className="flex items-start gap-1 text-xs text-gray-500 mb-1">
                        <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span>
                          {order.address_snapshot.full_name} · {order.address_snapshot.address_line1},{' '}
                          {order.address_snapshot.city} – {order.address_snapshot.pincode}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      {order.delivery_slot && <span>Slot: {order.delivery_slot}</span>}
                      <span className="font-semibold text-gray-700">₹{order.total_amount}</span>
                    </div>

                    {order.delivery_otp && (
                      <div className="mt-2 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-green-600 font-medium">Delivery OTP:</span>
                        <span className="font-bold text-green-800 tracking-widest text-sm">{order.delivery_otp}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                      <SelectTrigger className="w-48 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryStatuses.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize text-sm">
                            {s.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
