'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, MapPin, CreditCard, Zap, Check, ChevronRight, Copy, Upload, QrCode } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const UPI_ID = '8051806325@axl';
const STORE_NAME = 'Chaudhary General Store';

const deliverySlots = [
  'Express - 30 mins (₹20 extra)',
  'Today 6-8 PM',
  'Today 8-10 PM',
  'Tomorrow 6-8 AM',
  'Tomorrow 8-10 AM',
  'Tomorrow 10-12 PM',
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '',
  });
  const [deliverySlot, setDeliverySlot] = useState(deliverySlots[0]);
  const [isExpress, setIsExpress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);

  const deliveryCharge = subtotal >= 999 ? 0 : 69;
  const expressCharge = isExpress ? 20 : 0;
  const total = subtotal + deliveryCharge + expressCharge;

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied to clipboard');
  };

  const placeOrder = async () => {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const orderNumber = `CKS${Date.now().toString().slice(-8)}`;
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      const isUpi = ['upi', 'phonepe', 'googlepay', 'paytm'].includes(paymentMethod);
      const now = new Date().toISOString();

      const orderPayload = {
        order_number: orderNumber,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: isUpi ? 'pending_verification' : 'pending',
        qr_created_at: isUpi ? now : null,
        subtotal,
        delivery_charge: deliveryCharge + expressCharge,
        gst_amount: 0,
        total_amount: total,
        address_snapshot: address,
        delivery_slot: deliverySlot,
        delivery_otp: otp,
        is_express: isExpress,
        created_at: now,
        updated_at: now,
      };

      const orderInsertResult = await supabase.from('orders').insert(orderPayload);
      const order = orderInsertResult?.data && !Array.isArray(orderInsertResult.data)
        ? orderInsertResult.data
        : Array.isArray(orderInsertResult?.data) && orderInsertResult.data.length > 0
          ? orderInsertResult.data[0]
          : null;

      if (!order?.id) {
        throw new Error('Order creation did not return a valid order id.');
      }

      const orderItemsPayload = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.image_url,
        brand: item.product.brand,
        unit: item.product.unit,
        price: item.product.price,
        quantity: item.quantity,
        gst_percent: item.product.gst_percent,
        created_at: now,
      }));

      await supabase.from('order_items').insert(orderItemsPayload);

      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/orders/${orderNumber}`);
    } catch (err) {
      console.error('Place order failed', err);
      toast.error('Failed to place order. Please try again.');
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Link href="/products"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/cart" className="hover:text-primary">Cart</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Checkout</span>
      </div>

      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="flex items-center gap-2 mb-8">
        {['Address', 'Delivery', 'Payment'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step > i + 1 ? 'bg-primary text-primary-foreground' : step === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="full_name">Full Name</Label><Input id="full_name" value={address.full_name} onChange={(e) => setAddress({ ...address, full_name: e.target.value })} placeholder="John Doe" /></div>
                  <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="9876543210" /></div>
                </div>
                <div><Label htmlFor="address_line1">Address Line 1</Label><Input id="address_line1" value={address.address_line1} onChange={(e) => setAddress({ ...address, address_line1: e.target.value })} placeholder="House no, Building" /></div>
                <div><Label htmlFor="address_line2">Address Line 2</Label><Input id="address_line2" value={address.address_line2} onChange={(e) => setAddress({ ...address, address_line2: e.target.value })} placeholder="Area, Landmark" /></div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div><Label htmlFor="city">City</Label><Input id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" /></div>
                  <div><Label htmlFor="state">State</Label><Input id="state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="State" /></div>
                  <div><Label htmlFor="pincode">Pincode</Label><Input id="pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} placeholder="123456" /></div>
                </div>
                <Button onClick={() => setStep(2)} className="w-full" disabled={!address.full_name || !address.phone || !address.address_line1 || !address.city || !address.pincode}>
                  Continue to Delivery
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Delivery Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-accent" />
                    <div>
                      <div className="font-medium">Express Delivery</div>
                      <div className="text-sm text-muted-foreground">Get it in 30 minutes</div>
                    </div>
                  </div>
                  <Checkbox checked={isExpress} onCheckedChange={(v) => setIsExpress(!!v)} />
                </div>
                <div>
                  <Label className="mb-2 block">Select Delivery Slot</Label>
                  <RadioGroup value={deliverySlot} onValueChange={setDeliverySlot}>
                    {deliverySlots.map((slot) => (
                      <div key={slot} className="flex items-center gap-2 border rounded-lg p-3">
                        <RadioGroupItem value={slot} id={slot} />
                        <Label htmlFor={slot} className="font-normal cursor-pointer flex-1">{slot}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-1">Continue to Payment</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {[
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
                    { id: 'upi', label: 'UPI Payment', desc: 'Direct UPI transfer to store', icon: '📱' },
                    { id: 'phonepe', label: 'PhonePe', desc: 'Pay via PhonePe UPI', icon: '🟣' },
                    { id: 'googlepay', label: 'Google Pay', desc: 'Pay via GPay UPI', icon: '🟢' },
                    { id: 'paytm', label: 'Paytm', desc: 'Pay via Paytm UPI', icon: '🔵' },
                  ].map((m) => (
                    <div key={m.id} className="flex items-center gap-3 border rounded-lg p-4">
                      <RadioGroupItem value={m.id} id={m.id} />
                      <Label htmlFor={m.id} className="font-normal cursor-pointer flex-1 flex items-center gap-3">
                        <span className="text-2xl">{m.icon}</span>
                        <div>
                          <div className="font-medium">{m.label}</div>
                          <div className="text-sm text-muted-foreground">{m.desc}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* UPI Payment Details */}
                {['upi', 'phonepe', 'googlepay', 'paytm'].includes(paymentMethod) && (
                  <div className="border-2 border-primary/30 rounded-xl p-5 bg-primary/5 space-y-4 animate-fade-in">
                    <div className="text-center">
                      <h3 className="font-bold text-lg mb-1">Pay ₹{total.toFixed(0)} via UPI</h3>
                      <p className="text-sm text-muted-foreground">Transfer to {STORE_NAME}</p>
                    </div>

                    {/* Dynamic QR notice */}
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <QrCode className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800">Unique QR code generated for your order</p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          After placing the order, a unique QR code with the exact amount pre-filled will appear on your order page. A 10-minute payment timer will start automatically.
                        </p>
                      </div>
                    </div>

                    {/* UPI ID row */}
                    <div className="flex items-center gap-2 bg-background border rounded-lg p-3">
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">UPI ID</div>
                        <div className="font-mono font-bold text-primary">{UPI_ID}</div>
                      </div>
                      <Button variant="outline" size="icon" onClick={copyUpiId}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">Merchant</div>
                        <div className="font-medium text-sm">{STORE_NAME}</div>
                      </div>
                      <div className="bg-background border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">Amount</div>
                        <div className="font-bold text-sm text-primary">₹{total.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-center space-y-1">
                      <p>After payment, enter your UTR number and upload a screenshot on the order page.</p>
                      <p>Your order will be confirmed after the store verifies your payment.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={placeOrder} className="flex-1" disabled={placing}>
                    {placing ? 'Placing Order...' : `Place Order · ₹${total.toFixed(0)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-32">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  {item.product.image_url && (
                    <Image src={item.product.image_url} alt={item.product.name} width={48} height={48} className="h-12 w-12 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1 font-medium">{item.product.name}</div>
                    <div className="text-muted-foreground">Qty: {item.quantity} · ₹{item.product.price}</div>
                  </div>
                  <div className="font-medium">₹{item.product.price * item.quantity}</div>
                </div>
              ))}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
                {isExpress && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Express</span><span>₹{expressCharge}</span></div>}
                <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
