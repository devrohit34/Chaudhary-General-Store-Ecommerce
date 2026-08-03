import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import localSeedDataJson from '../data/local-seed.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type LocalSeedData = {
  products: unknown[];
  categories: unknown[];
};

type FilterOperator = 'eq' | 'neq' | 'lt' | 'gt' | 'in' | 'ilike';

type QueryState = {
  tableName: string | null;
  filters: Array<{ column: string; operator: FilterOperator; value: unknown }>;
  orQuery: string | null;
  orderBy: { column: string; ascending: boolean } | null;
  limitValue: number | null;
};

const localSeedData: LocalSeedData = {
  products: Array.isArray((localSeedDataJson as Partial<LocalSeedData>)?.products)
    ? (localSeedDataJson as Partial<LocalSeedData>).products ?? []
    : [],
  categories: Array.isArray((localSeedDataJson as Partial<LocalSeedData>)?.categories)
    ? (localSeedDataJson as Partial<LocalSeedData>).categories ?? []
    : [],
};

const FALLBACK_STORAGE_KEYS: Record<string, string> = {
  products: 'kirana-fallback-products',
  categories: 'kirana-fallback-categories',
  orders: 'kirana-fallback-orders',
  order_items: 'kirana-fallback-order-items',
  user_profiles: 'kirana-fallback-user-profiles',
  reviews: 'kirana-fallback-reviews',
  coupons: 'kirana-fallback-coupons',
};

function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return fallback;
  }
}

function writeStorageValue<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

function mergeRecords(rows: unknown[]): Array<Record<string, unknown>> {
  const merged = new Map<string, Record<string, unknown>>();

  rows.forEach((row) => {
    if (!row || typeof row !== 'object') {
      return;
    }

    const record = row as Record<string, unknown>;
    const id = String(record.id ?? record.slug ?? record.order_number ?? record.email ?? record.name ?? `fallback-${Math.random()}`);
    merged.set(id, record);
  });

  return Array.from(merged.values());
}

function getFallbackRows(tableName: string | null): Array<Record<string, unknown>> {
  if (!tableName) {
    return [];
  }

  const seedRows = tableName === 'products'
    ? (localSeedData.products as Array<Record<string, unknown>>)
    : tableName === 'categories'
      ? (localSeedData.categories as Array<Record<string, unknown>>)
      : [];

  const storageKey = FALLBACK_STORAGE_KEYS[tableName] || `kirana-fallback-${tableName}`;
  const persistedRows = readStorageValue<Array<Record<string, unknown>>>(storageKey, []);
  return mergeRecords([...seedRows, ...persistedRows]);
}

function writeFallbackRows(tableName: string | null, rows: Array<Record<string, unknown>>) {
  if (!tableName) {
    return;
  }

  const storageKey = FALLBACK_STORAGE_KEYS[tableName] || `kirana-fallback-${tableName}`;
  writeStorageValue(storageKey, rows);
}

function matchesFilter(record: Record<string, unknown>, filter: { column: string; operator: FilterOperator; value: unknown }) {
  const recordValue = record[filter.column];

  switch (filter.operator) {
    case 'eq':
      return recordValue === filter.value;
    case 'neq':
      return recordValue !== filter.value;
    case 'lt':
      return Number(recordValue ?? 0) < Number(filter.value ?? 0);
    case 'gt':
      return Number(recordValue ?? 0) > Number(filter.value ?? 0);
    case 'in':
      return Array.isArray(filter.value) ? filter.value.includes(recordValue as never) : false;
    case 'ilike':
      return String(recordValue ?? '').toLowerCase().includes(String(filter.value ?? '').toLowerCase());
    default:
      return true;
  }
}

function matchesOrQuery(record: Record<string, unknown>, query: string | null) {
  if (!query) {
    return true;
  }

  const clauses = query.split(',').map((segment) => segment.trim()).filter(Boolean);
  return clauses.some((segment) => {
    const parts = segment.split('.');
    if (parts.length < 3) {
      return false;
    }
    const [, operator, rawValue] = parts;
    if (operator !== 'ilike') {
      return false;
    }
    const field = parts[0];
    const value = rawValue.replace(/^%|%$/g, '');
    return String(record[field] ?? '').toLowerCase().includes(value.toLowerCase());
  });
}

function executeQuery(tableName: string | null, state: QueryState) {
  const rows = getFallbackRows(tableName);
  let filtered = rows.filter((record) => {
    const passesFilters = state.filters.every((filter) => matchesFilter(record, filter));
    const passesOr = matchesOrQuery(record, state.orQuery);
    return passesFilters && passesOr;
  });

  if (state.orderBy) {
    filtered = [...filtered].sort((a, b) => {
      const aValue = a[state.orderBy!.column];
      const bValue = b[state.orderBy!.column];
      const left = Number(aValue ?? 0);
      const right = Number(bValue ?? 0);
      if (!Number.isNaN(left) && !Number.isNaN(right)) {
        return state.orderBy!.ascending ? left - right : right - left;
      }
      const leftText = String(aValue ?? '');
      const rightText = String(bValue ?? '');
      return state.orderBy!.ascending ? leftText.localeCompare(rightText) : rightText.localeCompare(leftText);
    });
  }

  if (state.limitValue) {
    filtered = filtered.slice(0, state.limitValue);
  }

  return { data: filtered, count: filtered.length, error: null };
}

function createFallbackClient(): SupabaseClient {
  const createBuilder = (tableName: string | null = null) => {
    const state: QueryState = {
      tableName,
      filters: [],
      orQuery: null,
      orderBy: null,
      limitValue: null,
    };

    const builder = {
      select: () => builder,
      eq: (column: string, value: unknown) => {
        state.filters.push({ column, operator: 'eq', value });
        return builder;
      },
      order: (column: string, options?: { ascending?: boolean }) => {
        state.orderBy = { column, ascending: options?.ascending !== false };
        return builder;
      },
      in: (column: string, values: unknown[]) => {
        state.filters.push({ column, operator: 'in', value: values });
        return builder;
      },
      neq: (column: string, value: unknown) => {
        state.filters.push({ column, operator: 'neq', value });
        return builder;
      },
      lt: (column: string, value: unknown) => {
        state.filters.push({ column, operator: 'lt', value });
        return builder;
      },
      gt: (column: string, value: unknown) => {
        state.filters.push({ column, operator: 'gt', value });
        return builder;
      },
      limit: async (value: number) => {
        state.limitValue = value;
        return executeQuery(tableName, state);
      },
      single: async () => {
        state.limitValue = 1;
        const result = executeQuery(tableName, state);
        return { data: result.data[0] ?? null, error: null, count: result.count };
      },
      maybeSingle: async () => {
        state.limitValue = 1;
        const result = executeQuery(tableName, state);
        return { data: result.data[0] ?? null, error: null, count: result.count };
      },
      or: (query: string) => {
        state.orQuery = query;
        return builder;
      },
      insert: async (payload: unknown) => {
        const rows = getFallbackRows(tableName);
        if (Array.isArray(payload)) {
          const created = payload.map((item, index) => {
            const record = item as Record<string, unknown>;
            return {
              ...record,
              id: String(record.id ?? `${tableName}-${Date.now()}-${index}`),
            } as Record<string, unknown>;
          });
          writeFallbackRows(tableName, [...rows, ...created]);
          return {
            data: created,
            error: null,
            select: () => ({
              single: async () => ({ data: created[0] ?? null, error: null }),
              maybeSingle: async () => ({ data: created[0] ?? null, error: null }),
            }),
            single: async () => ({ data: created[0] ?? null, error: null }),
            maybeSingle: async () => ({ data: created[0] ?? null, error: null }),
          };
        }

        const record = payload as Record<string, unknown>;
        const created = {
          ...record,
          id: String(record.id ?? `${tableName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        } as Record<string, unknown>;
        writeFallbackRows(tableName, [...rows, created]);
        return {
          data: created,
          error: null,
          select: () => ({
            single: async () => ({ data: created, error: null }),
            maybeSingle: async () => ({ data: created, error: null }),
          }),
          single: async () => ({ data: created, error: null }),
          maybeSingle: async () => ({ data: created, error: null }),
        };
      },
      upsert: async (payload: unknown) => {
        const rows = getFallbackRows(tableName);
        const record = payload as Record<string, unknown>;
        const existingIndex = rows.findIndex((row) => {
          const rowId = row.id ?? row.slug ?? row.order_number ?? row.email;
          return rowId && rowId === record.id;
        });
        const nextRecord = {
          ...record,
          id: String(record.id ?? `${tableName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        } as Record<string, unknown>;
        if (existingIndex >= 0) {
          rows[existingIndex] = nextRecord;
        } else {
          rows.push(nextRecord);
        }
        writeFallbackRows(tableName, rows);
        return { data: nextRecord, error: null };
      },
      update: (payload: Record<string, unknown>) => ({
        eq: async (column: string, value: unknown) => {
          const rows = getFallbackRows(tableName);
          const nextRows = rows.map((row) => {
            if (row[column] === value) {
              return { ...row, ...payload };
            }
            return row;
          });
          writeFallbackRows(tableName, nextRows);
          const updated = nextRows.find((row) => row[column] === value) ?? null;
          return {
            select: () => ({
              single: async () => ({ data: updated, error: null }),
              maybeSingle: async () => ({ data: updated, error: null }),
            }),
            single: async () => ({ data: updated, error: null }),
            maybeSingle: async () => ({ data: updated, error: null }),
          };
        },
        select: () => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
      delete: () => ({
        eq: async (column: string, value: unknown) => {
          const rows = getFallbackRows(tableName);
          const nextRows = rows.filter((row) => row[column] !== value);
          writeFallbackRows(tableName, nextRows);
          return { data: nextRows, error: null };
        },
      }),
      then: (resolve: (value: { data: unknown; error: null; count: number | null }) => unknown) =>
        Promise.resolve(executeQuery(tableName, state)).then((result) => resolve(result as { data: unknown; error: null; count: number | null })),
    };

    return builder as unknown as SupabaseClient;
  };

  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (prop === 'from') {
        return (tableName?: string) => createBuilder(tableName ?? null);
      }
      if (prop === 'auth') {
        return {
          getSession: async () => {
            const session = readStorageValue<{ user: { id: string; email?: string | null } | null } | null>('kirana-fallback-auth-session', null);
            return { data: { session }, error: null };
          },
          signUp: async (credentials: { email?: string; password?: string }) => {
            const session = {
              user: {
                id: `user-${Date.now()}`,
                email: credentials?.email ?? null,
              },
            };
            writeStorageValue('kirana-fallback-auth-session', session);
            return { data: { user: session.user, session }, error: null };
          },
          signInWithPassword: async (credentials: { email?: string; password?: string }) => {
            const session = {
              user: {
                id: `user-${Date.now()}`,
                email: credentials?.email ?? null,
              },
            };
            writeStorageValue('kirana-fallback-auth-session', session);
            return { data: { user: session.user, session }, error: null };
          },
          signOut: async () => {
            writeStorageValue('kirana-fallback-auth-session', null);
            return { error: null };
          },
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => undefined } },
            error: null,
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
