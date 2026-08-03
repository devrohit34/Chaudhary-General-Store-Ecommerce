'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="relative bg-card rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl">🛒</div>
          )}
          <button
            onClick={handleWishlist}
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur shadow-md hover:scale-110 transition-transform"
            aria-label="Toggle wishlist"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-destructive text-destructive' : ''}`} />
          </button>
        </div>

        <div className="p-3 space-y-1.5">
          {product.brand && (
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</div>
          )}
          <h3 className="font-medium text-sm line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 bg-primary/10 px-1.5 py-0.5 rounded text-xs font-medium text-primary">
              <Star className="h-3 w-3 fill-primary" />
              {product.rating || 'New'}
            </div>
            {product.weight && (
              <span className="text-xs text-muted-foreground">{product.weight}</span>
            )}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-base">₹{product.price}</span>
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            size="sm"
            className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground"
            variant="outline"
          >
            <ShoppingCart className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </Link>
  );
}
