'use client';

import { useEffect, useState } from 'react';
import { supabase, Order } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, IndianRupee, ShoppingCart, Package, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Period = '7d' | '30d' | '90d';

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: true });
      setOrders((data as any) || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);

  const periodOrders = orders.filter((o) => new Date(o.created_at) >= cutoff);
  const totalRevenue = periodOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const avgOrderValue = periodOrders.length > 0 ? totalRevenue / periodOrders.length : 0;
  const deliveredOrders = periodOrders.filter((o) => o.status === 'delivered').length;

  // Daily revenue for chart
  const dailyData: { day: string; revenue: number; orders: number }[] = [];
  for (let i = Math.min(periodDays, 30) - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const dayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === date.toDateString());
    dailyData.push({
      day: dayStr,
      revenue: dayOrders.reduce((s, o) => s + Number(o.total_amount), 0),
      orders: dayOrders.length,
    });
  }

  // Monthly revenue
  const monthlyMap: Record<string, number> = {};
  orders.forEach((o) => {
    const key = new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    monthlyMap[key] = (monthlyMap[key] || 0) + Number(o.total_amount);
  });
  const monthlyData = Object.entries(monthlyMap)
    .slice(-6)
    .map(([month, revenue]) => ({ month, revenue }));

  // Payment method distribution
  const methodMap: Record<string, number> = {};
  periodOrders.forEach((o) => {
    const method = o.payment_method.toUpperCase();
    methodMap[method] = (methodMap[method] || 0) + 1;
  });
  const paymentData = Object.entries(methodMap).map(([name, value]) => ({ name, value }));

  // Best selling products (from order items)
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  (periodOrders as any[]).forEach((o) => {
    (o.order_items || []).forEach((item: any) => {
      if (!productMap[item.product_name]) {
        productMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
      }
      productMap[item.product_name].qty += item.quantity;
      productMap[item.product_name].revenue += item.price * item.quantity;
    });
  });
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const pieColors = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Sales analytics and insights</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className={period === p ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-green-100 text-green-600' },
              { label: 'Total Orders', value: periodOrders.length, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
              { label: 'Avg Order Value', value: `₹${Math.round(avgOrderValue).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
              { label: 'Delivered', value: deliveredOrders, icon: Package, color: 'bg-amber-100 text-amber-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                    <div className="text-lg font-bold text-gray-900">{s.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Revenue */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" /> Daily Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dailyData.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => `₹${v}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders per day */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" /> Orders Per Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyData.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Revenue */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" /> Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => `₹${v}`} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-amber-600" /> Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentData.length === 0 ? (
                  <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {paymentData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Best Selling Products */}
          {topProducts.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.qty} units sold</div>
                      </div>
                      <div className="text-sm font-bold text-gray-900">₹{p.revenue.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
