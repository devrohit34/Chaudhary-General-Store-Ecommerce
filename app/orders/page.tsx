'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Order } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', icon: Package, color: 'bg-purple-100 text-purple-700' },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'bg-orange-100 text-orange-700' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-700' },
  returned: { label: 'Returned', icon: XCircle, color: 'bg-red-100 text-red-700' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) {
        const ordersWithItems = await Promise.all(
          data.map(async (order) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);
            return { ...order, order_items: items || [] };
          })
        );
        setOrders(ordersWithItems);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">My Orders</span>
      </div>

      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl shimmer" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">No orders yet</p>
          <Link href="/products"><Button size="lg">Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <Link key={order.id} href={`/orders/${order.order_number}`}>
                <div className="border rounded-xl p-4 bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold">Order #{order.order_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" /> {status.label}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {order.order_items?.slice(0, 5).map((item, i) => (
                      <div key={i} className="h-12 w-12 rounded-lg overflow-hidden bg-muted border">
                        {item.product_image && (
                          <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                        )}
                      </div>
                    ))}
                    {order.order_items && order.order_items.length > 5 && (
                      <div className="h-12 w-12 rounded-lg bg-muted border flex items-center justify-center text-sm font-medium">
                        +{order.order_items.length - 5}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{order.order_items?.length || 0} items</span>
                    <span className="font-bold">₹{order.total_amount}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
