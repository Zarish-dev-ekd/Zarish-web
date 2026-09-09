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
    // Only auto-update slug if not editing an existing category, or if slug was empty
    if (!editingCategory || !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
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
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Category Management</h2>
          <p className="admin-page-subtitle">
            Create, edit, and organize product collections displayed in the &quot;SHOP BY CATEGORY&quot; section.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px', borderLeft: '4px solid #D32F2F' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="admin-card" style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderLeft: '4px solid #2E7D32' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
        {/* Create / Edit Category Form */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="admin-card__title" style={{ margin: 0 }}>
              {editingCategory ? `Edit Category` : `Add New Category`}
            </h3>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="admin-btn admin-btn--secondary admin-btn--sm"
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>

          {editingCategory && (
            <div style={{ background: '#F5EDE3', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#3D2B1F' }}>
              Editing: <strong>{editingCategory.name}</strong> (/{editingCategory.slug})
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-label">Category Name *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Luxury Abayas"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">URL Slug</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. luxury-abayas"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <small style={{ display: 'block', marginTop: '4px', color: '#777', fontSize: '11px' }}>
                Used in links: <code>/category/{slug || 'example'}</code>. Must be unique.
              </small>
            </div>

            <div className="admin-form-group">
              <ImageUpload
                label="Cover Image (Cloudinary)"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                folder="zarish/categories"
                helperText="Vertical portrait (approx 800x1000px) looks best on homepage cards."
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Button CTA Label</label>
              <input
                type="text"
                className="admin-input"
                placeholder="EXPLORE"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Display Order</label>
                <input
                  type="number"
                  className="admin-input"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                />
              </div>

              <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active (Visible on Store)</span>
                </label>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Description (Optional)</label>
              <textarea
                className="admin-textarea"
                rows={3}
                placeholder="Brief description of this collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={submitting}
                style={{ flex: 1 }}
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
                  className="admin-btn admin-btn--secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="admin-card">
          <h3 className="admin-card__title">Existing Categories ({categories.length})</h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <span className="admin-spinner" />
              <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)' }}>Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-muted)' }}>
              <p>No categories added yet.</p>
              <p style={{ fontSize: '13px' }}>Add your first category using the form on the left.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const isBeingEdited = editingCategory?.id === cat.id;
                    return (
                      <tr
                        key={cat.id}
                        style={isBeingEdited ? { backgroundColor: '#FAF6F0', borderLeft: '3px solid #7B5B3A' } : undefined}
                      >
                        <td>
                          {cat.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={cat.image_url} alt={cat.name} className="admin-thumbnail" />
                          ) : (
                            <span style={{ fontSize: '12px', color: '#999' }}>No img</span>
                          )}
                        </td>
                        <td>
                          <strong>{cat.name}</strong>
                          {isBeingEdited && (
                            <span style={{ marginLeft: '6px', fontSize: '10px', background: '#7B5B3A', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                              Editing
                            </span>
                          )}
                        </td>
                        <td>
                          <code>/{cat.slug}</code>
                        </td>
                        <td>{cat.display_order}</td>
                        <td>
                          <span className={`admin-badge ${cat.is_active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
                            {cat.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className={`admin-btn admin-btn--sm ${isBeingEdited ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                            >
                              {isBeingEdited ? 'Editing' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat.id)}
                              className="admin-btn admin-btn--danger admin-btn--sm"
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
