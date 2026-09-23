'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import type { BrandStoryData } from '@/lib/types';

const DEFAULT_IMAGE = '/zarish-brand-card.webp';
const DEFAULT_HEADING = 'Dear Zarish Family,';
const DEFAULT_EYEBROW = 'A NOTE FROM OUR FOUNDER';
const DEFAULT_PARAGRAPHS = [
  'Zarish started as a small dream my husband and I shared. While building it, we were also learning to be parents, and our little girl was growing alongside us. There were days we wished we could give her more of our time, but she quietly waited, adjusted, and grew with us. Looking back, I realise she didn’t just grow up alongside Zarish—she grew up with it.',
  'I’m forever grateful to my husband for being my strength through every high and low, believing in me when I doubted myself, and always encouraging me to keep going. And to our Zarish family, thank you for being part of this journey. Every order, kind message, share, recommendation, and every person who believed in us has meant more than you know.',
  'We started Zarish with a dream, and today, we carry it with gratitude. Every order reminds us that something we built with love has found a place in someone else’s life. As we continue to grow, we’re grateful to have you with us. Thank you for being a part of our Zarish story.',
];
const DEFAULT_SIGN_OFF = 'With love,';
const DEFAULT_FOUNDER_NAME = 'Nehala Mufeed';
const DEFAULT_FOUNDER_ROLE = 'Founder, Zarish';
const DEFAULT_CTA_TEXT = 'Shop now';
const DEFAULT_CTA_URL = '/products';

export default function AdminBrandStoryPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [isActive, setIsActive] = useState(true);
  const [eyebrow, setEyebrow] = useState(DEFAULT_EYEBROW);
  const [heading, setHeading] = useState(DEFAULT_HEADING);
  const [paragraphsText, setParagraphsText] = useState(DEFAULT_PARAGRAPHS.join('\n\n'));
  const [signOff, setSignOff] = useState(DEFAULT_SIGN_OFF);
  const [founderName, setFounderName] = useState(DEFAULT_FOUNDER_NAME);
  const [founderRole, setFounderRole] = useState(DEFAULT_FOUNDER_ROLE);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [imageAlt, setImageAlt] = useState('ZARISH by Nehala Mufeed');
  const [ctaText, setCtaText] = useState(DEFAULT_CTA_TEXT);
  const [ctaUrl, setCtaUrl] = useState(DEFAULT_CTA_URL);

  useEffect(() => {
    async function loadStory() {
      try {
        setLoading(true);
        const res = await fetch('/api/brand-story');
        const json = await res.json();

        if (json?.story) {
          const s = json.story as BrandStoryData;
          setIsActive(s.is_active ?? true);
          setEyebrow(s.eyebrow || DEFAULT_EYEBROW);
          setHeading(s.heading || s.title || DEFAULT_HEADING);
          if (s.paragraphs && Array.isArray(s.paragraphs) && s.paragraphs.length > 0) {
            setParagraphsText(s.paragraphs.join('\n\n'));
          } else if (s.description) {
            setParagraphsText(s.description);
          }
          setSignOff(s.sign_off || DEFAULT_SIGN_OFF);
          setFounderName(s.founder_name || DEFAULT_FOUNDER_NAME);
          setFounderRole(s.founder_role || DEFAULT_FOUNDER_ROLE);
          setImageUrl(s.image_url || DEFAULT_IMAGE);
          setImageAlt(s.image_alt || 'ZARISH by Nehala Mufeed');
          setCtaText(s.cta_text || DEFAULT_CTA_TEXT);
          setCtaUrl(s.cta_url || DEFAULT_CTA_URL);
        }
      } catch (err: any) {
        console.error('Failed to load story:', err);
        setError('Failed to load current story configuration.');
      } finally {
        setLoading(false);
      }
    }
    loadStory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Split paragraphs by empty lines
      const splitParas = paragraphsText
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        is_active: isActive,
        eyebrow: eyebrow.trim(),
        heading: heading.trim(),
        title: heading.trim(),
        paragraphs: splitParas,
        description: paragraphsText.trim(),
        sign_off: signOff.trim(),
        founder_name: founderName.trim(),
        founder_role: founderRole.trim(),
        image_url: imageUrl.trim() || DEFAULT_IMAGE,
        image_alt: imageAlt.trim(),
        cta_text: ctaText.trim(),
        cta_url: ctaUrl.trim(),
      };

      const res = await fetch('/api/brand-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update brand story.');
      }

      setSuccess('Brand story updated successfully! Changes are live on the homepage and about page.');
    } catch (err: any) {
      console.error('Error saving brand story:', err);
      setError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetToDefaultImage = () => {
    setImageUrl(DEFAULT_IMAGE);
    setImageAlt('ZARISH by Nehala Mufeed');
  };

  const previewParas = paragraphsText
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#7B5B3A]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-[28px] text-[#2C241E] m-0 font-bold">
              Brand Story & Founder&apos;s Note
            </h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isActive ? 'Live on Storefront' : 'Hidden'}
            </span>
          </div>
          <p className="text-sm text-[#7A6F66] mt-1.5 mb-0">
            Manage the luxury card image, founder letter, and signature displayed at the bottom of
            the homepage and on the About Us page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#brand-story"
            target="_blank"
            className="px-4 py-2 text-xs font-semibold text-[#7B5B3A] bg-[#FAF4ED] border border-[#E8DFC8] rounded-md hover:bg-[#F2E7DC] transition-colors"
          >
            View on Homepage ↗
          </Link>
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

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section Visibility */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-3">Section Visibility</h2>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#7B5B3A] rounded border-[#E8E0D5] focus:ring-[#7B5B3A]"
                />
                <span className="text-sm text-[#2C241E] font-medium">
                  Display Brand Story Section on Storefront
                </span>
              </label>
              <p className="text-xs text-[#8C7B6B] mt-2 mb-0">
                When unchecked, the section is completely hidden from both the homepage and About Us
                page.
              </p>
            </div>

            {/* Left Card Image Section */}
            {/* Left Card Image Section */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 max-sm:flex-col max-sm:items-start max-sm:gap-2">
                <div>
                  <h2 className="text-base font-semibold text-[#2C241E] m-0">
                    Luxury Card Image (Left Side)
                  </h2>
                  <p className="text-xs text-[#8C7B6B] mt-1 mb-0">
                    Square card (1:1 ratio) displayed alongside the founder&apos;s letter on Homepage and About page.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('/zarish-luxury-card.webp');
                      setImageAlt('ZARISH by Nehala Mufeed');
                    }}
                    className="text-xs px-2.5 py-1 rounded bg-[#F8F5F0] hover:bg-[#EADCCB] text-[#7B5B3A] font-semibold border border-[#EADCCB] transition-colors"
                  >
                    ✨ Use Luxury Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('/zarish-brand-card-minimal.webp');
                      setImageAlt('ZARISH by Nehala Mufeed');
                    }}
                    className="text-xs px-2.5 py-1 rounded bg-[#F8F5F0] hover:bg-[#EADCCB] text-[#7B5B3A] font-semibold border border-[#EADCCB] transition-colors"
                  >
                    🌿 Minimal Card
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-5 max-sm:flex-col">
                {/* Image Thumbnail Preview (Safely handles empty string) */}
                <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-[#EADCCB] flex-shrink-0 bg-[#F6EDDC] shadow-sm flex items-center justify-center">
                  {imageUrl && imageUrl.trim() !== '' ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imageUrl}
                      alt={imageAlt || 'Brand Card Preview'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-[#8C7B6B]">
                      <svg className="w-8 h-8 mx-auto text-[#C8A774] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[11px] font-medium block">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-4">
                  {/* File Upload Component */}
                  <ImageUpload
                    value={imageUrl}
                    onChange={(url) => setImageUrl(url || '')}
                    folder="zarish-brand"
                    label="Upload New Picture (JPG/PNG/WEBP)"
                    helperText="Square 1000x1000px recommended. Automatically uploaded and optimized."
                  />

                  {/* Manual URL Input Option */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                      Or Image URL / Path
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="/zarish-luxury-card.webp or https://res.cloudinary.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                      Image Alt Text (for SEO & Accessibility)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="ZARISH by Nehala Mufeed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Letter Content */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">
                Founder&apos;s Letter Content
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Eyebrow (Small Tag Above Heading)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    value={eyebrow}
                    onChange={(e) => setEyebrow(e.target.value)}
                    placeholder="A NOTE FROM OUR FOUNDER"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Letter Salutation / Heading
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="Dear Zarish Family,"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#2C241E]">
                      Letter Story Paragraphs
                    </label>
                    <span className="text-[11px] text-[#8C7B6B]">
                      Separate paragraphs with double Enter (blank line)
                    </span>
                  </div>
                  <textarea
                    rows={10}
                    className="w-full px-3 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A] font-sans leading-relaxed"
                    value={paragraphsText}
                    onChange={(e) => setParagraphsText(e.target.value)}
                    placeholder="Write the founder's letter here..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Signature & Sign-Off */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">
                Signature & Attribution
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Sign-Off
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    value={signOff}
                    onChange={(e) => setSignOff(e.target.value)}
                    placeholder="With love,"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Founder Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    placeholder="Nehala Mufeed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Founder Role
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    value={founderRole}
                    onChange={(e) => setFounderRole(e.target.value)}
                    placeholder="Founder, Zarish"
                  />
                </div>
              </div>
            </div>

            {/* Call to Action Button */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">
                Call to Action Button
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Shop now"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="/products"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-[#7B5B3A] text-white text-sm font-semibold rounded-lg hover:bg-[#62462B] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Saving Changes...' : 'Save & Publish Changes'}
              </button>
            </div>
          </div>

          {/* Right Column: Live Storefront Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="bg-[#2B2118] text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E5DACF]">
                  Live Storefront Preview
                </span>
                <span className="text-[10px] text-white/60">Updates in real-time</span>
              </div>

              <div className="bg-white border border-[#E8E0D5] border-t-0 rounded-b-xl p-5 shadow-md">
                <div className="flex flex-col gap-6">
                  {/* Preview Card */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md border border-[#EADCCB] bg-[#F6EDDC] flex items-center justify-center">
                    {imageUrl && imageUrl.trim() !== '' ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageUrl}
                        alt={imageAlt || 'Storefront Preview'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 text-[#8C7B6B]">
                        <span className="text-sm font-medium text-[#7B5B3A] block">No Image Selected</span>
                        <span className="text-xs text-[#A39281] mt-1 block">Upload an image or pick a preset</span>
                      </div>
                    )}
                  </div>

                  {/* Preview Text */}
                  <div>
                    {eyebrow && (
                      <span className="text-[10px] tracking-[0.2em] uppercase text-[#7B5B3A] font-semibold block mb-2">
                        {eyebrow}
                      </span>
                    )}

                    <h3 className="font-display text-xl font-bold text-[#2C1D13] tracking-tight mb-3">
                      {heading || 'Dear Zarish Family,'}
                    </h3>

                    <div className="space-y-3 text-xs leading-relaxed text-[#5C4A3E] max-h-60 overflow-y-auto pr-1">
                      {previewParas.map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F0E6DC]">
                      <p className="font-serif italic text-xs text-[#7B5B3A]">
                        {signOff || 'With love,'}
                      </p>
                      <p className="font-display text-sm font-bold text-[#2C1D13] mt-0.5">
                        {founderName || 'Nehala Mufeed'}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8C7B6B] font-semibold mt-0.5">
                        {founderRole || 'Founder, Zarish'}
                      </p>
                    </div>

                    {ctaText && (
                      <div className="mt-4">
                        <span className="inline-block px-5 py-2 bg-[#2C1D13] text-white text-[11px] font-medium uppercase tracking-wider rounded-lg">
                          {ctaText}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
