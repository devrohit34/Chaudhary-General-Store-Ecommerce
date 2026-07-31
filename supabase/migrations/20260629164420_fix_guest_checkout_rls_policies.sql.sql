-- Fix RLS policies for guest checkout (orders without user_id)
-- Allow anon to insert orders (for guest checkout)
CREATE POLICY "guest_insert_orders" ON orders FOR INSERT
  TO anon WITH CHECK (user_id IS NULL);

-- Allow anon to select orders without user_id (guest orders by order_number)
CREATE POLICY "guest_select_orders" ON orders FOR SELECT
  TO anon USING (user_id IS NULL);

-- Allow anon to update orders without user_id (for payment submission)
CREATE POLICY "guest_update_orders" ON orders FOR UPDATE
  TO anon USING (user_id IS NULL) WITH CHECK (user_id IS NULL);

-- Allow anon to insert order_items for orders without user_id
CREATE POLICY "guest_insert_order_items" ON order_items FOR INSERT
  TO anon WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id IS NULL));

-- Allow anon to select order_items for orders without user_id
CREATE POLICY "guest_select_order_items" ON order_items FOR SELECT
  TO anon USING (order_id IN (SELECT id FROM orders WHERE user_id IS NULL));

-- Allow anon to update order_items for orders without user_id
CREATE POLICY "guest_update_order_items" ON order_items FOR UPDATE
  TO anon USING (order_id IN (SELECT id FROM orders WHERE user_id IS NULL)) WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id IS NULL));