'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, Order, OrderItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Search, Eye, CheckCircle, XCircle, Truck, Package, Clock, MapPin, Phone, User,
  CreditCard, Camera, Calendar, IndianRupee, ChevronDown, ChevronUp, Filter,
  Check, X, AlertCircle, Loader2, Send, ShoppingCart, Box, Store
} from 'lucide-react';

type OrderWithItems = Order & { order_items?: OrderItem[] };
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'pending_verification' | 'paid' | 'rejected' | 'failed' | 'refunded';
type StatusFilter = 'all' | OrderStatus;
type PaymentFilter = 'all' | PaymentStatus | 'cod';

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'processing', label: 'Packed', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
];

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  pending_verification: { label: 'Verification Pending', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700' },
};

const UPI_ID = '8051806325@axl';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<OrderWithItems | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersData) {
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
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
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleRow = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setProcessing(true);
    const updateData: Record<string, unknown> = { status };
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order marked as ${status.replace(/_/g, ' ')}`);
      fetchOrders();
    }
    setProcessing(false);
  };

  const verifyPayment = async (order: OrderWithItems) => {
    setProcessing(true);
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        upi_verified_at: new Date().toISOString(),
        upi_rejected_reason: null,
        status: 'confirmed',
      })
      .eq('id', order.id);
    if (error) {
      toast.error('Failed to verify payment');
    } else {
      toast.success('Payment verified successfully');
      fetchOrders();
    }
    setProcessing(false);
  };

  const rejectPayment = async () => {
    if (!rejectDialog) return;
    setProcessing(true);
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'rejected',
        upi_rejected_reason: rejectReason || 'Payment could not be verified',
      })
      .eq('id', rejectDialog.id);
    if (error) {
      toast.error('Failed to reject payment');
    } else {
      toast.success('Payment rejected');
      setRejectDialog(null);
      setRejectReason('');
      fetchOrders();
    }
    setProcessing(false);
  };

  const openOrderDetails = async (order: OrderWithItems) => {
    if (!order.order_items || order.order_items.length === 0) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      order.order_items = items || [];
    }
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const isUpiOrder = (order: Order) => ['upi', 'phonepe', 'googlepay', 'paytm'].includes(order.payment_method);

  const filteredOrders = orders.filter((order) => {
    const address = order.address_snapshot as Record<string, string> | null;
    const customerName = address?.full_name || '';
    const customerPhone = address?.phone || '';

    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchesPayment = true;
    if (paymentFilter === 'cod') {
      matchesPayment = order.payment_method === 'cod';
    } else if (paymentFilter !== 'all') {
      matchesPayment = order.payment_status === paymentFilter;
    }

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusConfig = (status: string) => ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  const getPaymentConfig = (status: string) => PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pending;

  const summaryStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pendingVerification: orders.filter(o => o.payment_status === 'pending_verification' && o.utr_number).length,
  };

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track all customer orders</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Orders', value: summaryStats.total, icon: ShoppingCart, color: 'bg-gray-100 text-gray-600' },
          { label: 'Pending', value: summaryStats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Packed', value: summaryStats.processing, icon: Package, color: 'bg-purple-100 text-purple-600' },
          { label: 'Out for Delivery', value: summaryStats.outForDelivery, icon: Truck, color: 'bg-orange-100 text-orange-600' },
          { label: 'Delivered', value: summaryStats.delivered, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
          { label: 'Needs Verification', value: summaryStats.pendingVerification, icon: AlertCircle, color: 'bg-blue-100 text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Order ID, Customer Name, or Mobile Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-44">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}>
              <SelectTrigger className="w-48">
                <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="pending_verification">Verification Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-6">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const address = order.address_snapshot as Record<string, string> | null;
                  const statusConfig = getStatusConfig(order.status);
                  const paymentConfig = getPaymentConfig(order.payment_status);
                  const isExpanded = expandedRows.has(order.id);

                  return (
                    <>
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleRow(order.id)}
                            className="flex items-center gap-2 text-primary font-semibold hover:underline"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            #{order.order_number}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="font-medium text-gray-900">{address?.full_name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {address?.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-bold text-gray-900">₹{order.total_amount.toFixed(0)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="uppercase text-xs">
                              {order.payment_method}
                            </Badge>
                            <Badge className={`${paymentConfig.color} text-xs`}>
                              {paymentConfig.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={`${statusConfig.color} capitalize`}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openOrderDetails(order)}
                              className="gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Details */}
                      {isExpanded && (
                        <tr key={`${order.id}-expanded`} className="bg-gray-50">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid md:grid-cols-3 gap-4">
                              {/* Address */}
                              <div className="bg-white rounded-lg border p-4">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-green-600" /> Delivery Address
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p className="font-medium">{address?.full_name}</p>
                                  <p>{address?.phone}</p>
                                  <p>{address?.address_line1}</p>
                                  {address?.address_line2 && <p>{address.address_line2}</p>}
                                  <p>{address?.city}, {address?.state} - {address?.pincode}</p>
                                </div>
                              </div>

                              {/* Quick Status Update */}
                              <div className="bg-white rounded-lg border p-4">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <Package className="h-4 w-4 text-green-600" /> Update Status
                                </h4>
                                <Select
                                  value={order.status}
                                  onValueChange={(v) => updateOrderStatus(order.id, v as OrderStatus)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ORDER_STATUSES.map((s) => (
                                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* UPI Payment Verification */}
                              {isUpiOrder(order) && (
                                <div className="bg-white rounded-lg border p-4">
                                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Camera className="h-4 w-4 text-green-600" /> Payment Details
                                  </h4>
                                  {order.payment_status === 'pending_verification' && order.utr_number && (
                                    <div className="space-y-3">
                                      <div className="text-sm">
                                        <span className="text-gray-500">UTR:</span>
                                        <span className="font-mono font-medium ml-2">{order.utr_number}</span>
                                      </div>
                                      {order.payment_screenshot_url && (
                                        <img
                                          src={order.payment_screenshot_url}
                                          alt="Screenshot"
                                          className="h-20 rounded border object-cover cursor-pointer"
                                          onClick={() => window.open(order.payment_screenshot_url!, '_blank')}
                                        />
                                      )}
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                          onClick={() => verifyPayment(order)}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => setRejectDialog(order)}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" /> Reject
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  {order.payment_status === 'pending_verification' && !order.utr_number && (
                                    <p className="text-sm text-gray-400">Waiting for customer to submit payment details...</p>
                                  )}
                                  {order.payment_status === 'paid' && (
                                    <div className="flex items-center gap-2 text-green-600">
                                      <CheckCircle className="h-4 w-4" />
                                      <span className="text-sm font-medium">Payment Verified</span>
                                    </div>
                                  )}
                                  {order.payment_status === 'rejected' && (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-red-600">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Payment Rejected</span>
                                      </div>
                                      {order.upi_rejected_reason && (
                                        <p className="text-xs text-red-500">{order.upi_rejected_reason}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  Order #{selectedOrder.order_number}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${getStatusConfig(selectedOrder.status).color} capitalize`}>
                    {getStatusConfig(selectedOrder.status).label}
                  </Badge>
                  <Badge className={`${getPaymentConfig(selectedOrder.payment_status).color}`}>
                    {getPaymentConfig(selectedOrder.payment_status).label}
                  </Badge>
                  <Badge variant="outline" className="uppercase">
                    {selectedOrder.payment_method}
                  </Badge>
                </div>

                <Tabs defaultValue="customer" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="customer">Customer</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  {/* Customer Tab */}
                  <TabsContent value="customer" className="mt-4 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {(selectedOrder.address_snapshot as Record<string, string>)?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            <Phone className="h-3.5 w-3.5 inline mr-1" />
                            {(selectedOrder.address_snapshot as Record<string, string>)?.phone || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-600" /> Delivery Address
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{(selectedOrder.address_snapshot as Record<string, string>)?.address_line1}</p>
                          {(selectedOrder.address_snapshot as Record<string, string>)?.address_line2 && (
                            <p>{(selectedOrder.address_snapshot as Record<string, string>).address_line2}</p>
                          )}
                          <p>
                            {(selectedOrder.address_snapshot as Record<string, string>)?.city},{' '}
                            {(selectedOrder.address_snapshot as Record<string, string>)?.state} -{' '}
                            {(selectedOrder.address_snapshot as Record<string, string>)?.pincode}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.delivery_slot && (
                        <div className="border-t pt-3">
                          <p className="text-sm">
                            <Calendar className="h-4 w-4 inline mr-1 text-green-600" />
                            <span className="text-gray-500">Delivery Slot:</span>{' '}
                            <span className="font-medium">{selectedOrder.delivery_slot}</span>
                          </p>
                          {selectedOrder.delivery_otp && (
                            <p className="text-sm mt-2">
                              <span className="text-gray-500">Delivery OTP:</span>{' '}
                              <span className="font-mono font-bold text-lg text-green-600">{selectedOrder.delivery_otp}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Products Tab */}
                  <TabsContent value="products" className="mt-4 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="divide-y">
                        {selectedOrder.order_items?.map((item) => (
                          <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="h-16 w-16 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 border">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product_name}</p>
                              {item.brand && <p className="text-xs text-gray-500">{item.brand}</p>}
                              <p className="text-sm text-gray-500">
                                ₹{item.price} x {item.quantity}
                                {item.unit && <span className="ml-1">({item.unit})</span>}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t mt-4 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span>₹{selectedOrder.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Delivery</span>
                          <span>₹{selectedOrder.delivery_charge}</span>
                        </div>
                        {selectedOrder.gst_amount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">GST</span>
                            <span>₹{selectedOrder.gst_amount}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span className="text-green-600">₹{selectedOrder.total_amount}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Payment Tab */}
                  <TabsContent value="payment" className="mt-4 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Payment Method</span>
                        <Badge variant="outline" className="uppercase">{selectedOrder.payment_method}</Badge>
                      </div>

                      {isUpiOrder(selectedOrder) && (
                        <>
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <IndianRupee className="h-4 w-4 text-green-600" /> UPI Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">UPI ID</span>
                                <span className="font-mono">{UPI_ID}</span>
                              </div>
                              {selectedOrder.utr_number && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">UTR Number</span>
                                  <span className="font-mono font-medium">{selectedOrder.utr_number}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {selectedOrder.payment_screenshot_url && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Camera className="h-4 w-4 text-green-600" /> Payment Screenshot
                              </h4>
                              <img
                                src={selectedOrder.payment_screenshot_url}
                                alt="Payment Screenshot"
                                className="max-h-48 rounded-lg border cursor-pointer"
                                onClick={() => window.open(selectedOrder.payment_screenshot_url!, '_blank')}
                              />
                            </div>
                          )}

                          {/* Payment Verification Actions */}
                          {selectedOrder.payment_status === 'pending_verification' && selectedOrder.utr_number && (
                            <div className="border-t pt-4 space-y-3">
                              <h4 className="font-medium">Verify Payment</h4>
                              <div className="flex gap-2">
                                <Button
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => { verifyPayment(selectedOrder); setDetailsOpen(false); }}
                                  disabled={processing}
                                >
                                  {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                  Approve Payment
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => { setRejectDialog(selectedOrder); setDetailsOpen(false); }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" /> Reject
                                </Button>
                              </div>
                            </div>
                          )}

                          {selectedOrder.payment_status === 'paid' && selectedOrder.upi_verified_at && (
                            <div className="border-t pt-4 flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <div>
                                <p className="font-medium">Payment Verified</p>
                                <p className="text-xs text-gray-500">
                                  on {new Date(selectedOrder.upi_verified_at).toLocaleDateString('en-IN')}
                                </p>
                              </div>
                            </div>
                          )}

                          {selectedOrder.payment_status === 'rejected' && (
                            <div className="border-t pt-4">
                              <div className="flex items-center gap-2 text-red-600 mb-2">
                                <XCircle className="h-5 w-5" />
                                <p className="font-medium">Payment Rejected</p>
                              </div>
                              {selectedOrder.upi_rejected_reason && (
                                <p className="text-sm text-red-500 bg-red-50 rounded-lg p-2">
                                  {selectedOrder.upi_rejected_reason}
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </TabsContent>

                  {/* Timeline Tab */}
                  <TabsContent value="timeline" className="mt-4 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="space-y-4">
                        {[
                          { status: 'pending', label: 'Order Placed', time: selectedOrder.created_at, icon: Clock },
                          { status: 'confirmed', label: 'Order Confirmed', time: selectedOrder.status !== 'pending' ? selectedOrder.updated_at : null, icon: CheckCircle },
                          { status: 'processing', label: 'Order Packed', time: ['processing', 'out_for_delivery', 'delivered'].includes(selectedOrder.status) ? selectedOrder.updated_at : null, icon: Package },
                          { status: 'out_for_delivery', label: 'Out for Delivery', time: ['out_for_delivery', 'delivered'].includes(selectedOrder.status) ? selectedOrder.updated_at : null, icon: Truck },
                          { status: 'delivered', label: 'Delivered', time: selectedOrder.delivered_at, icon: CheckCircle },
                        ].map((step, index) => {
                          const isActive = step.time !== null;
                          const StepIcon = step.icon;
                          return (
                            <div key={step.status} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                  isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <StepIcon className="h-4 w-4" />
                                </div>
                                {index < 4 && (
                                  <div className={`w-0.5 h-8 ${isActive ? 'bg-green-200' : 'bg-gray-100'}`} />
                                )}
                              </div>
                              <div className="flex-1 pt-1">
                                <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {step.label}
                                </p>
                                {step.time && (
                                  <p className="text-xs text-gray-500">
                                    {new Date(step.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Order Actions */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3">Order Actions</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedOrder.status === 'pending' && (
                      <>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => { updateOrderStatus(selectedOrder.id, 'confirmed'); setDetailsOpen(false); }}
                          disabled={processing}
                        >
                          <Check className="h-4 w-4 mr-2" /> Accept Order
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => { updateOrderStatus(selectedOrder.id, 'cancelled'); setDetailsOpen(false); }}
                        >
                          <X className="h-4 w-4 mr-2" /> Reject Order
                        </Button>
                      </>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => { updateOrderStatus(selectedOrder.id, 'processing'); setDetailsOpen(false); }}
                      >
                        <Package className="h-4 w-4 mr-2" /> Mark as Packed
                      </Button>
                    )}
                    {selectedOrder.status === 'processing' && (
                      <Button
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => { updateOrderStatus(selectedOrder.id, 'out_for_delivery'); setDetailsOpen(false); }}
                      >
                        <Truck className="h-4 w-4 mr-2" /> Out for Delivery
                      </Button>
                    )}
                    {selectedOrder.status === 'out_for_delivery' && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => { updateOrderStatus(selectedOrder.id, 'delivered'); setDetailsOpen(false); }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Mark Delivered
                      </Button>
                    )}
                    {!['delivered', 'cancelled'].includes(selectedOrder.status) && selectedOrder.status !== 'pending' && (
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { updateOrderStatus(selectedOrder.id, 'cancelled'); setDetailsOpen(false); }}
                      >
                        <X className="h-4 w-4 mr-2" /> Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(open) => { if (!open) { setRejectDialog(null); setRejectReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment - #{rejectDialog?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR not found, incorrect amount, unclear screenshot..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason(''); }} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={rejectPayment} disabled={processing} className="flex-1">
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reject Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
