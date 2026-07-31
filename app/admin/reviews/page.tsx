'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trash2, CheckCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  created_at: string;
  user_id: string;
  product_id: string;
  products?: { name: string; image_url: string | null } | null;
  user_profiles?: { full_name: string | null } | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, products(name, image_url), user_profiles(full_name)')
      .order('created_at', { ascending: false });
    setReviews((data as any) || []);
    setLoading(false);
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) toast.error('Failed to delete review');
    else { toast.success('Review deleted'); fetchReviews(); }
  };

  const toggleVerified = async (review: Review) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_verified: !review.is_verified })
      .eq('id', review.id);
    if (error) toast.error('Failed to update');
    else { toast.success(review.is_verified ? 'Review unverified' : 'Review verified'); fetchReviews(); }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
      />
    ));

  const filtered = reviews.filter(
    (r) =>
      r.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user_profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.body?.toLowerCase().includes(search.toLowerCase())
  );

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">
          {reviews.length} reviews · Avg rating: {avgRating} ★
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter((r) => r.rating === star).length;
          return (
            <div key={star} className="bg-white rounded-xl border p-3 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-gray-900">{star}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-400">reviews</div>
            </div>
          );
        })}
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by product, customer, or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Star className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-start gap-4">
                {r.products?.image_url && (
                  <img
                    src={r.products.image_url}
                    alt={r.products.name}
                    className="h-12 w-12 rounded-lg object-cover border flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="font-semibold text-sm text-gray-900 line-clamp-1">
                        {r.products?.name || 'Unknown Product'}
                      </div>
                      <div className="text-xs text-gray-400">
                        by {r.user_profiles?.full_name || 'Anonymous'} ·{' '}
                        {new Date(r.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {r.is_verified && (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs gap-1">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-1.5">{renderStars(r.rating)}</div>
                  {r.title && <div className="text-sm font-medium text-gray-800 mb-0.5">{r.title}</div>}
                  {r.body && <p className="text-sm text-gray-600 line-clamp-2">{r.body}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleVerified(r)}
                  className={`gap-1 text-xs ${r.is_verified ? 'text-gray-600' : 'text-green-700 border-green-200 hover:bg-green-50'}`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {r.is_verified ? 'Unverify' : 'Verify'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteReview(r.id)}
                  className="gap-1 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
