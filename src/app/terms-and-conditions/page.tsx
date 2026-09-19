import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings, getAnnouncements, getNavigationItems } from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms & Conditions | ZARISH by Nehala Mufeed',
  description: 'Terms and Conditions governing the use of ZARISH e-commerce website and purchases.',
};

export default async function TermsAndConditionsPage() {
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
              Legal Agreement
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1D13]">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-[#8C7B6B] mt-2">
              Last updated: September 2026 • Governed by the Laws of India
            </p>
          </div>

          <div className="space-y-8 text-xs sm:text-sm text-[#5C4A3E] leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                1. General Overview
              </h2>
              <p>
                These Terms &amp; Conditions (&quot;Terms&quot;) apply to all users, visitors, and customers of <strong>ZARISH by Nehala Mufeed</strong> (&quot;ZARISH&quot;, &quot;Website&quot;, &quot;we&quot;, &quot;our&quot;). By browsing our catalog, creating an account, or placing an order, you agree to be bound by these Terms. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                2. Eligibility
              </h2>
              <p>
                By using this website, you represent that you are at least 18 years of age or accessing the site under the supervision of a parent or legal guardian who agrees to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                3. Product Representation &amp; Sizing
              </h2>
              <p>
                We take utmost care to accurately display the colors, fabrics, and detailed embroidery of our modest apparel. However, due to natural artisan weaving, dye variations, and differing screen calibrations, slight color variations may occur. Please consult our detailed <strong>Size Guide</strong> before placing orders.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                4. Pricing &amp; Payments
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-[#6B5744]">
                <li>All prices listed on ZARISH are in <strong>Indian National Rupees (INR / ₹)</strong> and are inclusive of applicable taxes unless stated otherwise.</li>
                <li>We reserve the right to revise prices, discontinue items, or adjust discounts without prior notice.</li>
                <li>Online transactions are processed securely through certified payment gateways including <strong>Razorpay</strong>. Orders are confirmed only upon successful authorization of payment.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                5. Order Confirmation &amp; Cancellation
              </h2>
              <p>
                Upon placing an order, an automated receipt is dispatched to your registered email address. We reserve the right to cancel any order in the event of unforeseen inventory shortages, pricing inaccuracies, or suspected fraudulent activity. In such events, a full refund is immediately credited to your original payment source.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                6. Intellectual Property Rights
              </h2>
              <p>
                All brand names, trademarks, logos, custom silhouette designs, imagery, graphics, and written content on this website are the sole intellectual property of <strong>ZARISH by Nehala Mufeed</strong>. Unauthorized reproduction, distribution, or commercial exploitation is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                7. Limitation of Liability &amp; Governing Law
              </h2>
              <p>
                ZARISH shall not be held liable for indirect, incidental, or consequential damages resulting from the use of our products beyond the purchase value of the garment. These Terms are governed by and construed in accordance with the laws of <strong>India</strong>, and any legal disputes shall be subject exclusively to the courts of <strong>Kerala, India</strong>.
              </p>
            </section>

            <section className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E2D5C7]">
              <h2 className="font-display text-base font-bold text-[#2C1D13] mb-2">
                8. Contact Information
              </h2>
              <p className="text-xs text-[#6B5744] mb-3">
                For questions regarding these Terms &amp; Conditions:
              </p>
              <div className="space-y-1 text-xs font-medium text-[#2C1D13]">
                <p><strong>Brand:</strong> ZARISH by Nehala Mufeed</p>
                <p><strong>Email:</strong> <a href="mailto:zarish2025co@gmail.com" className="text-[#7B5B3A] underline">zarish2025co@gmail.com</a></p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/919562292945" target="_blank" rel="noopener noreferrer" className="text-[#7B5B3A] underline">+91 9562292945</a></p>
                <p><strong>Jurisdiction:</strong> Kerala, India</p>
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
