import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function createFallbackClient(): SupabaseClient {
  const createBuilder = (data: unknown = []) => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      order: () => builder,
      limit: async () => ({ data, error: null }),
      single: async () => ({ data, error: null }),
      or: () => builder,
      insert: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null }),
      update: () => ({
        eq: async () => ({ data, error: null }),
        select: () => ({ single: async () => ({ data, error: null }) }),
      }),
      delete: () => ({ eq: async () => ({ data, error: null }) }),
      then: (resolve: (value: { data: unknown; error: null }) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve),
    };

    return builder as unknown as SupabaseClient;
  };

  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (prop === 'from') {
        return () => createBuilder([]);
      }
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          signUp: async () => ({ data: { user: null, session: null }, error: null }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => undefined } },
          }),
        };
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        };
      }
      if (prop === 'rpc') {
        return async () => ({ data: null, error: null });
      }
      return () => undefined;
    },
  });
}

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : createFallbackClient();

export type Category = {
  id: string;
  name: string;
  name_hi: string | null;
  slug: string;
  icon: string | null;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  name_hi: string | null;
  slug: string;
  description: string | null;
  description_hi: string | null;
  brand: string | null;
  sku: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number;
  unit: string;
  weight: string | null;
  stock_quantity: number;
  min_stock_alert: number;
  image_url: string | null;
  images: string[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_price: number | null;
  flash_sale_ends_at: string | null;
  rating: number;
  review_count: number;
  gst_percent: number;
  hsn_code: string | null;
  created_at: string;
  updated_at: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  valid_until: string | null;
  is_active: boolean;
};

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
};

export type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  delivery_charge: number;
  gst_amount: number;
  total_amount: number;
  address_snapshot: any;
  delivery_slot: string | null;
  delivery_otp: string | null;
  is_express: boolean;
  utr_number: string | null;
  payment_screenshot_url: string | null;
  upi_verified_at: string | null;
  upi_rejected_reason: string | null;
  qr_created_at: string | null;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  brand: string | null;
  unit: string | null;
  price: number;
  quantity: number;
  gst_percent: number;
};

export type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  created_at: string;
};
