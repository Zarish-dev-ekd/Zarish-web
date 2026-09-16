'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/admin/ImageUpload';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaLabel, setCtaLabel] = useState('EXPLORE');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const supabase = createClient();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setCtaLabel('EXPLORE');
    setDisplayOrder('0');
    setIsActive(true);
    setEditingCategory(null);
  };

  // Helper to ensure a unique slug is always generated
  const generateUniqueSlug = (baseSlug: string, currentId?: string): string => {
    let cleanSlug = baseSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!cleanSlug) cleanSlug = 'category';

    const existingSlugs = categories
      .filter((c) => c.id !== currentId)
      .map((c) => c.slug.toLowerCase().trim());

    if (!existingSlugs.includes(cleanSlug)) {
      return cleanSlug;
    }

    let counter = 1;
    while (existingSlugs.includes(`${cleanSlug}-${counter}`)) {
      counter++;
    }
    return `${cleanSlug}-${counter}`;
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const syncSlugWithName = () => {
    setSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setCtaLabel(cat.cta_label || 'EXPLORE');
    setDisplayOrder(String(cat.display_order ?? 0));
    setIsActive(cat.is_active);
    setError(null);
    setSuccess(null);

    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingCategory) {
        // UPDATE existing category
        const finalSlug = generateUniqueSlug(slug || name, editingCategory.id);

        const { error: updateErr } = await supabase
          .from('categories')
          .update({
            name: name.trim(),
            slug: finalSlug,
            description: description.trim() || null,
            image_url: imageUrl || '',
            cta_label: ctaLabel.trim() || 'EXPLORE',
            display_order: parseInt(displayOrder, 10) || 0,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory.id);

        if (updateErr) throw updateErr;

        setSuccess(`Category "${name.trim()}" updated successfully!`);
        resetForm();
        fetchCategories();
      } else {
        // INSERT new category with guaranteed unique slug
        const finalSlug = generateUniqueSlug(slug || name);

        const { error: insertErr } = await supabase.from('categories').insert([
          {
            name: name.trim(),
            slug: finalSlug,
            description: description.trim() || null,
            image_url: imageUrl || '',
            cta_label: ctaLabel.trim() || 'EXPLORE',
            display_order: parseInt(displayOrder, 10) || 0,
            is_active: isActive,
          },
        ]);

        if (insertErr) throw insertErr;

        setSuccess(`Category "${name.trim()}" created successfully!`);
        resetForm();
        fetchCategories();
      }
    } catch (err: any) {
      console.error('Error saving category:', err);
      // Helpful friendly message if a slug conflict still occurs
      if (err?.message?.includes('categories_slug_key')) {
        setError(`A category with this URL slug already exists. Please choose a different slug or name.`);
      } else {
        setError(err?.message || 'Failed to save category');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const catToDelete = categories.find((c) => c.id === id);
    if (!confirm(`Are you sure you want to delete category "${catToDelete?.name || 'this category'}"?`)) return;

    try {
      const { error: delErr } = await supabase.from('categories').delete().eq('id', id);
      if (delErr) throw delErr;

      setCategories(categories.filter((c) => c.id !== id));
      if (editingCategory?.id === id) {
        resetForm();
      }
      setSuccess('Category deleted successfully');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete category');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Category Management</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Create, edit, and organize product collections displayed in the &quot;SHOP BY CATEGORY&quot; section.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] border-l-4 border-[#D32F2F] border border-[#FECACA] rounded-lg p-3.5 px-4 mb-5 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#E8F5E9] text-[#2E7D32] border-l-4 border-[#2E7D32] border border-[#C8E6C9] rounded-lg p-3.5 px-4 mb-5 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start">
        {/* Create / Edit Category Form */}
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold m-0 text-[#2C241E]">
              {editingCategory ? `Edit Category` : `Add New Category`}
            </h3>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2.5 py-1 text-xs font-medium rounded border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>

          {editingCategory && (
            <div className="bg-[#F5EDE3] p-2.5 px-3 rounded-md mb-4 text-[13px] text-[#3D2B1F]">
              Editing: <strong>{editingCategory.name}</strong> (/{editingCategory.slug})
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Category Name *</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="e.g. Luxury Abayas"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[13px] font-semibold text-[#2C241E] m-0">URL Slug</label>
                <button
                  type="button"
                  onClick={syncSlugWithName}
                  className="bg-transparent border-none text-[#7B5B3A] text-xs font-semibold cursor-pointer px-1.5 py-0.5 hover:underline"
                  title="Regenerate slug from current name"
                >
                  ↺ Sync with Name
                </button>
              </div>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="e.g. luxury-abayas"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <small className="block mt-1 text-[#777] text-[11px]">
                Used in links: <code>/category/{slug || 'example'}</code>. Must be unique.
              </small>
            </div>

            <div className="mb-5">
              <ImageUpload
                label="Cover Image (Cloudinary)"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                folder="zarish/categories"
                helperText="Vertical portrait (approx 800x1000px) looks best on homepage cards."
              />
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Button CTA Label</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="EXPLORE"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Display Order</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                />
              </div>

              <div className="flex items-center mt-7">
                <label className="flex items-center gap-2 text-sm cursor-pointer text-[#2C241E]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#7B5B3A] focus:ring-[#7B5B3A]"
                  />
                  <span>Active (Visible on Store)</span>
                </label>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Description (Optional)</label>
              <textarea
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 min-h-[90px] resize-y"
                rows={3}
                placeholder="Brief description of this collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50"
              >
                {submitting
                  ? 'Saving to Supabase...'
                  : editingCategory
                  ? '✓ Update Category'
                  : '+ Save Category'}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Existing Categories ({categories.length})</h3>

          {loading ? (
            <div className="text-center py-10">
              <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
              <p className="mt-3 text-sm text-[#7A6F66]">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-[#7A6F66]">
              <p className="text-sm">No categories added yet.</p>
              <p className="text-xs mt-1">Add your first category using the form on the left.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E8E0D5] rounded-lg">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5]">
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Image</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Name</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Slug</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Order</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const isBeingEdited = editingCategory?.id === cat.id;
                    return (
                      <tr
                        key={cat.id}
                        className={`hover:bg-black/[0.01] ${isBeingEdited ? 'bg-[#FAF6F0] border-l-[3px] border-l-[#7B5B3A]' : ''}`}
                      >
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          {cat.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={cat.image_url} alt={cat.name} className="w-12 h-[60px] object-cover rounded border border-[#E8E0D5] bg-[#EEEEEE]" />
                          ) : (
                            <span className="text-xs text-[#999]">No img</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle font-semibold text-[#2C241E]">
                          <strong>{cat.name}</strong>
                          {isBeingEdited && (
                            <span className="ml-1.5 text-[10px] bg-[#7B5B3A] text-white px-1.5 py-0.5 rounded">
                              Editing
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">
                          <code className="text-xs bg-black/[0.04] px-1.5 py-0.5 rounded">/{cat.slug}</code>
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">{cat.display_order}</td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <span
                            className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase ${
                              cat.is_active ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'
                            }`}
                          >
                            {cat.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <div className="flex gap-1.5 items-center">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                                isBeingEdited
                                  ? 'bg-[#7B5B3A] text-white'
                                  : 'border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0]'
                              }`}
                            >
                              {isBeingEdited ? 'Editing' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat.id)}
                              className="px-2.5 py-1 text-xs font-medium rounded bg-[#FEE2E2] border border-[#FECACA] text-[#D32F2F] hover:bg-[#FCA5A5] transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

