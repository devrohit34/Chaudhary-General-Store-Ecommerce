
-- Add UPI payment fields to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS utr_number TEXT,
  ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
  ADD COLUMN IF NOT EXISTS upi_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS upi_rejected_reason TEXT;

-- Extend payment_status to include UPI-specific states
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending','pending_verification','paid','failed','refunded','rejected'));

-- Storage bucket for payment screenshots (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots',
  true,
  5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow authenticated upload screenshots"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Allow public read screenshots"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Allow owner delete screenshots"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-screenshots');
