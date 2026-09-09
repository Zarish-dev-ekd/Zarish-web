'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Benefit } from '@/lib/types';

const STANDARD_BENEFITS = [
  {
    title: 'Premium Quality',
    description: 'Luxurious fabrics selected with utmost attention to comfort, drape, and longevity.',
    icon: 'shield',
    display_order: 1,
  },
  {
    title: 'Modest & Modern',
    description: 'Contemporary cuts tailored to preserve timeless modest grace for every occasion.',
    icon: 'package',
    display_order: 2,
  },
  {
    title: 'Made for You',
    description: 'Inclusive sizing and refined craftsmanship celebrating every modest silhouette.',
    icon: 'heart',
    display_order: 3,
  },
];

export default function AdminBenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('shield');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const supabase = createClient();

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBenefits(data || []);
    } catch (err: any) {
      console.error('Error fetching benefits:', err);
      setError(err?.message || 'Failed to load benefits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertErr } = await supabase.from('benefits').insert([
        {
          title: title.trim(),
          description: description.trim(),
          icon: icon || 'shield',
          display_order: parseInt(displayOrder, 10) || 0,
          is_active: isActive,
        },
      ]);

      if (insertErr) throw insertErr;

      setSuccess('Benefit added successfully!');
      setTitle('');
      setDescription('');
      setDisplayOrder('0');
      fetchBenefits();
    } catch (err: any) {
      setError(err?.message || 'Failed to add benefit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStandardBenefits = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertErr } = await supabase.from('benefits').insert(
        STANDARD_BENEFITS.map((b) => ({
          ...b,
          is_active: true,
        }))
      );

      if (insertErr) throw insertErr;

      setSuccess('Standard ZARISH value propositions added!');
      fetchBenefits();
    } catch (err: any) {
      setError(err?.message || 'Failed to add standard benefits');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this benefit?')) return;

    try {
      const { error: delErr } = await supabase.from('benefits').delete().eq('id', id);
      if (delErr) throw delErr;
      setBenefits(benefits.filter((b) => b.id !== id));
      setSuccess('Benefit deleted');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete benefit');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Value Propositions (Benefits Strip)</h2>
          <p className="admin-page-subtitle">
            Highlight your brand USPs right beneath the main hero banner.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleAddStandardBenefits}
            className="admin-btn admin-btn--secondary"
            disabled={submitting}
          >
            + Quick Add 3 Standard USPs
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
          <h3 className="admin-card__title">Add Value Proposition</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-label">Title *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Premium Quality"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Description *</label>
              <textarea
                className="admin-textarea"
                rows={3}
                placeholder="Brief summary of this brand promise..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Icon</label>
                <select className="admin-select" value={icon} onChange={(e) => setIcon(e.target.value)}>
                  <option value="shield">Shield (Quality & Trust)</option>
                  <option value="package">Package (Modern Design)</option>
                  <option value="heart">Heart (Tailored / Made for You)</option>
                  <option value="truck">Truck (Fast Dispatch)</option>
                  <option value="globe">Globe (Worldwide)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Display Order</label>
                <input
                  type="number"
                  className="admin-input"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>Active</span>
              </label>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? 'Saving...' : 'Save Proposition'}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="admin-card">
          <h3 className="admin-card__title">Current Value Props ({benefits.length})</h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <span className="admin-spinner" />
              <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)' }}>Loading...</p>
            </div>
          ) : benefits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-muted)' }}>
              <p>No benefits added yet.</p>
              <p style={{ fontSize: '13px' }}>Click &quot;+ Quick Add 3 Standard USPs&quot; to initialize.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {benefits.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.title}</strong>
                      </td>
                      <td style={{ maxWidth: '240px', fontSize: '13px' }}>{b.description}</td>
                      <td>{b.display_order}</td>
                      <td>
                        <span className={`admin-badge ${b.is_active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
                          {b.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
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
