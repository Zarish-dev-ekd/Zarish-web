'use client';

import { use } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = use(params);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <Header navigationItems={[]} cartItemCount={0} />

      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#E2D5C7]/80 shadow-[0_8px_30px_rgba(44,29,19,0.06)]">
          {/* Success Checkmark Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#EBF8F2] text-[#0E7064] flex items-center justify-center text-3xl font-bold mb-6 shadow-inner">
            ✓
          </div>

          <p className="text-xs font-bold tracking-[0.2em] text-[#7B5B3A] uppercase mb-2">
            Payment Confirmed via Razorpay
          </p>

          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#2C1D13] mb-4">
            Thank You for Your Order!
          </h1>

          <p className="text-xs sm:text-sm text-[#6B5744] max-w-md mx-auto leading-relaxed mb-6">
            Your modest garment is being prepared with exquisite care by our master artisans. We
            have emailed your receipt and tracking details.
          </p>

          {/* Order Details Card */}
          <div className="bg-[#FAF8F5] border border-[#E2D5C7] rounded-2xl p-4 sm:p-6 max-w-md mx-auto mb-8 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#8C7B6B]">Order Reference:</span>
              <strong className="font-mono text-[#2C1D13] font-bold text-sm sm:text-base">
                {orderNumber}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#8C7B6B]">Payment Method:</span>
              <span className="font-semibold text-[#2C1D13]">Razorpay (Secure Instant)</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#8C7B6B]">Delivery Estimate:</span>
              <span className="font-semibold text-[#0E7064]">3 - 5 Business Days</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              href="/account"
              className="w-full sm:w-auto flex-1 h-12 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all flex items-center justify-center shadow-sm"
            >
              View in My Orders
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto flex-1 h-12 rounded-full border border-[#7B5B3A] text-[#7B5B3A] hover:bg-[#FAF6F0] text-xs sm:text-sm font-semibold tracking-wider transition-all flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer
        footerGroups={[]}
        brandDescription="ZARISH by Nehala Mufeed — Modest luxury fashion crafted with utmost elegance."
        socialLinks={{}}
      />
    </div>
  );
}
