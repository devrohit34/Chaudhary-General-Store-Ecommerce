'use client';

import { useEffect, useState } from 'react';
import { supabase, Order } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Eye, Search, CreditCard, Smartphone, IndianRupee, Clock } from 'lucide-react';
import { toast } from 'sonner';

type PaymentFilter = 'all' | 'pending_verification' | 'paid' | 'rejected' | 'cod';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  pending_verification: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [rejectDialog, setRejectDialog] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

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

  const verifyPayment = async (order: Order) => {
    setProcessing(true);
    const { error } = await supabase.from('orders').update({
      payment_status: 'paid',
      upi_verified_at: new Date().toISOString(),
      upi_rejected_reason: null,
      status: 'confirmed',
    }).eq('id', order.id);
    if (error) toast.error('Failed to verify');
    else { toast.success('Payment verified'); fetchOrders(); }
    setProcessing(false);
  };

  const rejectPayment = async () => {
    if (!rejectDialog) return;
    setProcessing(true);
    const { error } = await supabase.from('orders').update({
      payment_status: 'rejected',
      upi_rejected_reason: rejectReason || 'Payment could not be verified',
    }).eq('id', rejectDialog.id);
    if (error) toast.error('Failed to reject');
    else { toast.success('Payment rejected'); setRejectDialog(null); setRejectReason(''); fetchOrders(); }
    setProcessing(false);
  };

  const upiOrders = orders.filter((o) => ['upi', 'phonepe', 'googlepay', 'paytm'].includes(o.payment_method));
  const codOrders = orders.filter((o) => o.payment_method === 'cod');
  const pendingVerification = upiOrders.filter((o) => o.payment_status === 'pending_verification' && o.utr_number).length;

  const filtered = orders.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase());
    let matchFilter = true;
    if (filter === 'cod') matchFilter = o.payment_method === 'cod';
    else if (filter === 'pending_verification') matchFilter = o.payment_status === 'pending_verification';
    else if (filter === 'paid') matchFilter = o.payment_status === 'paid';
    else if (filter === 'rejected') matchFilter = o.payment_status === 'rejected';
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 text-sm mt-1">Manage UPI and COD payments</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: orders.length, icon: IndianRupee, color: 'bg-green-100 text-green-600' },
          { label: 'Needs Verification', value: pendingVerification, icon: Clock, color: 'bg-blue-100 text-blue-600' },
          { label: 'UPI Orders', value: upiOrders.length, icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
          { label: 'COD Orders', value: codOrders.length, icon: CreditCard, color: 'bg-amber-100 text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-xl font-bold text-gray-900">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search order number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as PaymentFilter)}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending_verification">Needs Verification</SelectItem>
            <SelectItem value="paid">Verified / Paid</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cod">Cash on Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No payments found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isUpi = ['upi', 'phonepe', 'googlepay', 'paytm'].includes(order.payment_method);
            return (
              <div key={order.id} className="bg-white rounded-xl border shadow-sm p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">#{order.order_number}</span>
                      <Badge className="uppercase text-xs">{order.payment_method}</Badge>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[order.payment_status] || statusColors.pending}>
                      {order.payment_status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="font-bold text-lg text-gray-900">₹{order.total_amount}</span>
                  </div>
                </div>

                {isUpi && (
                  <div className="border-t pt-3 mt-1 space-y-3">
                    {order.utr_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">UTR:</span>
                        <span className="font-mono font-medium text-gray-900">{order.utr_number}</span>
                      </div>
                    )}
                    {order.payment_screenshot_url && (
                      <div className="flex items-center gap-3">
                        <img
                          src={order.payment_screenshot_url}
                          alt="Screenshot"
                          className="h-16 w-16 rounded-lg border object-cover cursor-pointer hover:opacity-80"
                          onClick={() => window.open(order.payment_screenshot_url!, '_blank')}
                        />
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => window.open(order.payment_screenshot_url!, '_blank')} className="gap-1">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                          {order.payment_status === 'pending_verification' && (
                            <>
                              <Button size="sm" onClick={() => verifyPayment(order)} disabled={processing} className="bg-green-600 hover:bg-green-700 text-white gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Verify
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => { setRejectDialog(order); setRejectReason(''); }} className="gap-1">
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {!order.utr_number && order.payment_status === 'pending_verification' && (
                      <p className="text-xs text-gray-400 italic">Waiting for customer to submit payment details...</p>
                    )}
                    {order.payment_status === 'rejected' && order.upi_rejected_reason && (
                      <p className="text-xs text-red-600">Reason: {order.upi_rejected_reason}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(open) => { if (!open) setRejectDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment – #{rejectDialog?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Rejection</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR not found, incorrect amount..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejectDialog(null)} className="flex-1">Cancel</Button>
              <Button variant="destructive" onClick={rejectPayment} disabled={processing} className="flex-1">
                {processing ? 'Rejecting...' : 'Reject Payment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
