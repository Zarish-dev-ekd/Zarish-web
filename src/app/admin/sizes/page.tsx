'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Size, ProductColor } from '@/lib/types';

const STANDARD_SIZES = [
  { name: 'XS', slug: 'xs', display_order: 1 },
  { name: 'S', slug: 's', display_order: 2 },
  { name: 'M', slug: 'm', display_order: 3 },
  { name: 'L', slug: 'l', display_order: 4 },
  { name: 'XL', slug: 'xl', display_order: 5 },
  { name: 'XXL', slug: 'xxl', display_order: 6 },
  { name: 'FREE SIZE', slug: 'free-size', display_order: 7 },
];

const SQL_SCHEMA_SNIPPET = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL DEFAULT '#000000',
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read colors" ON public.colors FOR SELECT USING (true);
CREATE POLICY "Admin all colors" ON public.colors FOR ALL USING (true) WITH CHECK (true);`;

export default function AdminSizesAndColorsPage() {
  const [activeTab, setActiveTab] = useState<'sizes' | 'colors'>('sizes');

  // Sizes State
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loadingSizes, setLoadingSizes] = useState(true);
  const [sizeName, setSizeName] = useState('');
  const [sizeSlug, setSizeSlug] = useState('');
  const [sizeDisplayOrder, setSizeDisplayOrder] = useState('0');
  const [sizeIsActive, setSizeIsActive] = useState(true);

  // Colors State
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#7B5B3A');
  const [colorSlug, setColorSlug] = useState('');
  const [colorDisplayOrder, setColorDisplayOrder] = useState('0');
  const [colorIsActive, setColorIsActive] = useState(true);
  const [colorTableMissing, setColorTableMissing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Common UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch Sizes
  const fetchSizes = async () => {
    try {
      setLoadingSizes(true);
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
      setLoadingSizes(false);
    }
  };

  // Fetch Colors
  const fetchColors = async () => {
    try {
      setLoadingColors(true);
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('colors') || error.message?.includes('schema cache')) {
          setColorTableMissing(true);
        } else {
          throw error;
        }
        return;
      }

      setColorTableMissing(false);
      setColors(data || []);
    } catch (err: any) {
      console.error('Error fetching colors:', err);
      setError(err?.message || 'Failed to load colors');
    } finally {
      setLoadingColors(false);
    }
  };

  useEffect(() => {
    fetchSizes();
    fetchColors();
  }, []);

  // Size Form Handlers
  const handleSizeNameChange = (val: string) => {
    setSizeName(val);
    setSizeSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
  };

  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeName.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertErr } = await supabase.from('sizes').insert([
        {
          name: sizeName.trim().toUpperCase(),
          slug: sizeSlug.trim() || sizeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          display_order: parseInt(sizeDisplayOrder, 10) || 0,
          is_active: sizeIsActive,
        },
      ]);

      if (insertErr) throw insertErr;

      setSuccess('Size added successfully!');
      setSizeName('');
      setSizeSlug('');
      setSizeDisplayOrder('0');
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

  const handleDeleteSize = async (id: string) => {
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

  // Color Form Handlers
  const handleColorNameChange = (val: string) => {
    setColorName(val);
    setColorSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
  };

  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertErr } = await supabase.from('colors').insert([
        {
          name: colorName.trim(),
          hex_code: colorHex.trim() || '#000000',
          slug: colorSlug.trim() || colorName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          display_order: parseInt(colorDisplayOrder, 10) || 0,
          is_active: colorIsActive,
        },
      ]);

      if (insertErr) {
        if (insertErr.code === 'PGRST205' || insertErr.message?.includes('colors')) {
          setColorTableMissing(true);
          throw new Error('Database table "colors" is not yet created in Supabase. Please see instructions below.');
        }
        throw insertErr;
      }

      setSuccess('Color saved successfully');
      setColorName('');
      setColorSlug('');
      setColorHex('#7B5B3A');
      setColorDisplayOrder('0');
      fetchColors();
    } catch (err: any) {
      setError(err?.message || 'Failed to add color');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteColor = async (id: string) => {
    if (!confirm('Are you sure you want to remove this color?')) return;

    try {
      const { error: delErr } = await supabase.from('colors').delete().eq('id', id);
      if (delErr) throw delErr;
      setColors(colors.filter((c) => c.id !== id));
      setSuccess('Color deleted from database');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete color');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">
            Size & Color Management
          </h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Configure clothing sizes and product color variants available for your store catalog.
          </p>
        </div>
        {activeTab === 'sizes' && (
          <div>
            <button
              type="button"
              onClick={handleAddStandardSizes}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Quick Add Standard Sizes (XS-Free Size)
            </button>
          </div>
        )}
      </div>

      {/* Subnav Tabs */}
      <div className="flex gap-2 bg-black/[0.04] p-1 rounded-lg w-fit mb-6" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sizes'}
          onClick={() => {
            setActiveTab('sizes');
            setError(null);
            setSuccess(null);
          }}
          className={`inline-flex items-center gap-2 px-[18px] py-2 text-sm font-medium rounded-md border-0 cursor-pointer transition-all duration-200 ${
            activeTab === 'sizes'
              ? 'bg-white text-[#7B5B3A] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'bg-transparent text-[#7A6F66] hover:text-[#2C241E]'
          }`}
        >
          <span>Sizes</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === 'sizes' ? 'bg-[#7B5B3A] text-white' : 'bg-black/[0.08] text-inherit'
            }`}
          >
            {sizes.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'colors'}
          onClick={() => {
            setActiveTab('colors');
            setError(null);
            setSuccess(null);
          }}
          className={`inline-flex items-center gap-2 px-[18px] py-2 text-sm font-medium rounded-md border-0 cursor-pointer transition-all duration-200 ${
            activeTab === 'colors'
              ? 'bg-white text-[#7B5B3A] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'bg-transparent text-[#7A6F66] hover:text-[#2C241E]'
          }`}
        >
          <span>Colors</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === 'colors' ? 'bg-[#7B5B3A] text-white' : 'bg-black/[0.08] text-inherit'
            }`}
          >
            {colors.length}
          </span>
        </button>
      </div>

      {/* Alerts */}
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

      {/* Table Missing Helper Alert */}
      {activeTab === 'colors' && colorTableMissing && (
        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-4 px-5 mb-6">
          <div className="flex items-start justify-between gap-4 max-sm:flex-col">
            <div>
              <h4 className="m-0 mb-1.5 text-[#B78103] text-[15px] font-semibold">
                Database Setup Required: Table &quot;colors&quot;
              </h4>
              <p className="m-0 mb-3 text-[13px] text-[#664D03] leading-relaxed">
                The <code className="bg-black/[0.06] px-1.5 py-0.5 rounded text-xs">colors</code> table is not yet created in your Supabase database. Run this SQL in your Supabase SQL Editor:
              </p>
              <pre className="bg-[#2B2118] text-[#FAF6F0] p-3.5 px-4 rounded-md text-xs overflow-x-auto font-mono">
                {SQL_SCHEMA_SNIPPET}
              </pre>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors"
              >
                {copiedSql ? '✓ Copied SQL!' : 'Copy SQL'}
              </button>
              <button
                type="button"
                onClick={fetchColors}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
              >
                ↻ Refresh Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT: SIZES ─── */}
      {activeTab === 'sizes' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start">
          {/* Add Size Form */}
          <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Add New Size</h3>
            <form onSubmit={handleSizeSubmit}>
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Size Name *</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="e.g. M or 54 (Length)"
                  value={sizeName}
                  onChange={(e) => handleSizeNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Slug</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="e.g. m"
                  value={sizeSlug}
                  onChange={(e) => setSizeSlug(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Display Order</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    value={sizeDisplayOrder}
                    onChange={(e) => setSizeDisplayOrder(e.target.value)}
                  />
                </div>

                <div className="flex items-center mt-7">
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-[#2C241E]">
                    <input
                      type="checkbox"
                      checked={sizeIsActive}
                      onChange={(e) => setSizeIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#7B5B3A] focus:ring-[#7B5B3A]"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Add Size'}
              </button>
            </form>
          </div>

          {/* Configured Sizes Table */}
          <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Configured Sizes ({sizes.length})</h3>

            {loadingSizes ? (
              <div className="text-center py-10">
                <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
                <p className="mt-3 text-sm text-[#7A6F66]">Loading sizes...</p>
              </div>
            ) : sizes.length === 0 ? (
              <div className="text-center py-10 text-[#7A6F66]">
                <p className="text-sm">No sizes created yet.</p>
                <p className="text-xs mt-1">Click &quot;Quick Add Standard Sizes&quot; above to populate default sizes.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#E8E0D5] rounded-lg">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#FAF8F5]">
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Size</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Slug</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Order</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Status</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((s) => (
                      <tr key={s.id} className="hover:bg-black/[0.01]">
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle  text-[#2C241E]">
                          {s.name}
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">
                          <code className="text-xs bg-black/[0.04] px-1.5 py-0.5 rounded">{s.slug}</code>
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">{s.display_order}</td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <span
                            className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase ${
                              s.is_active ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'
                            }`}
                          >
                            {s.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <button
                            type="button"
                            onClick={() => handleDeleteSize(s.id)}
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
      )}

      {/* ─── TAB CONTENT: COLORS ─── */}
      {activeTab === 'colors' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start">
          {/* Add Color Form */}
          <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Add New Color</h3>
            <form onSubmit={handleColorSubmit}>
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Color Name *</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="e.g. Jet Black, Dusty Rose, Sage Green"
                  value={colorName}
                  onChange={(e) => handleColorNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Color Swatch & Hex Code *</label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    className="w-11 h-10 rounded-md cursor-pointer p-0.5 shrink-0"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    title="Choose color visually"
                  />
                  <input
                    type="text"
                    className="flex-1 px-3.5 py-2.5 text-sm font-mono border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    placeholder="#7B5B3A"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    required
                  />
                  <span
                    className="w-8 h-8 rounded-full border border-black/15 shadow-[0_1px_2px_rgba(0,0,0,0.08)] shrink-0 inline-block"
                    style={{ backgroundColor: colorHex }}
                    title={colorHex}
                  />
                </div>
                <p className="text-xs text-[#7A6F66] mt-1.5">
                  Click the color square to pick visually, or type any hex code.
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Slug</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="e.g. jet-black"
                  value={colorSlug}
                  onChange={(e) => setColorSlug(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Display Order</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    value={colorDisplayOrder}
                    onChange={(e) => setColorDisplayOrder(e.target.value)}
                  />
                </div>

                <div className="flex items-center mt-7">
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-[#2C241E]">
                    <input
                      type="checkbox"
                      checked={colorIsActive}
                      onChange={(e) => setColorIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#7B5B3A] focus:ring-[#7B5B3A]"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving to Database...' : 'Save'}
              </button>
            </form>
          </div>

          {/* Configured Colors Table */}
          <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Configured Colors ({colors.length})</h3>

            {loadingColors ? (
              <div className="text-center py-10">
                <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
                <p className="mt-3 text-sm text-[#7A6F66]">Loading colors from database...</p>
              </div>
            ) : colors.length === 0 ? (
              <div className="text-center py-10 text-[#7A6F66]">
                <p className="text-sm">No colors configured yet.</p>
                <p className="text-xs mt-1">Add your first color using the form on the left.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#E8E0D5] rounded-lg">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#FAF8F5]">
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Color</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Name</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Hex Code</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Slug</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Order</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Status</th>
                      <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((c) => (
                      <tr key={c.id} className="hover:bg-black/[0.01]">
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <span
                            className="w-6 h-6 rounded-full inline-block align-middle border border-black/15 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                            style={{ backgroundColor: c.hex_code }}
                            title={c.hex_code}
                          />
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle  text-[#2C241E]">
                          {c.name}
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <code className="text-xs px-2 py-0.5 bg-black/[0.04] rounded font-mono">
                            {c.hex_code}
                          </code>
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">
                          <code className="text-xs bg-black/[0.04] px-1.5 py-0.5 rounded">{c.slug}</code>
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">{c.display_order}</td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <span
                            className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase ${
                              c.is_active ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'
                            }`}
                          >
                            {c.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <button
                            type="button"
                            onClick={() => handleDeleteColor(c.id)}
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
      )}
    </div>
  );
}
