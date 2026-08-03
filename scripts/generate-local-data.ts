import fs from 'fs';
import path from 'path';
import { PRODUCTS } from './seed-products';

function slugify(text = '') {
  return text
    .toString()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function inferCategoryFromName(name: string) {
  const n = name.toLowerCase();
  if (n.includes('dal') || n.includes('daal') || n.includes('puls')) return 'Pulses & Dal';
  if (n.includes('chawal') || n.includes('rice')) return 'Rice';
  if (n.includes('oil') || n.includes('tel') || n.includes('mustard') || n.includes('refine')) return 'Oils';
  if (n.includes('soap') || n.includes('sabun') || n.includes('ponds') || n.includes('dettol') || n.includes('dove')) return 'Personal Care';
  if (n.includes('biscuit') || n.includes('cookie') || n.includes('cake') || n.includes('cream')) return 'Bakery & Sweets';
  if (n.includes('maggi') || n.includes('noodle') || n.includes('maggie')) return 'Instant Foods';
  if (n.includes('kurkure') || n.includes('chips') || n.includes('namkeen') || n.includes('mixture')) return 'Snacks';
  if (n.includes('tea') || n.includes('chaipatti') || n.includes('tea')) return 'Tea & Beverages';
  if (n.includes('detergent') || n.includes('surf') || n.includes('ghadi') || n.includes('wheel')) return 'Household';
  if (n.includes('battery') || n.includes('pen') || n.includes('broom') || n.includes('jhadu')) return 'Stationery';
  if (n.includes('gutka') || n.includes('tobacco') || n.includes('cigarette') || n.includes('gutka')) return 'Tobacco Products';
  if (n.includes('soap') || n.includes('cream') || n.includes('powder')) return 'Personal Care';
  return 'Other';
}

const seedPath = path.join(__dirname, '..', 'data', 'local-seed.json');
const raw = fs.readFileSync(seedPath, 'utf8');
const seed = JSON.parse(raw);

const categoryMap: Record<string, string> = {};
for (const c of seed.categories) {
  categoryMap[c.name] = c.id;
}

const productsOut: any[] = PRODUCTS.map((p, idx) => {
  const slug = slugify(p.name);
  const catName = p.category || inferCategoryFromName(p.name);
  const category_id = categoryMap[catName] || categoryMap['Other'] || null;
  const now = new Date().toISOString();
  return {
    id: `p_${idx + 1}`,
    category_id,
    name: p.name,
    slug,
    description: null,
    brand: 'Chaudhary General Store',
    sku: null,
    price: Number(p.price).toFixed(2),
    original_price: p.mrp ? Number(p.mrp).toFixed(2) : null,
    discount_percent: 0,
    unit: p.unit || 'piece',
    weight: p.unit || null,
    stock_quantity: 100,
    min_stock_alert: 10,
    image_url: p.image || null,
    images: p.image ? [p.image] : [],
    tags: [],
    is_active: true,
    is_featured: false,
    is_flash_sale: false,
    flash_sale_price: null,
    flash_sale_ends_at: null,
    rating: 0,
    review_count: 0,
    gst_percent: 5,
    hsn_code: null,
    created_at: now,
    updated_at: now
  };
});

seed.products = productsOut;
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf8');
console.log(`Wrote ${productsOut.length} products to ${seedPath}`);
