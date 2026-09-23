import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings, getAnnouncements, getNavigationItems } from '@/lib/supabase';
import { getPolicy } from '@/lib/policies';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Refund & Return Policy | ZARISH by Nehala Mufeed',
  description: 'Detailed Refund and Return Policy of ZARISH. Learn about our unboxing verification and timeline.',
};

export const revalidate = 0; // Fresh policy on load
export const dynamic = 'force-dynamic';

export default async function RefundPolicyPage() {
  const [settings, announcements, navigationItems, policy] = await Promise.all([
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
    getPolicy('refund-policy'),
  ]);

  const eyebrow = policy?.eyebrow || 'Customer Assurance & Guidelines';
  const title = policy?.title || 'Refund & Return Policy';
  const lastUpdated =
    policy?.last_updated || 'Last updated: September 2026 • Valid for all online purchases on zarish.in';

  const highlightBox = policy?.highlight_box || {
    title: 'Mandatory Unboxing Video Requirement',
    main_rule: 'Refunds are applicable only for damaged or defective products received by the customer.',
    detail:
      'To claim a refund, you must contact our official WhatsApp support (+91 9562292945) within 24 to 48 hours of delivery with a complete, uncut unboxing video (recorded continuously from start to end without pauses or cuts, showing the sealed courier package being opened and the defect clearly inspected). Requests raised after 48 hours of delivery cannot be entertained.',
  };

  const section1 = policy?.section1 || {
    heading: '1. Return & Refund Criteria',
    intro: 'A return or refund is accepted strictly under the following conditions:',
    points: [
      'The item received has physical transit damage, tears, or factory manufacturing defects.',
      'An incorrect product, size, or color was delivered compared to your confirmed order details.',
      'The garment must remain unwashed, unworn, unironed, with all original brand tags, embroidery guards, and packaging intact.',
    ],
  };

  const section2 = policy?.section2 || {
    heading: '2. Non-Returnable Items',
    intro: 'In accordance with modest fashion hygiene standards and custom artistry:',
    points: [
      'Custom-tailored, bespoke altered, or personalized garments made to custom measurements.',
      'Hijabs, under-caps, and inner slips once removed from sealed packaging.',
      'Items bought during clearance sales or archive warehouse discount events.',
      'Products without an authentic, continuous unboxing video.',
    ],
  };

  const section4 = policy?.section4 || {
    heading: '3. How to Initiate a Refund Request',
    intro: 'Send your order reference number and unboxing video directly to our support team:',
    whatsapp: settings?.social_whatsapp || '+91 9562292945',
    email: settings?.contact_email || 'zarish2025co@gmail.com',
    hours: 'Monday – Saturday, 9:30 AM – 7:00 PM IST',
  };
  const contactHeading = (section4.heading || '3. How to Initiate a Refund Request').replace(/^4\./, '3.');

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="flex-1 max-w-[920px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#E2D5C7]/80 shadow-[0_4px_24px_rgba(44,29,19,0.04)]">
          <div className="border-b border-[#F2ECE4] pb-6 mb-8 text-center sm:text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#7B5B3A] uppercase block mb-2">
              {eyebrow}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1D13]">
              {title}
            </h1>
            <p className="text-xs text-[#8C7B6B] mt-2">{lastUpdated}</p>
          </div>

          <div className="space-y-8 text-xs sm:text-sm text-[#5C4A3E] leading-relaxed">
            {/* Essential Policy Highlight Box */}
            {highlightBox && (
              <div className="p-5 sm:p-6 bg-[#FAF7F2] border-l-4 border-[#7B5B3A] border border-[#E8E0D5] rounded-2xl">
                <h2 className="font-display text-base font-bold text-[#2C1D13] mb-2">
                  {highlightBox.title}
                </h2>
                {highlightBox.main_rule && (
                  <p className="text-[#6B5744] leading-relaxed mb-3">
                    <strong>{highlightBox.main_rule}</strong>
                  </p>
                )}
                {highlightBox.detail && (
                  <p className="text-[#6B5744] leading-relaxed">{highlightBox.detail}</p>
                )}
              </div>
            )}

            {/* Section 1: Return & Refund Criteria */}
            {section1 && (
              <section>
                <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                  {section1.heading}
                </h2>
                {section1.intro && <p className="mb-2">{section1.intro}</p>}
                {section1.points && section1.points.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1.5 text-[#6B5744]">
                    {section1.points.map((pt: string, i: number) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Section 2: Non-Returnable Items */}
            {section2 && (
              <section>
                <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                  {section2.heading}
                </h2>
                {section2.intro && <p className="mb-2">{section2.intro}</p>}
                {section2.points && section2.points.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1.5 text-[#6B5744]">
                    {section2.points.map((pt: string, i: number) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Section 3: Contact & Initiation */}
            {section4 && (
              <section className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E2D5C7]">
                <h2 className="font-display text-base font-bold text-[#2C1D13] mb-2">
                  {contactHeading}
                </h2>
                {section4.intro && (
                  <p className="text-xs text-[#6B5744] mb-3">{section4.intro}</p>
                )}
                <div className="space-y-1 text-xs font-medium text-[#2C1D13]">
                  {section4.whatsapp && (
                    <p>
                      <strong>Official WhatsApp:</strong>{' '}
                      <a
                        href={`https://wa.me/${section4.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7B5B3A] underline font-bold"
                      >
                        {section4.whatsapp}
                      </a>{' '}
                      (Fastest response)
                    </p>
                  )}
                  {section4.email && (
                    <p>
                      <strong>Support Email:</strong>{' '}
                      <a href={`mailto:${section4.email}`} className="text-[#7B5B3A] underline">
                        {section4.email}
                      </a>
                    </p>
                  )}
                  {section4.hours && (
                    <p>
                      <strong>Support Hours:</strong> {section4.hours}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-[#F2ECE4] text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider text-[#7B5B3A] hover:text-[#2C1D13] transition-colors"
            >
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </main>

      <Footer
        footerGroups={[]}
        brandDescription={
          settings?.meta_description ||
          'Elegant modest fashion crafted with love. Premium quality pieces for your everyday and special moments.'
        }
        socialLinks={{
          instagram: settings?.social_instagram || undefined,
          facebook: settings?.social_facebook || undefined,
          whatsapp: settings?.social_whatsapp || undefined,
        }}
      />
    </div>
  );
}
