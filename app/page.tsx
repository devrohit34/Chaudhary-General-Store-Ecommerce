'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Category, Product } from '@/lib/supabase';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Truck, Clock, ShieldCheck, ChevronRight, Package } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order').limit(15),
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(20),
      ]);
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section with store photo */}
      <section className="relative h-[300px] sm:h-[420px] overflow-hidden">
        <Image
          src="/images/shop-photos/My_Dukaan_Pics.jpeg"
          alt="Chaudhary General Store"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="max-w-lg text-primary-foreground space-y-4">
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
                Chaudhary General Store
              </h1>
              <p className="text-lg sm:text-xl opacity-90">चौधरी जेनरल स्टोर</p>
              <p className="text-base opacity-80">
                Your trusted neighborhood kirana store for fresh groceries and daily essentials.
              </p>
              <div className="flex gap-3 pt-2">
                <Link href="/products">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Browse Products <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button size="lg" variant="outline" className="bg-background/20 border-background/30 text-primary-foreground hover:bg-background/30">
                    Categories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info badges */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Truck, title: 'Home Delivery', desc: 'Within 10 km radius' },
              { icon: Clock, title: 'Convenient Hours', desc: 'Open daily for you' },
              { icon: ShieldCheck, title: 'Quality Products', desc: 'Fresh & authentic' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link href="/categories" className="text-sm text-primary hover:underline flex items-center">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}>
                <div className="group text-center">
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border flex items-center justify-center text-4xl mb-2 group-hover:scale-105 group-hover:border-primary/30 transition-all">
                    {cat.icon || '🛒'}
                  </div>
                  <div className="text-xs font-medium line-clamp-2">{cat.name}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Our Products</h2>
              <p className="text-sm text-muted-foreground">Quality groceries and essentials</p>
            </div>
          </div>
          <Link href="/products">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Store Info Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="rounded-2xl overflow-hidden border">
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[250px]">
              <Image
                src="/images/shop-photos/Dukaaan_pics.jpeg"
                alt="Our Store"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 bg-card flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-3">About Our Store</h2>
              <p className="text-muted-foreground mb-4">
                Chaudhary General Store is your trusted neighborhood kirana store, serving the community
                with fresh groceries, daily essentials, and quality products. Owned by Kundan Kumar Chaudhary,
                we are committed to providing reliable service to our customers.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Home delivery within 10 km radius
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Quality assured products
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Convenient shopping experience
                </div>
              </div>
              <Link href="/about" className="mt-6 w-fit">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
