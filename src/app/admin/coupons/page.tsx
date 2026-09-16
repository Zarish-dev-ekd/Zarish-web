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
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Coupons & Promotional Offers</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Create discount codes, set percentage or flat savings, define validity dates, and track redemptions.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] border border-[#FECACA] rounded-lg p-3.5 px-4 mb-5 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] rounded-lg p-3.5 px-4 mb-5 text-sm">
          {success}
        </div>
      )}

      {/* Creation Card */}
      <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">
          Create New Coupon Code
        </h3>

        <form onSubmit={handleCreateCoupon}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Coupon Code *</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 font-mono font-bold"
                placeholder="e.g. WELCOME10 or EID500"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Discount Type</label>
              <select
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
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

            <div>
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                {discountType === 'percentage' ? 'Percentage (% Off) *' : 'Flat Amount (INR ₹) *'}
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder={discountType === 'percentage' ? '10' : '500'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Min. Order Value (₹)</label>
              <input
                type="number"
                step="1"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Valid Until (Expiry Date)</label>
              <input
                type="date"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : '+ Create Coupon'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Existing Coupons Table */}
      <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">
          Active & Past Coupons ({coupons.length})
        </h3>

        {loading ? (
          <div className="text-center py-10">
            <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
            <p className="mt-3 text-sm text-[#7A6F66]">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-[#7A6F66]">
            <div className="text-3xl mb-2">🏷️</div>
            <p className="text-[15px] font-semibold text-[#2C241E]">
              No promotional coupons created yet.
            </p>
            <p className="text-xs mt-1">
              Create your first code above (e.g. WELCOME10 for 10% off).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E8E0D5] rounded-lg">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#FAF8F5]">
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Coupon Code</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Discount Offer</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Min Order</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Validity / Expiry</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Redemptions</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Actions</th>
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
                    <tr key={c.id} className="hover:bg-black/[0.01]">
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <strong className="font-mono text-sm bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#E2D5C7] text-[#2C1D13] tracking-wide">
                          {c.code}
                        </strong>
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <strong className="text-[#7B5B3A] text-[13px]">
                          {c.discount_type === 'percentage'
                            ? `${c.discount_value}% OFF`
                            : `${formatPrice(c.discount_value)} FLAT OFF`}
                        </strong>
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-xs">
                        {c.min_order_value > 0 ? formatPrice(c.min_order_value) : 'None (₹0)'}
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-xs">
                        <span className={isExpired ? 'text-[#D32F2F] font-bold' : 'text-[#2C241E]'}>
                          {expiryFormatted}
                          {isExpired && ' (Expired)'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-xs text-[#7A6F66]">
                        {c.usage_count || 0} times used
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c.id, c.is_active)}
                          className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase cursor-pointer border-none ${
                            c.is_active && !isExpired ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'
                          }`}
                          title="Click to toggle status"
                        >
                          {c.is_active && !isExpired ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-[#FEE2E2] border border-[#FECACA] text-[#D32F2F] hover:bg-[#FCA5A5] transition-colors"
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
