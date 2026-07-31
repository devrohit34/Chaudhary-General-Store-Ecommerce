import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  return NextResponse.json({
    order: { ...order, order_items: items || [] }
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, payment_status, upi_rejected_reason } = body;

  const updateData: Record<string, unknown> = {};

  if (status) {
    updateData.status = status;
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }
  }

  if (payment_status) {
    updateData.payment_status = payment_status;
    if (payment_status === 'paid') {
      updateData.upi_verified_at = new Date().toISOString();
      updateData.upi_rejected_reason = null;
      // Auto-confirm order when payment is verified
      if (!status) {
        updateData.status = 'confirmed';
      }
    }
    if (payment_status === 'rejected' && upi_rejected_reason) {
      updateData.upi_rejected_reason = upi_rejected_reason;
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
