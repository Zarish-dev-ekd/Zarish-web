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
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Store & Contact Settings</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Manage contact channels, WhatsApp integration, social handles, and SEO metadata.
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

      <form onSubmit={handleSubmit} className="max-w-[840px]">
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Brand Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Brand Name</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Brand Tagline</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Currency Symbol</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Currency Code</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Direct Contacts & Social Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">WhatsApp Contact Link / Number</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="https://wa.me/919876543210"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <p className="text-xs text-[#7A6F66] mt-1">Visitors clicking WhatsApp will chat with you directly.</p>
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Instagram Profile URL</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="https://instagram.com/zarish_official"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Support Email</label>
              <input
                type="email"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="support@zarish.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Support Phone</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">SEO Search Metadata</h3>
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Default Page Title</label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Default Meta Description</label>
            <textarea
              className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50"
          disabled={submitting || loading}
        >
          {submitting ? 'Updating Settings...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}
