'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Order } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package, ShoppingCart, Users, TrendingUp, AlertTriangle, IndianRupee,
  ChevronRight, BarChart3, Clock, CheckCircle, Truck, Star,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  CartesianGrid, BarChart, Bar,
} from 'recharts';

export default function AdminPage() {
  const [stats, setStats] = useState({
    products: 0,
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenue: 0,
    todayRevenue: 0,
    customers: 0,
    lowStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const today = new Date().toDateString();

      const [prodRes, ordRes, customerRes, lowStockRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).lt('stock_quantity', 10),
      ]);

      const allOrders: Order[] = ordRes.data || [];
      const todayOrders = allOrders.filter((o) => new Date(o.created_at).toDateString() === today);
      const pendingOrders = allOrders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.status));
      const completedOrders = allOrders.filter((o) => o.status === 'delivered');
      const revenue = allOrders.reduce((s, o) => s + Number(o.total_amount), 0);
      const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total_amount), 0);

      setStats({
        products: prodRes.count || 0,
        totalOrders: allOrders.length,
        todayOrders: todayOrders.length,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        revenue,
        todayRevenue,
        customers: customerRes.count || 0,
        lowStock: lowStockRes.count || 0,
      });

      setRecentOrders(allOrders.slice(0, 6));

      const days: any[] = [];
      for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const dayRevenue = allOrders
          .filter((o) => new Date(o.created_at).toDateString() === date.toDateString())
          .reduce((s, o) => s + Number(o.total_amount), 0);
        days.push({ day: label, revenue: dayRevenue });
      }
      setRevenueData(days);

      const statusCounts: Record<string, number> = {};
      allOrders.forEach((o) => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });
      setOrderStatusData(
        Object.entries(statusCounts).map(([status, count]) => ({
          status: status.replace(/_/g, ' '),
          count,
        }))
      );

      setLoading(false);
    }
    fetchData();
  }, []);

  const statCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600', href: '/admin/orders' },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-green-100 text-green-600', href: '/admin/reports' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-100 text-amber-600', href: '/admin/orders' },
    { label: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600', href: '/admin/orders' },
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600', href: '/admin/reports' },
    { label: 'Total Orders', value: stats.totalOrders, icon: Truck, color: 'bg-cyan-100 text-cyan-600', href: '/admin/orders' },
    { label: 'Total Customers', value: stats.customers, icon: Users, color: 'bg-pink-100 text-pink-600', href: '/admin/customers' },
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-indigo-100 text-indigo-600', href: '/admin/products' },
    { label: 'Low Stock Alerts', value: stats.lowStock, icon: AlertTriangle, color: 'bg-red-100 text-red-600', href: '/admin/inventory' },
  ];

  const orderStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    'out for delivery': 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Welcome back, Kundan Kumar ·{' '}
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {statCards.map((s) => (
            <Link key={s.label} href={s.href}>
              <div className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} flex-shrink-0`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 truncate">{s.label}</div>
                    <div className="text-lg font-bold text-gray-900 truncate">{s.value}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" /> Revenue – Last 14 Days
              </CardTitle>
              <Link href="/admin/reports" className="text-xs text-green-600 hover:underline">Full Report</Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={1} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v: any) => `₹${v}`} />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" /> Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={orderStatusData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 9 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-xs text-green-600 hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium text-sm text-gray-900">#{order.order_number}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })} · {order.payment_method.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${orderStatusColors[order.status.replace(/_/g, ' ')] || 'bg-gray-100 text-gray-600'} border-0 text-xs capitalize`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="font-bold text-sm text-gray-900">₹{order.total_amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/products', label: 'Add Product', icon: Package, desc: 'Add new item to store' },
            { href: '/admin/orders', label: 'View Orders', icon: ShoppingCart, desc: 'Manage all orders' },
            { href: '/admin/inventory', label: 'Check Stock', icon: AlertTriangle, desc: 'Low stock alerts' },
            { href: '/admin/coupons', label: 'Create Coupon', icon: Star, desc: 'Discount offers' },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <div className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md hover:border-green-200 transition-all cursor-pointer group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700 mb-2 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-sm text-gray-900">{a.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
