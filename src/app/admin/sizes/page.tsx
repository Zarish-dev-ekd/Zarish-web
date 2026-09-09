'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Size } from '@/lib/types';

const STANDARD_SIZES = [
  { name: 'XS', slug: 'xs', display_order: 1 },
  { name: 'S', slug: 's', display_order: 2 },
  { name: 'M', slug: 'm', display_order: 3 },
  { name: 'L', slug: 'l', display_order: 4 },
  { name: 'XL', slug: 'xl', display_order: 5 },
  { name: 'XXL', slug: 'xxl', display_order: 6 },
  { name: 'FREE SIZE', slug: 'free-size', display_order: 7 },
];

export default function AdminSizesPage() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const supabase = createClient();

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sizes')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSizes(data || []);
    } catch (err: any) {
      console.error('Error fetching sizes:', err);
      setError(err?.message || 'Failed to load sizes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertErr } = await supabase.from('sizes').insert([
        {
          name: name.trim().toUpperCase(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          display_order: parseInt(displayOrder, 10) || 0,
          is_active: isActive,
        },
      ]);

      if (insertErr) throw insertErr;

      setSuccess('Size added successfully!');
      setName('');
      setSlug('');
      setDisplayOrder('0');
      fetchSizes();
    } catch (err: any) {
      setError(err?.message || 'Failed to add size');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStandardSizes = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const itemsToInsert = STANDARD_SIZES.map((s) => ({
        name: s.name,
        slug: s.slug,
        display_order: s.display_order,
        is_active: true,
      }));

      const { error: insertErr } = await supabase
        .from('sizes')
        .upsert(itemsToInsert, { onConflict: 'slug' });

      if (insertErr) throw insertErr;

      setSuccess('Standard sizes added successfully!');
      fetchSizes();
    } catch (err: any) {
      setError(err?.message || 'Failed to insert standard sizes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this size?')) return;

    try {
      const { error: delErr } = await supabase.from('sizes').delete().eq('id', id);
      if (delErr) throw delErr;
      setSizes(sizes.filter((s) => s.id !== id));
      setSuccess('Size deleted');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete size');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Size Management</h2>
          <p className="admin-page-subtitle">
            Configure clothing sizes shown in the interactive &quot;WHAT&apos;S YOUR SIZE?&quot; selector on the homepage and on product pages.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleAddStandardSizes}
            className="admin-btn admin-btn--secondary"
            disabled={submitting}
          >
            + Quick Add Standard Sizes (XS-Free Size)
          </button>
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
        {/* Form */}
        <div className="admin-card">
          <h3 className="admin-card__title">Add New Size</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-label">Size Name *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. M or 54 (Length)"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Slug</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. m"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
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
                  <span>Active</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? 'Saving...' : 'Add Size'}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="admin-card">
          <h3 className="admin-card__title">Configured Sizes ({sizes.length})</h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <span className="admin-spinner" />
              <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)' }}>Loading sizes...</p>
            </div>
          ) : sizes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-muted)' }}>
              <p>No sizes created yet.</p>
              <p style={{ fontSize: '13px' }}>Click &quot;Quick Add Standard Sizes&quot; above to populate default sizes.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Slug</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>
                        <code>{s.slug}</code>
                      </td>
                      <td>{s.display_order}</td>
                      <td>
                        <span className={`admin-badge ${s.is_active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
                          {s.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
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
