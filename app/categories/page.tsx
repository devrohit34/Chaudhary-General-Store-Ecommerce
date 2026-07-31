'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Category } from '@/lib/supabase';
import { ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Categories</span>
      </div>
      <h1 className="text-3xl font-bold mb-2">All Categories</h1>
      <p className="text-muted-foreground mb-8">Browse our wide range of grocery categories</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}>
              <div className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-6xl">
                  {cat.icon || '🛒'}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{cat.name}</h3>
                  {cat.name_hi && <p className="text-sm text-muted-foreground">{cat.name_hi}</p>}
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
