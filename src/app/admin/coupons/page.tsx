'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { Coupon } from '@/lib/types';

export default function AdminCouponsPage() {
  const supabase = createClient();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [validUntil, setValidUntil] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setCoupons((data as Coupon[]) || []);
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err?.message || 'Failed to load coupons from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please provide a coupon code.');
      return;
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setError('Discount value must be greater than 0.');
      return;
    }

    if (discountType === 'percentage' && val > 100) {
      setError('Percentage discount cannot exceed 100%.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      const minOrder = parseFloat(minOrderValue) || 0;

      const { data, error: insertErr } = await supabase
        .from('coupons')
        .insert([
          {
            code: cleanCode,
            discount_type: discountType,
            discount_value: val,
            min_order_value: minOrder,
            valid_until: validUntil ? new Date(validUntil).toISOString() : null,
            is_active: true,
            usage_count: 0,
          },
        ])
        .select()
        .single();

      if (insertErr) throw insertErr;

      setSuccess(`Coupon "${cleanCode}" created successfully!`);
      setCode('');
      setDiscountValue(discountType === 'percentage' ? '10' : '500');
      setMinOrderValue('0');
      setValidUntil('');
      if (data) {
        setCoupons([data as Coupon, ...coupons]);
      }
    } catch (err: any) {
      console.error('Error creating coupon:', err);
      setError(
        err?.message?.includes('duplicate key')
          ? 'A coupon with this code already exists. Please choose a different code.'
          : err?.message || 'Failed to save coupon.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const { error: updateErr } = await supabase
        .from('coupons')
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateErr) throw updateErr;

      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: newStatus } : c))
      );
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteCoupon = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete the coupon "${couponCode}"?`)) return;

    try {
      const { error: delErr } = await supabase.from('coupons').delete().eq('id', id);
      if (delErr) throw delErr;

      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setSuccess(`Coupon "${couponCode}" removed.`);
    } catch (err: any) {
      alert('Failed to delete coupon: ' + err.message);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Coupons & Promotional Offers</h2>
          <p className="admin-page-subtitle">
            Create discount codes, set percentage or flat savings, define validity dates, and track redemptions.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="admin-card" style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {/* Creation Card */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <h3 className="admin-card__title" style={{ marginBottom: '16px' }}>
          Create New Coupon Code
        </h3>

        <form onSubmit={handleCreateCoupon}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-label">Coupon Code *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. WELCOME10 or EID500"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                style={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                required
              />
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-label">Discount Type</label>
              <select
                className="admin-select"
                value={discountType}
                onChange={(e) => {
                  const t = e.target.value as 'percentage' | 'fixed';
                  setDiscountType(t);
                  setDiscountValue(t === 'percentage' ? '10' : '500');
                }}
              >
                <option value="percentage">% Percentage Off</option>
                <option value="fixed">₹ Flat Amount Off</option>
              </select>
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-label">
                {discountType === 'percentage' ? 'Percentage (% Off) *' : 'Flat Amount (INR ₹) *'}
              </label>
              <input
                type="number"
                step="0.01"
                className="admin-input"
                placeholder={discountType === 'percentage' ? '10' : '500'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-label">Min. Order Value (₹)</label>
              <input
                type="number"
                step="1"
                className="admin-input"
                placeholder="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
              />
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-label">Valid Until (Expiry Date)</label>
              <input
                type="date"
                className="admin-input"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="admin-btn admin-btn--primary"
                style={{ width: '100%', height: '40px' }}
              >
                {submitting ? 'Creating...' : '+ Create Coupon'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Existing Coupons Table */}
      <div className="admin-card">
        <h3 className="admin-card__title" style={{ marginBottom: '16px' }}>
          Active & Past Coupons ({coupons.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span className="admin-spinner" />
            <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)' }}>Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--admin-text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏷️</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--admin-text-main)' }}>
              No promotional coupons created yet.
            </p>
            <p style={{ fontSize: '13px' }}>
              Create your first code above (e.g. WELCOME10 for 10% off).
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Discount Offer</th>
                  <th>Min Order</th>
                  <th>Validity / Expiry</th>
                  <th>Redemptions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const isExpired = c.valid_until && new Date(c.valid_until) < new Date();
                  const expiryFormatted = c.valid_until
                    ? new Date(c.valid_until).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Perpetual (No Expiry)';

                  return (
                    <tr key={c.id}>
                      <td>
                        <strong
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            background: '#FAF6F0',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #E2D5C7',
                            color: '#2C1D13',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {c.code}
                        </strong>
                      </td>

                      <td>
                        <strong style={{ color: '#7B5B3A', fontSize: '13px' }}>
                          {c.discount_type === 'percentage'
                            ? `${c.discount_value}% OFF`
                            : `${formatPrice(c.discount_value)} FLAT OFF`}
                        </strong>
                      </td>

                      <td>
                        <span style={{ fontSize: '12px' }}>
                          {c.min_order_value > 0 ? formatPrice(c.min_order_value) : 'None (₹0)'}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: '12px',
                            color: isExpired ? '#D32F2F' : 'var(--admin-text-main)',
                            fontWeight: isExpired ? 700 : 400,
                          }}
                        >
                          {expiryFormatted}
                          {isExpired && ' (Expired)'}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                          {c.usage_count || 0} times used
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c.id, c.is_active)}
                          className={`admin-badge ${c.is_active && !isExpired ? 'admin-badge--active' : 'admin-badge--inactive'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle status"
                        >
                          {c.is_active && !isExpired ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="admin-btn admin-btn--danger admin-btn--sm"
                        >
                          Delete
                        </button>
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
  );
}
