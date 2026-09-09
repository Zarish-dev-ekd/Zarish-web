'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/admin/ImageUpload';
import type { HeroSlide } from '@/lib/types';

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [eyebrow, setEyebrow] = useState('NEW ARRIVALS');
  const [title, setTitle] = useState('BEAUTY IN MODESTY');
  const [subtitle, setSubtitle] = useState('Graceful silhouettes crafted with timeless elegance for the modern modest woman.');
  const [ctaText, setCtaText] = useState('EXPLORE COLLECTION');
  const [ctaUrl, setCtaUrl] = useState('/collections');
  const [imageUrl, setImageUrl] = useState('');
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

      // If active slide exists, prefill form
      if (data && data.length > 0) {
        const first = data[0];
        setEyebrow(first.eyebrow || 'NEW ARRIVALS');
        setTitle(first.title || '');
        setSubtitle(first.subtitle || '');
        setCtaText(first.cta_text || 'EXPLORE COLLECTION');
        setCtaUrl(first.cta_url || '/collections');
        setImageUrl(first.image_url || '');
        setCampaignBadge(first.campaign_badge || '');
        setIsActive(first.is_active ?? true);
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl) {
      setError('Title and Hero Image are both required');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Upsert or insert hero slide
      const slideData = {
        eyebrow: eyebrow.trim() || 'NEW ARRIVALS',
        title: title.trim(),
        subtitle: subtitle.trim(),
        cta_text: ctaText.trim() || 'EXPLORE COLLECTION',
        cta_url: ctaUrl.trim() || '/collections',
        image_url: imageUrl,
        image_alt: `${title} - ZARISH`,
        campaign_badge: campaignBadge.trim() || null,
        is_active: isActive,
        display_order: 0,
      };

      if (slides.length > 0 && slides[0].id) {
        const { error: updateErr } = await supabase
          .from('hero_slides')
          .update(slideData)
          .eq('id', slides[0].id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('hero_slides')
          .insert([slideData]);

        if (insertErr) throw insertErr;
      }

      setSuccess('Hero banner updated successfully! Check the live storefront.');
      fetchSlides();
    } catch (err: any) {
      console.error('Error saving hero slide:', err);
      setError(err?.message || 'Failed to update hero banner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Hero Banner Management</h2>
          <p className="admin-page-subtitle">
            Customize the main visual banner, campaign titles, and call-to-action on the storefront homepage.
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

      <div style={{ maxWidth: '840px' }}>
        <div className="admin-card">
          <h3 className="admin-card__title">Primary Hero Slide</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <ImageUpload
                label="Hero Image (Cloudinary) *"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                folder="zarish/hero"
                helperText="Upload your real editorial shoot photo or campaign banner."
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Eyebrow Tag</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="NEW ARRIVALS"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Campaign Badge (Optional)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. FESTIVE '25"
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
                rows={3}
                placeholder="Graceful silhouettes crafted with timeless elegance for the modern modest woman."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Button Text</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="EXPLORE COLLECTION"
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

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={submitting}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {submitting ? 'Saving to Supabase...' : 'Save & Publish Hero Banner'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
