-- Add QR session fields for dynamic UPI QR code expiry
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS qr_created_at TIMESTAMPTZ;

-- Set qr_created_at to created_at for existing UPI orders so they get a timer baseline
UPDATE orders
SET qr_created_at = created_at
WHERE payment_method IN ('upi', 'phonepe', 'googlepay', 'paytm')
  AND qr_created_at IS NULL;
