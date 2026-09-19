import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings, getAnnouncements, getNavigationItems } from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | ZARISH by Nehala Mufeed',
  description: 'Detailed Refund, Return, and Cancellation Policy of ZARISH. Learn about our 24-48 hour unboxing verification guidelines.',
};

export default async function RefundPolicyPage() {
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
              Customer Assurance &amp; Guidelines
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1D13]">
              Refund, Return &amp; Cancellation Policy
            </h1>
            <p className="text-xs text-[#8C7B6B] mt-2">
              Last updated: September 2026 • Valid for all online purchases on zarish.in
            </p>
          </div>

          <div className="space-y-8 text-xs sm:text-sm text-[#5C4A3E] leading-relaxed">
            {/* Essential Policy Highlight Box */}
            <div className="p-5 sm:p-6 bg-[#FAF7F2] border-l-4 border-[#7B5B3A] border border-[#E8E0D5] rounded-2xl">
              <h2 className="font-display text-base font-bold text-[#2C1D13] mb-2">
                Mandatory Unboxing Video Requirement
              </h2>
              <p className="text-[#6B5744] leading-relaxed mb-3">
                Refunds and replacements are applicable <strong>only for damaged or defective products</strong> received by the customer.
              </p>
              <p className="text-[#6B5744] leading-relaxed">
                To claim a replacement or refund, you must contact our official WhatsApp support (<strong className="text-[#2C1D13]">+91 9562292945</strong>) within <strong>24 to 48 hours of delivery</strong> with a <strong>complete, uncut unboxing video</strong> (recorded continuously from start to end without pauses or cuts, showing the sealed courier package being opened and the defect clearly inspected). Requests raised after 48 hours of delivery cannot be entertained.
              </p>
            </div>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                1. Order Cancellation Policy
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[#6B5744]">
                <li>
                  <strong>Before Dispatch:</strong> You may request an order cancellation within <strong>12 hours</strong> of placing your order by contacting us on WhatsApp or email. If the package has not yet been processed by our dispatch team, a 100% full refund will be initiated immediately.
                </li>
                <li>
                  <strong>After Dispatch:</strong> Once an order is handed over to our logistics courier partners, it cannot be cancelled or intercepted in transit.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                2. Return &amp; Replacement Criteria
              </h2>
              <p className="mb-2">A return or replacement is accepted strictly under the following conditions:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#6B5744]">
                <li>The item received has physical transit damage, tears, or factory manufacturing defects.</li>
                <li>An incorrect product, size, or color was delivered compared to your confirmed order details.</li>
                <li>The garment must remain unwashed, unworn, unironed, with all original brand tags, embroidery guards, and packaging intact.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                3. Non-Returnable Items
              </h2>
              <p className="mb-2">In accordance with modest fashion hygiene standards and custom artistry:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#6B5744]">
                <li>Custom-tailored, bespoke altered, or personalized garments made to custom measurements.</li>
                <li>Hijabs, under-caps, and inner slips once removed from sealed packaging.</li>
                <li>Items bought during clearance sales or archive warehouse discount events.</li>
                <li>Products without an authentic, continuous unboxing video.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                4. Refund Processing Timeline
              </h2>
              <p>
                Once your unboxing verification is approved by our quality control team:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B5744] mt-2">
                <li>
                  <strong>Approval:</strong> Our team reviews your video and notifies you within 24 business hours.
                </li>
                <li>
                  <strong>Replacement:</strong> If preferred, an express replacement of the same garment is dispatched at zero extra cost.
                </li>
                <li>
                  <strong>Bank Credit:</strong> If a monetary refund is issued, it is processed back to the <strong>original payment method</strong> (credit card, debit card, UPI, or net banking) via our payment gateway partner <strong>Razorpay</strong>. The credit typically reflects in your bank statement within <strong>5 to 7 business days</strong> depending on your issuing bank.
                </li>
              </ul>
            </section>

            <section className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E2D5C7]">
              <h2 className="font-display text-base font-bold text-[#2C1D13] mb-2">
                5. How to Initiate a Return / Refund Request
              </h2>
              <p className="text-xs text-[#6B5744] mb-3">
                Send your order reference number and unboxing video directly to our support team:
              </p>
              <div className="space-y-1 text-xs font-medium text-[#2C1D13]">
                <p><strong>Official WhatsApp:</strong> <a href="https://wa.me/919562292945" target="_blank" rel="noopener noreferrer" className="text-[#7B5B3A] underline font-bold">+91 9562292945</a> (Fastest response)</p>
                <p><strong>Support Email:</strong> <a href="mailto:zarish2025co@gmail.com" className="text-[#7B5B3A] underline">zarish2025co@gmail.com</a></p>
                <p><strong>Support Hours:</strong> Monday – Saturday, 9:30 AM – 7:00 PM IST</p>
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
