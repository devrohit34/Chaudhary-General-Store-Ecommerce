import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, reason } = body;

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action. Use approve or reject.' }, { status: 400 });
  }

  let updateData: Record<string, unknown>;

  if (action === 'approve') {
    updateData = {
      payment_status: 'paid',
      upi_verified_at: new Date().toISOString(),
      upi_rejected_reason: null,
      status: 'confirmed',
    };
  } else {
    updateData = {
      payment_status: 'rejected',
      upi_rejected_reason: reason || 'Payment could not be verified',
    };
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

  return NextResponse.json({
    order: data,
    message: action === 'approve' ? 'Payment approved successfully' : 'Payment rejected'
  });
}
