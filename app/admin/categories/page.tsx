'use client';

import { useEffect, useState } from 'react';
import { supabase, Category } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', name_hi: '', slug: '', icon: '', image_url: '', description: '' });

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data || []);
  }

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', name_hi: '', slug: '', icon: '', image_url: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, name_hi: c.name_hi || '', slug: c.slug, icon: c.icon || '', image_url: c.image_url || '', description: c.description || '' });
    setDialogOpen(true);
  };

  const save = async () => {
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) toast.error('Failed'); else toast.success('Category updated');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) toast.error('Failed'); else toast.success('Category added');
    }
    setDialogOpen(false);
    fetchCategories();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('Failed'); else { toast.success('Deleted'); fetchCategories(); }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="border rounded-xl p-4 bg-card">
            <div className="text-4xl mb-2">{cat.icon || '🛒'}</div>
            <h3 className="font-semibold">{cat.name}</h3>
            {cat.name_hi && <p className="text-sm text-muted-foreground">{cat.name_hi}</p>}
            <div className="flex gap-1 mt-3">
              <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(cat.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Name (Hindi)</Label><Input value={form.name_hi} onChange={(e) => setForm({ ...form, name_hi: e.target.value })} /></div>
            <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🛒" /></div>
            <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} className="flex-1">{editing ? 'Update' : 'Add'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
