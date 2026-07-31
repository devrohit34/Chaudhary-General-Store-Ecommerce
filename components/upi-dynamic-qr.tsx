'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Timer, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const UPI_ID = '8051806325@axl';
const MERCHANT_NAME = 'Chaudhary General Store';
const QR_DURATION_SECONDS = 600; // 10 minutes

interface UpiDynamicQrProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  qrCreatedAt: string | null;
  onRefresh: () => void;
  disabled?: boolean;
}

export function UpiDynamicQr({ orderId, orderNumber, amount, qrCreatedAt, onRefresh, disabled }: UpiDynamicQrProps) {
  const [secondsLeft, setSecondsLeft] = useState(QR_DURATION_SECONDS);
  const [expired, setExpired] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const upiUri = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount.toFixed(2)}&cu=INR&tn=Order-${orderNumber}`;

  const computeSecondsLeft = useCallback(() => {
    const baseline = qrCreatedAt;
    if (!baseline) return QR_DURATION_SECONDS;
    const created = new Date(baseline).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - created) / 1000);
    return Math.max(0, QR_DURATION_SECONDS - elapsed);
  }, [qrCreatedAt]);

  useEffect(() => {
    const initial = computeSecondsLeft();
    setSecondsLeft(initial);
    setExpired(initial === 0);

    if (initial === 0) return;

    const interval = setInterval(() => {
      const s = computeSecondsLeft();
      setSecondsLeft(s);
      if (s === 0) {
        setExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [computeSecondsLeft]);

  const regenerateQr = async () => {
    setRegenerating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ qr_created_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      toast.success('New QR code generated — you have 10 minutes to complete payment');
      onRefresh();
    } catch {
      toast.error('Failed to regenerate QR code');
    }
    setRegenerating(false);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft > 0 && secondsLeft <= 60;
  const progressPct = (secondsLeft / QR_DURATION_SECONDS) * 100;

  if (disabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Timer bar */}
      {!expired && (
        <div className="space-y-1.5">
          <div
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
              isUrgent ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
            }`}
          >
            <Timer className="h-4 w-4 flex-shrink-0" />
            QR expires in {minutes}:{secs.toString().padStart(2, '0')}
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isUrgent ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* QR Code */}
      <div className="flex justify-center">
        <div className={`relative bg-white p-4 rounded-2xl border-2 transition-all ${
          expired ? 'opacity-25 border-red-200 grayscale' : 'border-green-300 shadow-md'
        }`}>
          <QRCodeSVG
            value={upiUri}
            size={180}
            level="M"
            bgColor="#ffffff"
            fgColor="#111827"
          />
          {expired && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm gap-1">
              <ShieldAlert className="h-8 w-8 text-red-500" />
              <span className="text-red-600 font-bold text-sm text-center px-3 leading-tight">
                Session Expired
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Amount indicator */}
      {!expired && (
        <div className="rounded-lg border bg-green-50 border-green-200 px-4 py-2 text-center">
          <p className="text-xs text-green-700 font-medium">Amount pre-filled automatically</p>
          <p className="text-xl font-bold text-green-800">₹{amount.toFixed(2)}</p>
          <p className="text-xs text-green-600">Scan with any UPI app — do not change the amount</p>
        </div>
      )}

      {/* Expired state */}
      {expired && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center space-y-3">
          <div>
            <p className="text-sm font-semibold text-red-700">Payment Session Expired</p>
            <p className="text-xs text-red-500 mt-0.5">
              The 10-minute window has closed. Generate a new QR to continue.
            </p>
          </div>
          <Button
            onClick={regenerateQr}
            disabled={regenerating}
            variant="outline"
            className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Generating...' : 'Generate New QR'}
          </Button>
        </div>
      )}

      {/* Open UPI App */}
      {!expired && (
        <a href={upiUri} className="block">
          <Button className="w-full gap-2" size="lg">
            Open UPI App to Pay ₹{amount.toFixed(0)}
          </Button>
        </a>
      )}

      {/* Order reference */}
      <p className="text-center text-xs text-muted-foreground">
        Order Ref: <span className="font-mono font-medium text-foreground">{orderNumber}</span>
      </p>
    </div>
  );
}
