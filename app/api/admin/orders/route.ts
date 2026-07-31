import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('payment_status');
  const search = searchParams.get('search');

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    if (paymentStatus === 'cod') {
      query = query.eq('payment_method', 'cod');
    } else {
      query = query.eq('payment_status', paymentStatus);
    }
  }

  if (search) {
    query = query.or(`order_number.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch order items for each order
  const ordersWithItems = await Promise.all(
    (data || []).map(async (order) => {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      return { ...order, order_items: items || [] };
    })
  );

  return NextResponse.json({ orders: ordersWithItems });
}
