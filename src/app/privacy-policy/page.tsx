import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings, getAnnouncements, getNavigationItems } from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | ZARISH by Nehala Mufeed',
  description: 'Privacy Policy of ZARISH by Nehala Mufeed. Learn how we collect, protect, and handle your personal information.',
};

export default async function PrivacyPolicyPage() {
  const [settings, announcements, navigationItems] = await Promise.all([
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="flex-1 max-w-[920px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#E2D5C7]/80 shadow-[0_4px_24px_rgba(44,29,19,0.04)]">
          <div className="border-b border-[#F2ECE4] pb-6 mb-8 text-center sm:text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#7B5B3A] uppercase block mb-2">
              Legal &amp; Transparency
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1D13]">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#8C7B6B] mt-2">
              Last updated: September 2026 • Effective Date: Immediate
            </p>
          </div>

          <div className="space-y-8 text-xs sm:text-sm text-[#5C4A3E] leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                1. Introduction
              </h2>
              <p>
                Welcome to <strong>ZARISH by Nehala Mufeed</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data in full compliance with the Information Technology Act, 2000 and applicable consumer protection regulations in India. This Privacy Policy details how we collect, utilize, and safeguard your details when you visit our website or purchase our modest luxury garments.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                2. Information We Collect
              </h2>
              <p className="mb-2">We collect only necessary information required to process and dispatch your orders:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#6B5744]">
                <li><strong>Identity &amp; Contact:</strong> Full name, email address, phone number, and delivery address.</li>
                <li><strong>Order &amp; Transaction Details:</strong> Products purchased, size, color preferences, order totals, and generated order reference numbers.</li>
                <li><strong>Payment Information:</strong> All online card, UPI, and net banking transactions are processed securely via our certified payment partner, <strong>Razorpay</strong>. ZARISH does NOT store or have access to your credit/debit card numbers, CVV, or UPI PINs.</li>
                <li><strong>Technical Data:</strong> IP address, device type, browser settings, and page navigation metrics to ensure a seamless checkout experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                3. How We Use Your Data
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-[#6B5744]">
                <li>To confirm, fulfill, pack, and ship your luxury apparel orders.</li>
                <li>To dispatch real-time order tracking numbers, delivery updates, and digital tax receipts.</li>
                <li>To provide dedicated customer support regarding custom sizing, unboxing verification, and queries via WhatsApp or email.</li>
                <li>To prevent fraudulent transactions and maintain store security.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                4. Payment Security &amp; Razorpay Compliance
              </h2>
              <p>
                We use <strong>Razorpay</strong> as our authoritative payment gateway. Razorpay is certified with PCI-DSS (Payment Card Industry Data Security Standard) Level 1 compliance — the highest standard of online payment security. All transmissions are protected with end-to-end 256-bit SSL encryption.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                5. Sharing of Personal Information
              </h2>
              <p>
                We never sell, rent, or trade your personal data to third parties. We share information strictly with verified partners essential for delivering your order:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#6B5744] mt-2">
                <li>Authorized delivery courier networks (to deliver packages to your doorstep).</li>
                <li>Razorpay payment infrastructure (to securely process payment verifications).</li>
                <li>Legal or government authorities only when strictly required by Indian law.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                6. Data Retention &amp; Customer Rights
              </h2>
              <p>
                We retain your order details for legitimate accounting and tax audit purposes under Indian commercial laws. You have the right to request access to your stored personal information, correct any inaccuracies, or request account closure by contacting us.
              </p>
            </section>

            <section className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E2D5C7]">
              <h2 className="font-display text-base font-bold text-[#2C1D13] mb-2">
                7. Contact Our Privacy Officer
              </h2>
              <p className="text-xs text-[#6B5744] mb-3">
                If you have questions regarding this Privacy Policy or how your information is handled:
              </p>
              <div className="space-y-1 text-xs font-medium text-[#2C1D13]">
                <p><strong>Brand:</strong> ZARISH by Nehala Mufeed</p>
                <p><strong>Customer Support Email:</strong> <a href="mailto:zarish2025co@gmail.com" className="text-[#7B5B3A] underline">zarish2025co@gmail.com</a></p>
                <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/919562292945" target="_blank" rel="noopener noreferrer" className="text-[#7B5B3A] underline">+91 9562292945</a></p>
                <p><strong>Location:</strong> Kerala, India</p>
              </div>
            </section>
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
