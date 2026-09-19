import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings, getAnnouncements, getNavigationItems } from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { IconWhatsapp, IconMail } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Contact Us | ZARISH by Nehala Mufeed',
  description: 'Get in touch with ZARISH customer care for orders, custom sizing consultations, and unboxing verification.',
};

export default async function ContactPage() {
  const [settings, announcements, navigationItems] = await Promise.all([
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#E2D5C7]/80 shadow-[0_4px_24px_rgba(44,29,19,0.04)]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#7B5B3A] uppercase block mb-2">
              Client Care &amp; Support
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1D13] mb-3">
              We Are Here for You
            </h1>
            <p className="text-xs sm:text-sm text-[#8C7B6B] leading-relaxed">
              Have a question about your order, custom sizing, delivery timelines, or product care? Connect directly with our team in Kerala.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* WhatsApp Card */}
            <div className="p-6 sm:p-8 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D5] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-2xl mb-4">
                  <IconWhatsapp size={24} />
                </div>
                <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-1.5">
                  Instant WhatsApp Concierge
                </h2>
                <p className="text-xs text-[#6B5744] leading-relaxed mb-4">
                  Fastest response for order status, unboxing video submissions, and fit recommendations.
                </p>
                <p className="text-sm font-bold text-[#2C1D13] mb-1 font-mono">
                  +91 9562292945
                </p>
                <p className="text-[11px] text-[#8C7B6B]">
                  Monday – Saturday: 9:30 AM – 7:00 PM IST
                </p>
              </div>

              <div className="mt-6">
                <a
                  href="https://wa.me/919562292945"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98"
                >
                  <IconWhatsapp size={16} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Email & Business Details Card */}
            <div className="p-6 sm:p-8 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D5] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#FAF0E6] text-[#7B5B3A] flex items-center justify-center text-2xl mb-4">
                  <IconMail size={24} />
                </div>
                <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-1.5">
                  Official Email &amp; Inquiries
                </h2>
                <p className="text-xs text-[#6B5744] leading-relaxed mb-4">
                  For corporate inquiries, collaboration, order receipts, and feedback.
                </p>
                <p className="text-sm font-bold text-[#2C1D13] mb-1 font-mono">
                  zarish2025co@gmail.com
                </p>
                <p className="text-[11px] text-[#8C7B6B]">
                  Response time: Within 24 hours
                </p>
              </div>

              <div className="mt-6">
                <a
                  href="mailto:zarish2025co@gmail.com"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98"
                >
                  <IconMail size={16} />
                  <span>Send an Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* Legal Business Information Box for Razorpay Compliance */}
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E2D5C7]">
            <h3 className="font-display text-base font-bold text-[#2C1D13] mb-4 pb-2 border-b border-[#E8E0D5]">
              Merchant &amp; Operational Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5C4A3E]">
              <div>
                <span className="text-[#8C7B6B] block mb-0.5">Legal Brand Name:</span>
                <strong className="text-[#2C1D13] font-semibold">ZARISH by Nehala Mufeed</strong>
              </div>
              <div>
                <span className="text-[#8C7B6B] block mb-0.5">Customer Support:</span>
                <strong className="text-[#2C1D13] font-semibold">zarish2025co@gmail.com</strong>
              </div>
              <div>
                <span className="text-[#8C7B6B] block mb-0.5">Support &amp; WhatsApp:</span>
                <strong className="text-[#2C1D13] font-semibold">+91 9562292945</strong>
              </div>
              <div>
                <span className="text-[#8C7B6B] block mb-0.5">Operating Location:</span>
                <strong className="text-[#2C1D13] font-semibold">Kerala, India</strong>
              </div>
            </div>
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
        brandDescription={settings?.meta_description}
        socialLinks={{
          instagram: settings?.social_instagram || undefined,
          facebook: settings?.social_facebook || undefined,
          whatsapp: settings?.social_whatsapp || undefined,
        }}
      />
    </div>
  );
}
