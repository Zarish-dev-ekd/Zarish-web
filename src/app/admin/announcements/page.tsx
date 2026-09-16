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
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Top Announcement Bar</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Configure the slim notifications banner located at the very top of the website.
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start">
        {/* Form */}
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Add Announcement</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Announcement Text *</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="e.g. Free delivery on orders over ₹2,999"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Icon</label>
                <select
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                >
                  <option value="truck">Truck (Shipping)</option>
                  <option value="package">Package (Delivery)</option>
                  <option value="globe">Globe (Worldwide)</option>
                  <option value="headphones">Headphones (Support)</option>
                  <option value="shield">Shield (Quality)</option>
                </select>
              </div>

              <div>
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
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Link URL (Optional)</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="/offers or /shipping"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-2 text-sm cursor-pointer text-[#2C241E]">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7B5B3A] focus:ring-[#7B5B3A]"
                />
                <span>Active (Show on storefront)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Add Announcement'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E8E0D5]">
            <p className="text-[13px] font-semibold m-0 mb-2 text-[#2C241E]">Quick Presets:</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd('Free express delivery on prepaid orders across India', 'truck')}
                className="inline-flex items-center justify-start gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors text-left"
              >
                + Free express delivery on prepaid orders across India
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('Worldwide International Shipping Available', 'globe')}
                className="inline-flex items-center justify-start gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors text-left"
              >
                + Worldwide International Shipping Available
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Active Top Announcements ({announcements.length})</h3>

          {loading ? (
            <div className="text-center py-10">
              <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
              <p className="mt-3 text-sm text-[#7A6F66]">Loading...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-10 text-[#7A6F66]">
              <p className="text-sm">No announcements configured yet.</p>
              <p className="text-xs mt-1">The top bar will remain hidden until you add one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E8E0D5] rounded-lg">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5]">
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Icon</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Message</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Order</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((a) => (
                    <tr key={a.id} className="hover:bg-black/[0.01]">
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <code className="text-xs bg-black/[0.04] px-1.5 py-0.5 rounded">{a.icon}</code>
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">{a.text}</td>
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">{a.display_order}</td>
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase ${a.is_active ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'}`}>
                          {a.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
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
