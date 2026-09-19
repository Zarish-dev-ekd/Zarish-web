import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings, getAnnouncements, getNavigationItems } from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | ZARISH by Nehala Mufeed',
  description: 'Shipping rates, transit timelines, and delivery information across Kerala and India for ZARISH orders.',
};

export default async function ShippingPolicyPage() {
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
              Logistics &amp; Dispatch
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1D13]">
              Shipping &amp; Delivery Policy
            </h1>
            <p className="text-xs text-[#8C7B6B] mt-2">
              Fast, insured pan-India delivery for your modest luxury garments
            </p>
          </div>

          <div className="space-y-8 text-xs sm:text-sm text-[#5C4A3E] leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                1. Order Processing Time
              </h2>
              <p>
                All orders placed on <strong>ZARISH by Nehala Mufeed</strong> are inspected by our master tailors, securely packaged in luxury dust bags, and handed over to our verified courier partners within <strong>1 to 2 business days</strong> (excluding Sundays and national holidays).
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                2. Shipping Rates &amp; Delivery Estimates
              </h2>
              <div className="overflow-x-auto my-4">
                <table className="w-full text-left border-collapse border border-[#E2D5C7] rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#2C1D13] text-xs font-bold uppercase tracking-wider">
                      <th className="p-3 border border-[#E2D5C7]">Destination Region</th>
                      <th className="p-3 border border-[#E2D5C7]">Transit Time</th>
                      <th className="p-3 border border-[#E2D5C7]">Shipping Charges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2D5C7] text-xs">
                    <tr>
                      <td className="p-3 font-semibold text-[#2C1D13]">Across Kerala</td>
                      <td className="p-3 text-[#0E7064] font-medium">3 to 5 Business Days</td>
                      <td className="p-3 text-[#0E7064] font-bold">FREE Delivery</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#2C1D13]">Rest of India (All States)</td>
                      <td className="p-3 text-[#5C4A3E]">5 to 7 Business Days</td>
                      <td className="p-3 text-[#2C1D13] font-medium">Flat ₹50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#8C7B6B]">
                *During major festive periods (Eid, Ramadan, Diwali) or extreme weather alerts, transit timelines may experience slight delays beyond our control.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                3. Order Tracking &amp; Delivery Notifications
              </h2>
              <p>
                As soon as your parcel is dispatched from our workshop in Kerala, you will receive an automated notification via email and SMS containing your <strong>AWB / Tracking Number</strong> and direct tracking URL to monitor your shipment in real time.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                4. Courier Partners
              </h2>
              <p>
                We partner exclusively with India&apos;s leading insured express logistics providers including Delhivery, Blue Dart, DTDC, and India Post Speed Post to guarantee safe, tamper-evident delivery to your door.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#2C1D13] mb-2.5">
                5. Accurate Delivery Address
              </h2>
              <p>
                Customers are kindly requested to provide complete, accurate delivery addresses with PIN codes and an active phone number to ensure smooth delivery. If a shipment is returned due to incorrect contact information or repeated delivery refusals, re-dispatch charges may apply.
              </p>
            </section>

            <section className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E2D5C7]">
              <h2 className="font-display text-base font-bold text-[#2C1D13] mb-2">
                6. Shipping Assistance &amp; Urgent Inquiries
              </h2>
              <p className="text-xs text-[#6B5744] mb-3">
                Need urgent express dispatch for a wedding, event, or special occasion? Contact our dispatch desk:
              </p>
              <div className="space-y-1 text-xs font-medium text-[#2C1D13]">
                <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/919562292945" target="_blank" rel="noopener noreferrer" className="text-[#7B5B3A] underline font-bold">+91 9562292945</a></p>
                <p><strong>Email:</strong> <a href="mailto:zarish2025co@gmail.com" className="text-[#7B5B3A] underline">zarish2025co@gmail.com</a></p>
                <p><strong>Workshop Hub:</strong> Kerala, India</p>
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
