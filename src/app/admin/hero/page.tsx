'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/admin/ImageUpload';
import type { HeroSlide } from '@/lib/types';
import { optimizeCloudinaryUrl } from '@/lib/utils';

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Active Slot being edited: 0 = Banner 1, 1 = Banner 2, 2 = Banner 3, null = none
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  // Form State
  const [slideId, setSlideId] = useState<string | null>(null);
  const [eyebrow, setEyebrow] = useState('MODEST FASHION');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('SHOP NEW ARRIVALS');
  const [ctaUrl, setCtaUrl] = useState('/collections');
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [overlayText, setOverlayText] = useState('Modesty\nLooks\nBeautiful\nOn You ♡');
  const [campaignBadge, setCampaignBadge] = useState('');
  const [isActive, setIsActive] = useState(true);

  const supabase = createClient();

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
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
      setEyebrow(existing.eyebrow || 'MODEST FASHION');
      setTitle(existing.title || '');
      setSubtitle(existing.subtitle || '');
      setCtaText(existing.cta_text || 'SHOP NEW ARRIVALS');
      setCtaUrl(existing.cta_url || '/collections');
      setImageUrl(existing.image_url || '');
      setMobileImageUrl(existing.mobile_image_url || '');
      setOverlayText(existing.overlay_text || 'Modesty\nLooks\nBeautiful\nOn You ♡');
      setCampaignBadge(existing.campaign_badge || '');
      setIsActive(existing.is_active ?? true);
    } else {
      setSlideId(null);
      setEyebrow(slotIndex === 1 ? 'NEW ARRIVALS' : slotIndex === 2 ? 'SIGNATURE EDIT' : 'MODEST FASHION');
      setTitle('');
      setSubtitle('');
      setCtaText('EXPLORE COLLECTION');
      setCtaUrl('/collections');
      setImageUrl('');
      setMobileImageUrl('');
      setOverlayText('Grace\nIn Every\nThread ♡');
      setCampaignBadge('');
      setIsActive(true);
    }
  };

  const closeEditor = () => {
    setEditingSlot(null);
    setSlideId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a banner title.');
      return;
    }
    if (!imageUrl && !mobileImageUrl) {
      setError('Please upload at least one image (Desktop or Mobile).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const slideData = {
        eyebrow: eyebrow.trim() || 'MODEST FASHION',
        title: title.trim(),
        subtitle: subtitle.trim(),
        cta_text: ctaText.trim() || 'SHOP NEW ARRIVALS',
        cta_url: ctaUrl.trim() || '/collections',
        image_url: imageUrl || mobileImageUrl,
        mobile_image_url: mobileImageUrl.trim() || null,
        overlay_text: overlayText.trim() || null,
        image_alt: `${title} - ZARISH`,
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
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Hero Banner Management (3 Banners)</h2>
          <p className="admin-page-subtitle">
            Configure up to 3 hero banners for desktop & mobile. Your live storefront auto-slides through all active banners.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="admin-card" style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', marginBottom: '16px' }}>
          {success}
        </div>
      )}

      {/* ─── 3 Banner Slots Overview Grid ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {slots.map((slotIndex) => {
          const slide = slides[slotIndex];
          const isConfigured = !!slide;
          const isCurrentlyEditing = editingSlot === slotIndex;

          return (
            <div
              key={slotIndex}
              className="admin-card"
              style={{
                border: isCurrentlyEditing
                  ? '2px solid var(--admin-primary)'
                  : isConfigured
                  ? '1px solid var(--admin-border)'
                  : '2px dashed var(--admin-border)',
                background: isCurrentlyEditing ? '#FAF8F5' : '#FFFFFF',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Slot Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--admin-primary)',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {slotIndex + 1}
                    </span>
                    <strong style={{ fontSize: '15px' }}>Banner {slotIndex + 1}</strong>
                  </div>

                  {isConfigured && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        background: slide.is_active ? '#E8F5E9' : '#FFEBEE',
                        color: slide.is_active ? '#2E7D32' : '#C62828',
                      }}
                    >
                      {slide.is_active ? 'Active' : 'Draft'}
                    </span>
                  )}
                </div>

                {/* Previews or Empty State */}
                {isConfigured ? (
                  <div>
                    {/* Desktop & Mobile Previews */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '10px', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '2px' }}>
                          Desktop (16:9)
                        </span>
                        {slide.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={optimizeCloudinaryUrl(slide.image_url, { width: 300 })}
                            alt={slide.title}
                            style={{ width: '100%', height: '85px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--admin-border)' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '85px', background: '#f0f0f0', borderRadius: '4px' }} />
                        )}
                      </div>

                      <div style={{ width: '60px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '2px' }}>
                          Mobile (9:16)
                        </span>
                        {slide.mobile_image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={optimizeCloudinaryUrl(slide.mobile_image_url, { width: 140 })}
                            alt={slide.title}
                            style={{ width: '100%', height: '85px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--admin-border)' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '85px', background: '#f0f0f0', borderRadius: '4px' }} />
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {slide.eyebrow || 'MODEST FASHION'}
                    </div>
                    <h4 style={{ margin: '2px 0 6px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--admin-text)' }}>
                      {slide.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--admin-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {slide.subtitle || 'No subtitle configured.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '28px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🖼️</div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--admin-text-muted)' }}>
                      Banner slot {slotIndex + 1} is currently empty.
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                      Upload desktop & mobile images to activate.
                    </span>
                  </div>
                )}
              </div>

              {/* Slot Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--admin-border)' }}>
                <button
                  type="button"
                  className={isConfigured ? 'admin-btn admin-btn--primary' : 'admin-btn admin-btn--secondary'}
                  onClick={() => openSlotEditor(slotIndex)}
                  style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
                >
                  {isCurrentlyEditing ? 'Editing...' : isConfigured ? 'Edit Banner' : `+ Add Banner ${slotIndex + 1}`}
                </button>

                {isConfigured && (
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    onClick={() => handleDelete(slide.id, slotIndex + 1)}
                    style={{ fontSize: '12px', padding: '8px 12px', background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2' }}
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
        <div className="admin-card" style={{ border: '2px solid var(--admin-primary)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
            <h3 className="admin-card__title" style={{ margin: 0 }}>
              {slideId ? `Edit Banner Slot ${editingSlot + 1}` : `Add New Banner in Slot ${editingSlot + 1}`}
            </h3>
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={closeEditor}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Close Editor
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Dual Responsive Image Uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Desktop Image */}
              <div style={{ background: '#FAF8F5', padding: '18px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🖥️</span>
                  <div>
                    <strong style={{ fontSize: '14px', display: 'block' }}>Desktop Banner Image</strong>
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
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
              <div style={{ background: '#FAF8F5', padding: '18px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>📱</span>
                  <div>
                    <strong style={{ fontSize: '14px', display: 'block' }}>Mobile Full-Cover Image</strong>
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
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
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Eyebrow Tag</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="MODEST FASHION"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Campaign Badge (Optional)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. EXCLUSIVE or NEW"
                  value={campaignBadge}
                  onChange={(e) => setCampaignBadge(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Main Heading (Title) *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="BEAUTY IN MODESTY"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Subtitle / Description</label>
              <textarea
                className="admin-textarea"
                rows={2}
                placeholder="Graceful pieces for your everyday and special moments."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Floating Calligraphy Script (Top Right)</label>
              <textarea
                className="admin-textarea"
                rows={3}
                placeholder={"Modesty\nLooks\nBeautiful\nOn You ♡"}
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                Separate lines with Enter. Appears in natural cursive handwriting at top right.
              </span>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Button Text</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="SHOP NEW ARRIVALS"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Button Link</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="/collections"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
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
                <span>Active & Published on Storefront</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={submitting}
                style={{ flex: 1, padding: '12px' }}
              >
                {submitting ? 'Saving to Database...' : slideId ? `Update Banner ${editingSlot + 1}` : `Publish Banner ${editingSlot + 1}`}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={closeEditor}
                disabled={submitting}
                style={{ padding: '12px 24px' }}
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
