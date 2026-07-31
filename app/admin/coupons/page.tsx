'use client';

import { useEffect, useState } from 'react';
import { supabase, Coupon } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percent', discount_value: '', min_order_amount: '', max_discount: '' });

  useEffect(() => { fetchCoupons(); }, []);

  async function fetchCoupons() {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
  }

  const save = async () => {
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      min_order_amount: Number(form.min_order_amount) || 0,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      is_active: true,
    };
    const { error } = await supabase.from('coupons').insert(payload);
    if (error) toast.error('Failed to add coupon');
    else { toast.success('Coupon added'); setDialogOpen(false); fetchCoupons(); setForm({ code: '', description: '', discount_type: 'percent', discount_value: '', min_order_amount: '', max_discount: '' }); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) toast.error('Failed'); else { toast.success('Deleted'); fetchCoupons(); }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Coupon</Button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className="border-2 border-dashed border-primary/30 rounded-xl p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-primary text-primary-foreground">{c.code}</Badge>
              <Button variant="ghost" size="icon" onClick={() => remove(c.id)} className="text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <p className="text-sm font-medium mb-2">{c.description}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Type: {c.discount_type === 'percent' ? `${c.discount_value}% off` : `₹${c.discount_value} off`}</div>
              <div>Min order: ₹{c.min_order_amount}</div>
              {c.max_discount && <div>Max discount: ₹{c.max_discount}</div>}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Coupon</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Value</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min Order (₹)</Label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} /></div>
              <div><Label>Max Discount (₹)</Label><Input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} /></div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} className="flex-1">Add Coupon</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
