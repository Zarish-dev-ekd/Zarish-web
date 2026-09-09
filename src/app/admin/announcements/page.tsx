'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Announcement } from '@/lib/types';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [text, setText] = useState('');
  const [icon, setIcon] = useState('truck');
  const [linkUrl, setLinkUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const supabase = createClient();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
      setError(err?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertErr } = await supabase.from('announcements').insert([
        {
          text: text.trim(),
          icon: icon || 'truck',
          link_url: linkUrl.trim() || null,
          display_order: parseInt(displayOrder, 10) || 0,
          is_active: isActive,
        },
      ]);

      if (insertErr) throw insertErr;

      setSuccess('Announcement added successfully!');
      setText('');
      setLinkUrl('');
      setDisplayOrder('0');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err?.message || 'Failed to add announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdd = async (presetText: string, presetIcon: string) => {
    setSubmitting(true);
    try {
      const { error: insertErr } = await supabase.from('announcements').insert([
        {
          text: presetText,
          icon: presetIcon,
          display_order: announcements.length,
          is_active: true,
        },
      ]);
      if (insertErr) throw insertErr;
      setSuccess('Announcement added!');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err?.message || 'Failed to add preset announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;

    try {
      const { error: delErr } = await supabase.from('announcements').delete().eq('id', id);
      if (delErr) throw delErr;
      setAnnouncements(announcements.filter((a) => a.id !== id));
      setSuccess('Announcement deleted');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete announcement');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Top Announcement Bar</h2>
          <p className="admin-page-subtitle">
            Configure the slim notifications banner located at the very top of the website.
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
        {/* Form */}
        <div className="admin-card">
          <h3 className="admin-card__title">Add Announcement</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-label">Announcement Text *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Free delivery on orders over ₹2,999"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Icon</label>
                <select className="admin-select" value={icon} onChange={(e) => setIcon(e.target.value)}>
                  <option value="truck">Truck (Shipping)</option>
                  <option value="package">Package (Delivery)</option>
                  <option value="globe">Globe (Worldwide)</option>
                  <option value="headphones">Headphones (Support)</option>
                  <option value="shield">Shield (Quality)</option>
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
              <label className="admin-label">Link URL (Optional)</label>
              <input
                type="text"
                className="admin-input"
                placeholder="/offers or /shipping"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>Active (Show on storefront)</span>
              </label>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? 'Saving...' : 'Add Announcement'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px 0' }}>Quick Presets:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickAdd('Free express delivery on prepaid orders across India', 'truck')}
                className="admin-btn admin-btn--sm admin-btn--secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                + Free express delivery on prepaid orders across India
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('Worldwide International Shipping Available', 'globe')}
                className="admin-btn admin-btn--sm admin-btn--secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                + Worldwide International Shipping Available
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-card">
          <h3 className="admin-card__title">Active Top Announcements ({announcements.length})</h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <span className="admin-spinner" />
              <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)' }}>Loading...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-muted)' }}>
              <p>No announcements configured yet.</p>
              <p style={{ fontSize: '13px' }}>The top bar will remain hidden until you add one.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Message</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <code>{a.icon}</code>
                      </td>
                      <td>{a.text}</td>
                      <td>{a.display_order}</td>
                      <td>
                        <span className={`admin-badge ${a.is_active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
                          {a.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
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
