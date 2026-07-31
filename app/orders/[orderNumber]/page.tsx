'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, Order } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, CheckCircle, Clock, Package, Truck, MapPin, Receipt, Copy, Upload, AlertCircle, Check, XCircle } from 'lucide-react';
import { UpiDynamicQr } from '@/components/upi-dynamic-qr';
import { toast } from 'sonner';

const UPI_ID = '8051806325@axl';

const trackingSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const paymentStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  pending_verification: { label: 'Pending Payment Verification', color: 'bg-blue-100 text-blue-700', icon: Clock },
  paid: { label: 'Payment Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Payment Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  failed: { label: 'Payment Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700', icon: Receipt },
};

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  async function fetchOrder() {
    const { data: ord } = await supabase.from('orders').select('*').eq('order_number', orderNumber).single();
    if (ord) {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', ord.id);
      setOrder({ ...ord, order_items: items || [] });
      if (ord.utr_number) setUtrNumber(ord.utr_number);
    }
    setLoading(false);
  }

  const isUpiOrder = order && ['upi', 'phonepe', 'googlepay', 'paytm'].includes(order.payment_method);
  const needsPaymentSubmission = isUpiOrder && order && order.payment_status === 'pending_verification' && !order.utr_number;
  const paymentRejected = isUpiOrder && order && order.payment_status === 'rejected';

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied to clipboard');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max 5MB.');
        return;
      }
      setScreenshotFile(file);
    }
  };

  const submitPayment = async () => {
    if (!order) return;
    if (!utrNumber.trim()) {
      toast.error('Please enter your UTR number');
      return;
    }
    if (!screenshotFile) {
      toast.error('Please upload a payment screenshot');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${order.order_number}-${Date.now()}.${screenshotFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, screenshotFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(fileName);
      const screenshotUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          utr_number: utrNumber.trim(),
          payment_screenshot_url: screenshotUrl,
          payment_status: 'pending_verification',
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      toast.success('Payment details submitted. Store will verify shortly.');
      fetchOrder();
    } catch (err) {
      toast.error('Failed to submit payment details. Please try again.');
    }
    setUploading(false);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8"><div className="h-64 rounded-xl shimmer" /></div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link href="/orders"><Button className="mt-4">Back to Orders</Button></Link>
      </div>
    );
  }

  const currentStepIndex = trackingSteps.findIndex((s) => s.key === order.status);
  const payConfig = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
  const PayIcon = payConfig.icon;
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/orders" className="hover:text-primary">Orders</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">#{order.order_number}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Tracking */}
          <div className="border rounded-xl p-6 bg-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary capitalize">{order.status.replace(/_/g, ' ')}</Badge>
            </div>

            <div className="relative">
              <div className="flex justify-between mb-2">
                {trackingSteps.map((step, i) => {
                  const StepIcon = step.icon;
                  const isCompleted = i <= currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isCompleted ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-muted'
                      }`}>
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs text-center ${isCompleted ? 'font-medium' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
                <div className="h-full bg-primary transition-all" style={{ width: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` }} />
              </div>
            </div>

            {order.is_express && (
              <div className="mt-4 flex items-center gap-2 bg-accent/10 text-accent rounded-lg p-3 text-sm">
                <Truck className="h-4 w-4" /> Express Delivery · {order.delivery_slot}
              </div>
            )}
          </div>

          {/* UPI Payment Section */}
          {isUpiOrder && (
            <div className="border-2 border-primary/30 rounded-xl p-6 bg-primary/5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">UPI Payment</h2>
                <Badge className={payConfig.color}>
                  <PayIcon className="h-3 w-3 mr-1" /> {payConfig.label}
                </Badge>
              </div>

              {/* Payment Verified */}
              {order.payment_status === 'paid' && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-800">Payment Verified</div>
                    <div className="text-sm text-green-600">Your payment has been confirmed by the store.</div>
                    {order.upi_verified_at && (
                      <div className="text-xs text-green-600 mt-1">
                        Verified on {new Date(order.upi_verified_at).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Rejected */}
              {paymentRejected && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-red-800">Payment Rejected</div>
                    <div className="text-sm text-red-600">
                      {order.upi_rejected_reason || 'Your payment could not be verified. Please contact the store.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Verification - Already Submitted */}
              {order.payment_status === 'pending_verification' && order.utr_number && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Clock className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-800">Payment Submitted for Verification</div>
                    <div className="text-sm text-blue-600">UTR: {order.utr_number}</div>
                    <div className="text-sm text-blue-600">The store will verify your payment shortly.</div>
                  </div>
                </div>
              )}

              {/* UPI Details + Submission Form */}
              {(needsPaymentSubmission || paymentRejected) && (
                <>
                  {/* Dynamic QR Code */}
                  <UpiDynamicQr
                    orderId={order.id}
                    orderNumber={order.order_number}
                    amount={order.total_amount}
                    qrCreatedAt={order.qr_created_at ?? order.created_at}
                    onRefresh={fetchOrder}
                  />

                  {/* UPI ID copy row */}
                  <div className="flex items-center gap-2 bg-background border rounded-lg p-3">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">UPI ID</div>
                      <div className="font-mono font-bold text-primary">{UPI_ID}</div>
                    </div>
                    <Button variant="outline" size="icon" onClick={copyUpiId}><Copy className="h-4 w-4" /></Button>
                  </div>

                  {/* Submission Form */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" /> Submit Payment Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      After making the payment, enter your UTR/Reference number and upload the payment screenshot.
                    </p>

                    <div>
                      <Label htmlFor="utr">UTR / Reference Number</Label>
                      <Input
                        id="utr"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 123456789012"
                      />
                    </div>

                    <div>
                      <Label htmlFor="screenshot">Payment Screenshot</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="screenshot"
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {screenshotFile ? screenshotFile.name : 'Choose Screenshot'}
                      </Button>
                      {screenshotFile && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {screenshotFile.name} ({(screenshotFile.size / 1024).toFixed(0)} KB)
                        </p>
                      )}
                    </div>

                    <Button onClick={submitPayment} className="w-full" disabled={uploading}>
                      {uploading ? 'Submitting...' : 'Submit Payment Details'}
                    </Button>
                  </div>
                </>
              )}

              {/* Show submitted screenshot */}
              {order.payment_screenshot_url && order.payment_status !== 'paid' && (
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Submitted Screenshot</Label>
                  <img
                    src={order.payment_screenshot_url}
                    alt="Payment Screenshot"
                    className="max-h-48 rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="border rounded-xl p-6 bg-card">
            <h2 className="font-semibold mb-4">Items in this order</h2>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} className="h-16 w-16 rounded-lg object-cover border" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{item.product_name}</div>
                    {item.brand && <div className="text-sm text-muted-foreground">{item.brand}</div>}
                    <div className="text-sm text-muted-foreground">Qty: {item.quantity} · ₹{item.price}</div>
                  </div>
                  <div className="font-bold">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-xl p-4 bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Delivery Address</h3>
            {order.address_snapshot && (
              <div className="text-sm space-y-1">
                <div className="font-medium">{order.address_snapshot.full_name}</div>
                <div className="text-muted-foreground">{order.address_snapshot.phone}</div>
                <div className="text-muted-foreground">{order.address_snapshot.address_line1}, {order.address_snapshot.address_line2}</div>
                <div className="text-muted-foreground">{order.address_snapshot.city}, {order.address_snapshot.state} - {order.address_snapshot.pincode}</div>
              </div>
            )}
          </div>

          <div className="border rounded-xl p-4 bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium uppercase">{order.payment_method}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge className={payConfig.color}>{payConfig.label}</Badge>
              </div>
              {order.utr_number && (
                <div className="flex justify-between"><span className="text-muted-foreground">UTR Number</span><span className="font-mono text-xs">{order.utr_number}</span></div>
              )}
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{order.subtotal}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>₹{order.delivery_charge}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>₹{order.total_amount}</span></div>
              </div>
            </div>
          </div>

          {order.delivery_otp && order.status !== 'delivered' && (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 bg-primary/5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Delivery OTP</p>
              <p className="text-3xl font-bold tracking-widest text-primary">{order.delivery_otp}</p>
              <p className="text-xs text-muted-foreground mt-1">Share with delivery partner</p>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => window.print()}>
            <Receipt className="h-4 w-4 mr-2" /> Download Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
