'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { supabase, Product } from '@/lib/supabase';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Heart, ChevronRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('products').select('*').in('id', wishlist);
      setProducts(data || []);
      setLoading(false);
    }
    fetchWishlist();
  }, [wishlist]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Wishlist</span>
      </div>

      <h1 className="text-3xl font-bold mb-6">My Wishlist ({products.length})</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl shimmer" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
          <Link href="/categories">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
