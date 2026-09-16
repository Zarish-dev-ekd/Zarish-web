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
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Value Propositions (Benefits Strip)</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Highlight your brand USPs right beneath the main hero banner.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleAddStandardBenefits}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
            disabled={submitting}
          >
            + Quick Add 3 Standard USPs
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] p-4 rounded-lg border border-[#FFCDD2] mb-6 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#E8F5E9] text-[#2E7D32] p-4 rounded-lg border border-[#C8E6C9] mb-6 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start">
        {/* Form */}
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Add Value Proposition</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Title *</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="e.g. Premium Quality"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Description *</label>
              <textarea
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                rows={3}
                placeholder="Brief summary of this brand promise..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Icon</label>
                <select className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15" value={icon} onChange={(e) => setIcon(e.target.value)}>
                  <option value="shield">Shield (Quality & Trust)</option>
                  <option value="package">Package (Modern Design)</option>
                  <option value="heart">Heart (Tailored / Made for You)</option>
                  <option value="truck">Truck (Fast Dispatch)</option>
                  <option value="globe">Globe (Worldwide)</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Display Order</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[#2C241E]">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#7B5B3A] rounded"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>Active</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Proposition'}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Current Value Props ({benefits.length})</h3>

          {loading ? (
            <div className="text-center py-10">
              <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
              <p className="mt-3 text-sm text-[#7A6F66]">Loading...</p>
            </div>
          ) : benefits.length === 0 ? (
            <div className="text-center py-10 text-[#7A6F66]">
              <p>No benefits added yet.</p>
              <p className="text-xs mt-1">Click &quot;+ Quick Add 3 Standard USPs&quot; to initialize.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E8E0D5] rounded-lg">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#FAF7F2]">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Title</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Description</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Order</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D5]">
                  {benefits.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                      <td className="px-4 py-3.5 text-[#2C241E]">
                        <strong>{b.title}</strong>
                      </td>
                      <td className="px-4 py-3.5 text-[#2C241E] max-w-[240px] text-[13px]">{b.description}</td>
                      <td className="px-4 py-3.5 text-[#2C241E]">{b.display_order}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase ${b.is_active ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'}`}>
                          {b.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-[#FEE2E2] border border-[#FECACA] text-[#D32F2F] hover:bg-[#FCA5A5] transition-colors"
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
