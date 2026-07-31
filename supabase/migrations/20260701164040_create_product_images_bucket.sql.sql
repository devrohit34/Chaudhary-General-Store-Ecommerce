-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Allow anon to upload product images (for admin panel)
CREATE POLICY "admin_upload_product_images" ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow anon to update product images
CREATE POLICY "admin_update_product_images" ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Allow anon to delete product images
CREATE POLICY "admin_delete_product_images" ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'product-images');