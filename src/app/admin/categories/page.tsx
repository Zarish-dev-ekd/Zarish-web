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

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
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
      const { error: insertErr } = await supabase.from('categories').insert([
        {
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: description.trim() || null,
          image_url: imageUrl || '',
          cta_label: ctaLabel.trim() || 'EXPLORE',
          display_order: parseInt(displayOrder, 10) || 0,
          is_active: isActive,
        },
      ]);

      if (insertErr) throw insertErr;

      setSuccess('Category created successfully!');
      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setImageUrl('');
      setDisplayOrder('0');
      setIsActive(true);

      // Refresh list
      fetchCategories();
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error: delErr } = await supabase.from('categories').delete().eq('id', id);
      if (delErr) throw delErr;
      setCategories(categories.filter((c) => c.id !== id));
      setSuccess('Category deleted');
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
            Create and organize product collections displayed in the &quot;SHOP BY CATEGORY&quot; section.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="admin-card" style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
        {/* Create Category Form */}
        <div className="admin-card">
          <h3 className="admin-card__title">Add New Category</h3>
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

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? 'Saving to Supabase...' : 'Save Category'}
            </button>
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
                  {categories.map((cat) => (
                    <tr key={cat.id}>
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
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="admin-btn admin-btn--danger admin-btn--sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
