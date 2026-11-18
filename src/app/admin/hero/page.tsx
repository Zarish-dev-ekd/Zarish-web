'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/admin/ImageUpload';
import type { HeroSlide } from '@/lib/types';
import { optimizeCloudinaryUrl } from '@/lib/utils';

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [productsList, setProductsList] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Active Slot being edited: 0 = Banner 1, 1 = Banner 2, 2 = Banner 3, null = none
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  // Form State
  const [slideId, setSlideId] = useState<string | null>(null);
  const [eyebrow, setEyebrow] = useState('MODEST FASHION');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('SHOP NOW');
  const [ctaUrl, setCtaUrl] = useState('/products');
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [overlayText, setOverlayText] = useState('Modesty\nLooks\nBeautiful\nOn You ♡');
  const [campaignBadge, setCampaignBadge] = useState('');
  const [isActive, setIsActive] = useState(true);

  const supabase = createClient();

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const [{ data, error }, { data: prods }, { data: cats }] = await Promise.all([
        supabase
          .from('hero_slides')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('products')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);

      if (error) throw error;
      setSlides(data || []);
      if (prods) setProductsList(prods);
      if (cats) setCategoriesList(cats);
    } catch (err: any) {
      console.error('Error fetching hero slides:', err);
      setError(err?.message || 'Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openSlotEditor = (slotIndex: number) => {
    const existing = slides[slotIndex];
    setEditingSlot(slotIndex);
    setError(null);
    setSuccess(null);

    if (existing) {
      setSlideId(existing.id);
      setEyebrow(existing.eyebrow ?? '');
      setTitle(existing.title || '');
      setSubtitle(existing.subtitle || '');
      setCtaText(existing.cta_text ?? '');
      setCtaUrl(existing.cta_url || '/products');
      setImageUrl(existing.image_url || '');
      setMobileImageUrl(existing.mobile_image_url || '');
      setOverlayText(existing.overlay_text || '');
      setCampaignBadge(existing.campaign_badge || '');
      setIsActive(existing.is_active ?? true);
    } else {
      setSlideId(null);
      setEyebrow(slotIndex === 1 ? 'BACK IN STOCK' : slotIndex === 2 ? 'SIGNATURE EDIT' : 'MODEST FASHION');
      setTitle('');
      setSubtitle('');
      setCtaText('SHOP NOW');
      setCtaUrl('/products');
      setImageUrl('');
      setMobileImageUrl('');
      setOverlayText('');
      setCampaignBadge(slotIndex === 1 ? 'RESTOCKED' : '');
      setIsActive(true);
    }
  };

  const applyRestockPreset = () => {
    setCampaignBadge('RESTOCKED');
    setEyebrow('BACK IN STOCK');
    setCtaText('SHOP NOW');
    if (!title.trim()) {
      setTitle('YOUR FAVOURITES RESTOCKED');
    }
    if (!subtitle.trim()) {
      setSubtitle('Our most-loved styles are back in stock. Grab yours before they sell out again.');
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    setTogglingId(slide.id);
    setError(null);
    try {
      const nextActive = !slide.is_active;
      const { error: updateErr } = await supabase
        .from('hero_slides')
        .update({ is_active: nextActive })
        .eq('id', slide.id);
      if (updateErr) throw updateErr;
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, is_active: nextActive } : s))
      );
      setSuccess(`Banner ${nextActive ? 'turned ON (Live)' : 'turned OFF (Hidden)'}.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to update banner status');
    } finally {
      setTogglingId(null);
    }
  };

  const closeEditor = () => {
    setEditingSlot(null);
    setSlideId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl && !mobileImageUrl) {
      setError('Please upload at least one image (Desktop or Mobile).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const slideData = {
        eyebrow: eyebrow.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        cta_text: ctaText.trim(),
        cta_url: ctaUrl.trim() || '/products',
        image_url: imageUrl || mobileImageUrl,
        mobile_image_url: mobileImageUrl.trim() || null,
        overlay_text: overlayText.trim() || null,
        image_alt: title.trim() ? `${title.trim()} - ZARISH` : `${campaignBadge.trim() || 'Featured'} Banner - ZARISH`,
        campaign_badge: campaignBadge.trim() || null,
        is_active: isActive,
        display_order: editingSlot ?? 0,
      };

      if (slideId) {
        const { error: updateErr } = await supabase
          .from('hero_slides')
          .update(slideData)
          .eq('id', slideId);

        if (updateErr) throw updateErr;
        setSuccess(`Banner ${((editingSlot ?? 0) + 1)} updated successfully!`);
      } else {
        const { error: insertErr } = await supabase
          .from('hero_slides')
          .insert([slideData]);

        if (insertErr) throw insertErr;
        setSuccess(`Banner ${((editingSlot ?? 0) + 1)} added and published!`);
      }

      await fetchSlides();
      closeEditor();
    } catch (err: any) {
      console.error('Error saving banner:', err);
      setError(err?.message || 'Failed to save banner slide');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, slotNum: number) => {
    if (!confirm(`Are you sure you want to delete Banner ${slotNum}?`)) {
      return;
    }

    try {
      setLoading(true);
      const { error: delErr } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;
      setSuccess(`Banner ${slotNum} deleted.`);
      if (editingSlot === slotNum - 1) {
        closeEditor();
      }
      await fetchSlides();
    } catch (err: any) {
      console.error('Error deleting banner:', err);
      setError(err?.message || 'Failed to delete banner');
    } finally {
      setLoading(false);
    }
  };

  const slots = [0, 1, 2]; // 3 banners for desktop and mobile

  return (
    <div>
      {/* ─── Page Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Hero Banner Management (3 Banners)</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Configure up to 3 hero banners for desktop & mobile. Your live storefront auto-slides through all active banners.
          </p>
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

      {/* ─── 3 Banner Slots Overview Grid ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {slots.map((slotIndex) => {
          const slide = slides[slotIndex];
          const isConfigured = !!slide;
          const isCurrentlyEditing = editingSlot === slotIndex;

          return (
            <div
              key={slotIndex}
              className={`rounded-lg p-5 flex flex-col justify-between transition-all ${
                isCurrentlyEditing
                  ? 'border-2 border-[#7B5B3A] bg-[#FAF8F5] shadow-md'
                  : isConfigured
                  ? 'border border-[#E8E0D5] bg-white shadow-sm'
                  : 'border-2 border-dashed border-[#E8E0D5] bg-white'
              }`}
            >
              <div>
                {/* Slot Header */}
                <div className="flex justify-between items-center mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#7B5B3A] text-white text-xs font-bold flex items-center justify-center">
                      {slotIndex + 1}
                    </span>
                    <strong className="text-[15px] text-[#2C241E]">Banner {slotIndex + 1}</strong>
                  </div>

                  {isConfigured && (
                    <button
                      type="button"
                      disabled={togglingId === slide.id}
                      onClick={() => handleToggleActive(slide)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                        slide.is_active
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] hover:bg-[#C8E6C9]'
                          : 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] hover:bg-[#FFCDD2]'
                      }`}
                      title="Click to turn this banner ON or OFF on storefront"
                    >
                      {togglingId === slide.id
                        ? '...'
                        : slide.is_active
                          ? '● ON (Active)'
                          : '○ OFF (Hidden)'}
                    </button>
                  )}
                </div>

                {/* Previews or Empty State */}
                {isConfigured ? (
                  <div>
                    {/* Desktop & Mobile Previews */}
                    <div className="flex gap-2.5 items-center mb-3">
                      <div className="flex-1">
                        <span className="text-[10px] text-[#7A6F66] block mb-0.5">
                          Desktop (16:9)
                        </span>
                        {slide.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={optimizeCloudinaryUrl(slide.image_url, { width: 300 })}
                            alt={slide.title || 'Banner'}
                            className="w-full h-[85px] object-cover rounded border border-[#E8E0D5]"
                          />
                        ) : (
                          <div className="w-full h-[85px] bg-[#f0f0f0] rounded" />
                        )}
                      </div>

                      <div className="w-[60px]">
                        <span className="text-[10px] text-[#7A6F66] block mb-0.5">
                          Mobile (9:16)
                        </span>
                        {slide.mobile_image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={optimizeCloudinaryUrl(slide.mobile_image_url, { width: 140 })}
                            alt={slide.title || 'Banner'}
                            className="w-full h-[85px] object-cover rounded border border-[#E8E0D5]"
                          />
                        ) : (
                          <div className="w-full h-[85px] bg-[#f0f0f0] rounded" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#7A6F66] uppercase tracking-[0.08em]">
                      {slide.eyebrow && <span>{slide.eyebrow}</span>}
                      {slide.campaign_badge && (
                        <span className="px-1.5 py-0.5 rounded bg-[#8B4E5A] text-white text-[9px] font-bold tracking-wider">
                          {slide.campaign_badge}
                        </span>
                      )}
                    </div>
                    <h4 className="m-0 mt-0.5 mb-1 text-base font-bold text-[#2C241E]">
                      {slide.title || '(Image-only graphic banner)'}
                    </h4>
                    <p className="m-0 text-xs text-[#7A6F66] line-clamp-2">
                      {slide.subtitle || 'No subtitle configured.'}
                    </p>
                    {slide.cta_url && (
                      <div className="mt-2 text-[11px] font-mono text-[#7B5B3A] bg-[#FAF6F0] px-2 py-1 rounded border border-[#EFE6DA] truncate">
                        🔗 {slide.cta_text ? `${slide.cta_text} → ` : ''}{slide.cta_url}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-7 px-3 text-center">
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="m-0 text-[13px] text-[#7A6F66]">
                      Banner slot {slotIndex + 1} is currently empty.
                    </p>
                    <span className="text-[11px] text-[#7A6F66]">
                      Upload desktop & mobile images to activate (great for Restock banners).
                    </span>
                  </div>
                )}
              </div>

              {/* Slot Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  className={`flex-1 text-xs py-2 px-3 rounded-md font-medium transition-colors ${
                    isConfigured
                      ? 'bg-[#7B5B3A] text-white hover:bg-[#63472C]'
                      : 'border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0]'
                  }`}
                  onClick={() => openSlotEditor(slotIndex)}
                >
                  {isCurrentlyEditing ? 'Editing...' : isConfigured ? 'Edit Banner' : `+ Add Banner ${slotIndex + 1}`}
                </button>

                {isConfigured && (
                  <button
                    type="button"
                    className="text-xs py-2 px-3 rounded-md font-medium bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] hover:bg-[#FCA5A5] transition-colors"
                    onClick={() => handleDelete(slide.id, slotIndex + 1)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Editor Form for Selected Slot ───────────────────────── */}
      {editingSlot !== null && (
        <div className="bg-white border-2 border-[#7B5B3A] rounded-lg p-6 mb-8 shadow-md">
          <div className="flex justify-between items-center flex-wrap gap-3 mb-5 border-b border-[#E8E0D5] pb-3">
            <h3 className="text-lg font-semibold m-0 text-[#2C241E]">
              {slideId ? `Edit Banner Slot ${editingSlot + 1}` : `Add New Banner in Slot ${editingSlot + 1}`}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={applyRestockPreset}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#8B4E5A] text-white hover:bg-[#733D48] transition-colors cursor-pointer"
              >
                ✨ Use Restock Preset
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
                onClick={closeEditor}
              >
                Close Editor
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Dual Responsive Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Desktop Image */}
              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E8E0D5]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🖥️</span>
                  <div>
                    <strong className="text-sm block text-[#2C241E]">Desktop Banner Image</strong>
                    <span className="text-xs text-[#7A6F66]">
                      Landscape (16:9 or 1920×900)
                    </span>
                  </div>
                </div>
                <ImageUpload
                  label="Upload Desktop Image"
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  folder="zarish/hero"
                  helperText="Primary banner shown on desktop and laptops."
                />
              </div>

              {/* Mobile Image */}
              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E8E0D5]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📱</span>
                  <div>
                    <strong className="text-sm block text-[#2C241E]">Mobile Full-Cover Image</strong>
                    <span className="text-xs text-[#7A6F66]">
                      Portrait (9:16 or 1080×1920)
                    </span>
                  </div>
                </div>
                <ImageUpload
                  label="Upload Mobile Image"
                  value={mobileImageUrl}
                  onChange={(url) => setMobileImageUrl(url)}
                  folder="zarish/hero/mobile"
                  helperText="Dedicated vertical portrait for phones."
                />
              </div>
            </div>

            {/* Banner Text Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Eyebrow Tag</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="MODEST FASHION"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Campaign Badge (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="e.g. RESTOCKED, EXCLUSIVE, or NEW"
                  value={campaignBadge}
                  onChange={(e) => setCampaignBadge(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                Main Heading (Title — Optional)
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="e.g. YOUR FAVOURITES RESTOCKED (leave blank if your image already has text)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span className="text-[11px] text-[#7A6F66] mt-1 block">
                Tip: Leave Title, Eyebrow & Subtitle blank if you uploaded a pre-designed graphic banner that already has text on it.
              </span>
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Subtitle / Description (Optional)</label>
              <textarea
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                rows={2}
                placeholder="Graceful pieces for your everyday and special moments."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Floating Calligraphy Script (Optional)</label>
              <textarea
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                rows={3}
                placeholder={"Modesty\nLooks\nBeautiful\nOn You ♡"}
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
              />
              <span className="text-[11px] text-[#7A6F66] mt-1 block">
                Separate lines with Enter. Appears in natural cursive handwriting at top right.
              </span>
            </div>

            {/* ─── Quick Destination Link Picker (Product / Category / Collection) ─── */}
            <div className="bg-[#FAF8F5] border border-[#E8E0D5] rounded-lg p-4 mb-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <strong className="text-[13px] text-[#2C241E] block">
                    🔗 Where should clicking &ldquo;SHOP NOW&rdquo; go?
                  </strong>
                  <span className="text-[11px] text-[#7A6F66]">
                    Pick any product, category, or collection below to auto-fill the Button Link.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCtaUrl('/products')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white border border-[#E8E0D5] text-[#2C241E] hover:border-[#7B5B3A] cursor-pointer"
                  >
                    Shop All
                  </button>
                  <button
                    type="button"
                    onClick={() => setCtaUrl('/collections/new-arrivals')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white border border-[#E8E0D5] text-[#2C241E] hover:border-[#7B5B3A] cursor-pointer"
                  >
                    New Arrivals
                  </button>
                  <button
                    type="button"
                    onClick={() => setCtaUrl('/products?sale=true')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white border border-[#E8E0D5] text-[#2C241E] hover:border-[#7B5B3A] cursor-pointer"
                  >
                    Sale / Offers
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6F66] uppercase tracking-wider mb-1">
                    Pick a Specific Product (Restocked Dress)
                  </label>
                  <select
                    value={productsList.some((p) => `/products/${p.slug}` === ctaUrl) ? ctaUrl : ''}
                    onChange={(e) => {
                      if (e.target.value) setCtaUrl(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  >
                    <option value="">-- Select a product --</option>
                    {productsList.map((p) => (
                      <option key={p.id} value={`/products/${p.slug}`}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6F66] uppercase tracking-wider mb-1">
                    Or Pick a Category (e.g. Restocked)
                  </label>
                  <select
                    value={categoriesList.some((c) => `/products?category=${c.slug}` === ctaUrl) ? ctaUrl : ''}
                    onChange={(e) => {
                      if (e.target.value) setCtaUrl(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  >
                    <option value="">-- Select a category --</option>
                    {categoriesList.map((c) => (
                      <option key={c.id} value={`/products?category=${c.slug}`}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Button Text</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    placeholder="SHOP NOW (leave blank for full-banner click)"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Button Link (Auto-filled or Custom URL)</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm font-mono border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    placeholder="/products/hit-bird-co-ord-set"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                  />
                </div>
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
                <span>Active & Published on Storefront</span>
              </label>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Saving to Database...' : slideId ? `Update Banner ${editingSlot + 1}` : `Publish Banner ${editingSlot + 1}`}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
                onClick={closeEditor}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
