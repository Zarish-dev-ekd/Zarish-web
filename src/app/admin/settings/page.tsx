'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { SiteSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settingId, setSettingId] = useState<string | null>(null);

  // Form State
  const [siteName, setSiteName] = useState('ZARISH');
  const [tagline, setTagline] = useState('Beauty in Modesty');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [metaTitle, setMetaTitle] = useState('ZARISH by Nehala Mufeed | Premium Modest Fashion');
  const [metaDescription, setMetaDescription] = useState('Discover elegant modest fashion by ZARISH.');

  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettingId(data.id);
          setSiteName(data.site_name || 'ZARISH');
          setTagline(data.tagline || '');
          setContactEmail(data.contact_email || '');
          setContactPhone(data.contact_phone || '');
          setAddress(data.address || '');
          setWhatsapp(data.social_whatsapp || '');
          setInstagram(data.social_instagram || '');
          setFacebook(data.social_facebook || '');
          setCurrencySymbol(data.currency_symbol || '₹');
          setCurrencyCode(data.currency_code || 'INR');
          setMetaTitle(data.meta_title || '');
          setMetaDescription(data.meta_description || '');
        }
      } catch (err: any) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        site_name: siteName.trim(),
        tagline: tagline.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        address: address.trim(),
        social_whatsapp: whatsapp.trim(),
        social_instagram: instagram.trim(),
        social_facebook: facebook.trim(),
        currency_symbol: currencySymbol.trim(),
        currency_code: currencyCode.trim(),
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        updated_at: new Date().toISOString(),
      };

      if (settingId) {
        const { error: updateErr } = await supabase
          .from('site_settings')
          .update(payload)
          .eq('id', settingId);

        if (updateErr) throw updateErr;
      } else {
        const { data: newSetting, error: insertErr } = await supabase
          .from('site_settings')
          .insert([payload])
          .select()
          .single();

        if (insertErr) throw insertErr;
        if (newSetting) setSettingId(newSetting.id);
      }

      setSuccess('Settings saved successfully! Footer and metadata updated.');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err?.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Store & Contact Settings</h2>
          <p className="admin-page-subtitle">
            Manage contact channels, WhatsApp integration, social handles, and SEO metadata.
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

      <form onSubmit={handleSubmit} style={{ maxWidth: '840px' }}>
        <div className="admin-card">
          <h3 className="admin-card__title">Brand Identity</h3>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Brand Name</label>
              <input
                type="text"
                className="admin-input"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Brand Tagline</label>
              <input
                type="text"
                className="admin-input"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Currency Symbol</label>
              <input
                type="text"
                className="admin-input"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Currency Code</label>
              <input
                type="text"
                className="admin-input"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="admin-card__title">Direct Contacts & Social Channels</h3>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">WhatsApp Contact Link / Number</label>
              <input
                type="text"
                className="admin-input"
                placeholder="https://wa.me/919876543210"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <p className="admin-helper-text">Visitors clicking WhatsApp will chat with you directly.</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Instagram Profile URL</label>
              <input
                type="text"
                className="admin-input"
                placeholder="https://instagram.com/zarish_official"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Support Email</label>
              <input
                type="email"
                className="admin-input"
                placeholder="support@zarish.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Support Phone</label>
              <input
                type="text"
                className="admin-input"
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="admin-card__title">SEO Search Metadata</h3>
          <div className="admin-form-group">
            <label className="admin-label">Default Page Title</label>
            <input
              type="text"
              className="admin-input"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Default Meta Description</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={submitting || loading}
          style={{ width: '100%', padding: '14px' }}
        >
          {submitting ? 'Updating Settings...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}
