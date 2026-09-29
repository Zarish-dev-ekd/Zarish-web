'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  DEFAULT_SIZE_CHART_ROWS,
  DEFAULT_SIZE_GUIDE_IMAGE,
  getDefaultSizeChartRows,
  saveDefaultSizeChartLocally,
  saveSizeGuideConfigLocally,
} from '@/lib/sizeChart';
import type { Size, ProductColor, SizeMeasurementRow } from '@/lib/types';
import { IconRuler, IconTapeMeasure } from '@/components/icons';
import ImageUpload from '@/components/admin/ImageUpload';

const STANDARD_SIZES = [
  { name: 'XS', slug: 'xs', display_order: 1 },
  { name: 'S', slug: 's', display_order: 2 },
  { name: 'M', slug: 'm', display_order: 3 },
  { name: 'L', slug: 'l', display_order: 4 },
  { name: 'XL', slug: 'xl', display_order: 5 },
  { name: 'XXL', slug: 'xxl', display_order: 6 },
  { name: 'FREE SIZE', slug: 'free-size', display_order: 7 },
];

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

  // Default Size Chart State
  const [defaultChartRows, setDefaultChartRows] = useState<SizeMeasurementRow[]>(DEFAULT_SIZE_CHART_ROWS);
  const [loadingChart, setLoadingChart] = useState(true);
  const [savingChart, setSavingChart] = useState(false);
  const [chartUnit, setChartUnit] = useState<'in' | 'cm'>('in');

  // How to Measure Guide Graphic State
  const [guideImageUrl, setGuideImageUrl] = useState<string>(DEFAULT_SIZE_GUIDE_IMAGE);
  const [guideShowOverlay, setGuideShowOverlay] = useState<boolean>(true);
  const [savingGuideImage, setSavingGuideImage] = useState<boolean>(false);


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

      if (error) throw error;
      setColors(data || []);
    } catch (err: any) {
      console.error('Error fetching colors:', err);
      setError(err?.message || 'Failed to load colors');
    } finally {
      setLoadingColors(false);
    }
  };

  // Fetch Default Size Chart
  const fetchDefaultSizeChart = async () => {
    try {
      setLoadingChart(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('default_size_chart')
        .limit(1)
        .maybeSingle();

      if (data?.default_size_chart && Array.isArray(data.default_size_chart) && data.default_size_chart.length > 0) {
        setDefaultChartRows(data.default_size_chart);
        saveDefaultSizeChartLocally(data.default_size_chart);
      } else {
        const local = getDefaultSizeChartRows();
        setDefaultChartRows(local);
      }
    } catch {
      const local = getDefaultSizeChartRows();
      setDefaultChartRows(local);
    } finally {
      setLoadingChart(false);
    }
  };

  // Fetch Size Guide Model Graphic
  const fetchSizeGuideGraphic = async () => {
    try {
      const res = await fetch('/api/size-guide');
      const data = await res.json();
      if (data?.imageUrl) {
        setGuideImageUrl(data.imageUrl);
        setGuideShowOverlay(data.showOverlay ?? true);
        saveSizeGuideConfigLocally({ imageUrl: data.imageUrl, showOverlay: data.showOverlay ?? true });
      }
    } catch (err) {
      console.warn('Error loading size guide graphic:', err);
    }
  };

  useEffect(() => {
    fetchSizes();
    fetchColors();
    fetchDefaultSizeChart();
    fetchSizeGuideGraphic();
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
        throw new Error('Unable to save color at this moment. Please try again.');
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

  // Size Chart Handlers
  const handleUpdateChartRow = (index: number, field: keyof SizeMeasurementRow, val: any) => {
    const updated = [...defaultChartRows];
    updated[index] = {
      ...updated[index],
      [field]: field === 'size' ? val : parseFloat(val) || 0,
    };
    setDefaultChartRows(updated);
  };

  const handleAddChartRow = () => {
    const nextSize = sizes.find(
      (s) => !defaultChartRows.some((r) => r.size.toUpperCase() === s.name.toUpperCase())
    )?.name || 'Custom';

    setDefaultChartRows([
      ...defaultChartRows,
      {
        size: nextSize,
        bustIn: 32.0,
        lengthIn: 22.0,
        waistIn: 28.0,
        hipsIn: 38.0,
      },
    ]);
  };

  const handleDeleteChartRow = (index: number) => {
    if (defaultChartRows.length <= 1) {
      setError('Size chart must contain at least one size row.');
      return;
    }
    setDefaultChartRows(defaultChartRows.filter((_, i) => i !== index));
  };

  const handleSaveDefaultSizeChart = async () => {
    try {
      setSavingChart(true);
      setError(null);
      setSuccess(null);

      // Save to localStorage immediately for instant client feedback
      saveDefaultSizeChartLocally(defaultChartRows);

      // Try saving to site_settings in Supabase
      const { data: settings } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (settings?.id) {
        await supabase
          .from('site_settings')
          .update({ default_size_chart: defaultChartRows })
          .eq('id', settings.id);
      }

      setSuccess('Default size chart saved successfully! Products using default chart will reflect these measurements.');
    } catch (err: any) {
      // Even if database update had an issue, local storage updated
      console.warn('Database save warning:', err);
      setSuccess('Default size chart updated locally!');
    } finally {
      setSavingChart(false);
    }
  };

  const handleResetFactoryDefaults = () => {
    if (confirm('Reset default size chart back to factory standard values?')) {
      setDefaultChartRows(JSON.parse(JSON.stringify(DEFAULT_SIZE_CHART_ROWS)));
      setSuccess('Reset to factory standard measurements. Remember to click "Save Default Size Chart" to apply.');
    }
  };

  const handleSaveGuideGraphic = async () => {
    try {
      setSavingGuideImage(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/size-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: guideImageUrl,
          showOverlay: guideShowOverlay,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save size guide graphic');
      }

      saveSizeGuideConfigLocally({ imageUrl: guideImageUrl, showOverlay: guideShowOverlay });
      setSuccess('Size guide "How to Measure" illustration updated successfully! Storefront will now display your custom graphic.');
    } catch (err: any) {
      setError(err?.message || 'Failed to save size guide graphic');
    } finally {
      setSavingGuideImage(false);
    }
  };

  const handleResetGuideGraphic = () => {
    if (confirm('Reset the "How to Measure" graphic back to factory default model illustration?')) {
      setGuideImageUrl(DEFAULT_SIZE_GUIDE_IMAGE);
      setGuideShowOverlay(true);
      saveSizeGuideConfigLocally({ imageUrl: DEFAULT_SIZE_GUIDE_IMAGE, showOverlay: true });
      fetch('/api/size-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: DEFAULT_SIZE_GUIDE_IMAGE,
          showOverlay: true,
        }),
      }).catch(console.error);
      setSuccess('Reset back to factory default illustration. Click "Save Guide Graphic" to apply permanently.');
    }
  };

  const handleDeleteColor = async (id: string) => {
    if (!confirm('Are you sure you want to remove this color?')) return;

    try {
      const { error: delErr } = await supabase.from('colors').delete().eq('id', id);
      if (delErr) throw delErr;
      setColors(colors.filter((c) => c.id !== id));
      setSuccess('Color removed successfully');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete color');
    }
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

      {/* ─── GLOBAL DEFAULT SIZE CHART MANAGEMENT SECTION ─── */}
      <div className="mt-12 pt-8 border-t border-[#E8E0D5]">
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D5]/80 pb-5 mb-6">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-xl bg-[#FAF6F0] border border-[#E2D5C7] flex items-center justify-center text-[#7B5B3A] shadow-xs">
                <IconRuler size={22} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg font-serif font-bold text-[#2C1D13] tracking-wide m-0">
                    Store-Wide Default Size Chart
                  </h3>
                  <span className="text-[11px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF6F0] text-[#7B5B3A] border border-[#E2D5C7]">
                    Used by 95% of Products
                  </span>
                </div>
                <p className="text-xs text-[#7A6F66] mt-1 m-0">
                  This standard size chart applies automatically to all products unless a custom variation is specified in the product editor.
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              {/* Unit Toggle */}
              <div className="inline-flex items-center bg-[#F4EFEA] p-0.5 rounded-full border border-[#E2D5C7]">
                <button
                  type="button"
                  onClick={() => setChartUnit('in')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    chartUnit === 'in'
                      ? 'bg-[#2C1D13] text-white shadow-xs'
                      : 'text-[#7A6F66] hover:text-[#2C1D13]'
                  }`}
                >
                  in
                </button>
                <button
                  type="button"
                  onClick={() => setChartUnit('cm')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    chartUnit === 'cm'
                      ? 'bg-[#2C1D13] text-white shadow-xs'
                      : 'text-[#7A6F66] hover:text-[#2C1D13]'
                  }`}
                >
                  cm
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetFactoryDefaults}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#E8E0D5] bg-[#FAF8F5] text-[#7A6F66] hover:text-[#2C1D13] hover:bg-[#F2ECE4] hover:border-[#D6CEC5] transition-all cursor-pointer"
              >
                Reset Defaults
              </button>

              <button
                type="button"
                disabled={savingChart}
                onClick={handleSaveDefaultSizeChart}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#2C1D13] text-white hover:bg-[#422C1D] active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {savingChart ? 'Saving...' : 'Save Size Chart'}
              </button>
            </div>
          </div>

          {loadingChart ? (
            <div className="p-8 text-center text-xs text-[#7A6F66]">
              <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block mb-2" />
              <p>Loading default size chart...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-[#E8E0D5] rounded-xl shadow-2xs">
                <table className="w-full border-collapse text-left text-sm min-w-[700px]">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#E8E0D5]">
                      <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-[0.06em] text-[#6E6259] w-32">
                        Size
                      </th>
                      <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-[0.06em] text-[#6E6259]">
                        Bust ({chartUnit === 'in' ? 'in' : 'cm'})
                      </th>
                      <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-[0.06em] text-[#6E6259]">
                        Front Length ({chartUnit === 'in' ? 'in' : 'cm'})
                      </th>
                      <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-[0.06em] text-[#6E6259]">
                        Waist ({chartUnit === 'in' ? 'in' : 'cm'})
                      </th>
                      <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-[0.06em] text-[#6E6259]">
                        Hips ({chartUnit === 'in' ? 'in' : 'cm'})
                      </th>
                      <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-[0.06em] text-[#6E6259] text-right w-24">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9E1]">
                    {defaultChartRows.map((row, idx) => {
                      const displayBust = chartUnit === 'cm' ? (row.bustIn * 2.54).toFixed(1) : row.bustIn;
                      const displayLength = chartUnit === 'cm' ? (row.lengthIn * 2.54).toFixed(1) : row.lengthIn;
                      const displayWaist = row.waistIn ? (chartUnit === 'cm' ? (row.waistIn * 2.54).toFixed(1) : row.waistIn) : '';
                      const displayHips = row.hipsIn ? (chartUnit === 'cm' ? (row.hipsIn * 2.54).toFixed(1) : row.hipsIn) : '';

                      return (
                        <tr key={idx} className="hover:bg-[#FAF6F0]/60 transition-colors">
                          <td className="px-4 py-3 align-middle">
                            <input
                              type="text"
                              value={row.size}
                              onChange={(e) => handleUpdateChartRow(idx, 'size', e.target.value)}
                              className="w-24 h-9 px-3 text-xs font-bold text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs"
                              placeholder="e.g. S"
                            />
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.5"
                                value={row.bustIn}
                                onChange={(e) => handleUpdateChartRow(idx, 'bustIn', e.target.value)}
                                className="w-24 h-9 px-3 text-xs font-mono font-medium text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              {chartUnit === 'cm' && (
                                <span className="text-[11px] text-[#7A6F66] font-mono whitespace-nowrap">
                                  ({displayBust}cm)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.5"
                                value={row.lengthIn}
                                onChange={(e) => handleUpdateChartRow(idx, 'lengthIn', e.target.value)}
                                className="w-24 h-9 px-3 text-xs font-mono font-medium text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              {chartUnit === 'cm' && (
                                <span className="text-[11px] text-[#7A6F66] font-mono whitespace-nowrap">
                                  ({displayLength}cm)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.5"
                                value={row.waistIn ?? ''}
                                placeholder="Opt"
                                onChange={(e) => handleUpdateChartRow(idx, 'waistIn', e.target.value)}
                                className="w-24 h-9 px-3 text-xs font-mono font-medium text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              {chartUnit === 'cm' && row.waistIn && (
                                <span className="text-[11px] text-[#7A6F66] font-mono whitespace-nowrap">
                                  ({displayWaist}cm)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.5"
                                value={row.hipsIn ?? ''}
                                placeholder="Opt"
                                onChange={(e) => handleUpdateChartRow(idx, 'hipsIn', e.target.value)}
                                className="w-24 h-9 px-3 text-xs font-mono font-medium text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              {chartUnit === 'cm' && row.hipsIn && (
                                <span className="text-[11px] text-[#7A6F66] font-mono whitespace-nowrap">
                                  ({displayHips}cm)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right align-middle">
                            <button
                              type="button"
                              onClick={() => handleDeleteChartRow(idx)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#9E3E3E] bg-[#FDF2F2] border border-[#F8D7D7] hover:bg-[#FDE8E8] hover:text-[#B91C1C] transition-all cursor-pointer active:scale-95"
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

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddChartRow}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#7B5B3A] bg-white text-[#7B5B3A] hover:bg-[#FAF6F0] text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <span>+ Add Size Row to Default Chart</span>
                </button>

                <p className="text-xs text-[#7A6F66] m-0">
                  * Values are configured in inches (in) and automatically converted to cm for customers in storefront modals.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── HOW TO MEASURE GUIDE GRAPHIC MANAGEMENT SECTION ─── */}
      <div className="mt-8">
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D5]/80 pb-5 mb-6">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-xl bg-[#FAF6F0] border border-[#E2D5C7] flex items-center justify-center text-[#7B5B3A] shadow-xs">
                <IconTapeMeasure size={22} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg font-serif font-bold text-[#2C1D13] tracking-wide m-0">
                    &quot;How to Measure&quot; Guide Illustration
                  </h3>
                  <span className="text-[11px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF6F0] text-[#7B5B3A] border border-[#E2D5C7]">
                    Size &amp; Fit Modal Graphic
                  </span>
                </div>
                <p className="text-xs text-[#7A6F66] mt-1 m-0">
                  Update the model figure or measuring diagram shown to customers in the &quot;How to Measure&quot; tab of the Size Guide modal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetGuideGraphic}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#E8E0D5] bg-[#FAF8F5] text-[#7A6F66] hover:text-[#2C1D13] hover:bg-[#F2ECE4] hover:border-[#D6CEC5] transition-all cursor-pointer"
              >
                Reset Default Model
              </button>

              <button
                type="button"
                disabled={savingGuideImage}
                onClick={handleSaveGuideGraphic}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#2C1D13] text-white hover:bg-[#422C1D] active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {savingGuideImage ? 'Saving...' : 'Save Guide Graphic'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Graphic Upload & Settings Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1D13] mb-2">
                  Upload New Model / Measurement Illustration
                </label>
                <ImageUpload
                  value={guideImageUrl}
                  onChange={(url) => setGuideImageUrl(url)}
                  folder="zarish-size-guide"
                  label="Upload Guide Image"
                  helperText="Recommended: High-resolution PNG or JPG with clean or white background. Portrait orientation (e.g. 600x900px)."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C241E] mb-1.5">
                  Direct Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={guideImageUrl}
                  onChange={(e) => setGuideImageUrl(e.target.value)}
                  placeholder="https://... or /size-guide-model.jpg"
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs"
                />
                <p className="text-[11px] text-[#7A6F66] mt-1">
                  You can upload a file above directly to Cloudinary, or paste any image URL here.
                </p>
              </div>
            </div>

            {/* Right: Live Storefront Preview Box */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B5B3A] mb-2 self-start">
                Storefront Modal Live Preview (Image Only)
              </span>
              <div className="relative w-full max-w-[280px] h-[380px] bg-white rounded-2xl border-2 border-[#E8E0D5] p-3 shadow-sm overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guideImageUrl || '/size-guide-model.jpg'}
                    alt="Guide Preview"
                    className="w-full h-full object-contain object-center"
                  />
                </div>
              </div>
              <span className="text-[11px] text-[#7A6F66] mt-2">
                {guideImageUrl === '/size-guide-model.jpg' ? 'Using factory default illustration' : 'Using custom uploaded illustration'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

