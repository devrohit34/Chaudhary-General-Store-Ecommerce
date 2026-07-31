-- Admin accounts table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- No public access to admins table
CREATE POLICY "admins_no_public_select" ON admins FOR SELECT TO anon USING (false);
CREATE POLICY "admins_no_public_insert" ON admins FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "admins_no_public_update" ON admins FOR UPDATE TO anon USING (false);
CREATE POLICY "admins_no_public_delete" ON admins FOR DELETE TO anon USING (false);

-- Insert default admin account
INSERT INTO admins (email, password_hash, name, role)
VALUES (
  'kundan@chaudharygeneralstore.com',
  '$2b$12$HCH9iswaRydgB4eI3uOrfePlhUHDX8waAFPi.blO9D43oE7oCkcA.',
  'Kundan Kumar Chaudhary',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Add permissive SELECT policies for admin panel data access
-- These allow reading all data through the anon key
-- (admin panel is protected by our JWT middleware at the app level)
-- ============================================================

-- Orders: allow anon to read all (admin panel needs to see all orders)
CREATE POLICY "admin_panel_select_orders" ON orders
  FOR SELECT TO anon USING (true);

-- Order items: allow anon to read all
CREATE POLICY "admin_panel_select_order_items" ON order_items
  FOR SELECT TO anon USING (true);

-- Allow anon to update orders (for admin status updates)
CREATE POLICY "admin_panel_update_orders" ON orders
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anon to update order_items
CREATE POLICY "admin_panel_update_order_items" ON order_items
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- User profiles: allow anon to read (admin customer management)
CREATE POLICY "admin_panel_select_user_profiles" ON user_profiles
  FOR SELECT TO anon USING (true);

-- Allow anon to update user_profiles (for block/unblock)
CREATE POLICY "admin_panel_update_user_profiles" ON user_profiles
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Reviews: update and delete for admin
CREATE POLICY "admin_panel_update_reviews" ON reviews
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "admin_panel_delete_reviews" ON reviews
  FOR DELETE TO anon USING (true);

-- Products: allow anon insert/update/delete (admin product management)
CREATE POLICY "admin_panel_insert_products" ON products
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "admin_panel_update_products" ON products
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "admin_panel_delete_products" ON products
  FOR DELETE TO anon USING (true);

-- Allow anon to read ALL products including inactive (for admin)
CREATE POLICY "admin_panel_select_all_products" ON products
  FOR SELECT TO anon USING (true);

-- Categories: allow anon full CRUD
CREATE POLICY "admin_panel_insert_categories" ON categories
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "admin_panel_update_categories" ON categories
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "admin_panel_delete_categories" ON categories
  FOR DELETE TO anon USING (true);

CREATE POLICY "admin_panel_select_all_categories" ON categories
  FOR SELECT TO anon USING (true);

-- Coupons: allow anon full CRUD
CREATE POLICY "admin_panel_insert_coupons" ON coupons
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "admin_panel_update_coupons" ON coupons
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "admin_panel_delete_coupons" ON coupons
  FOR DELETE TO anon USING (true);

CREATE POLICY "admin_panel_select_all_coupons" ON coupons
  FOR SELECT TO anon USING (true);

-- Banners: allow anon full CRUD
CREATE POLICY "admin_panel_insert_banners" ON banners
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "admin_panel_update_banners" ON banners
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "admin_panel_delete_banners" ON banners
  FOR DELETE TO anon USING (true);

CREATE POLICY "admin_panel_select_all_banners" ON banners
  FOR SELECT TO anon USING (true);
