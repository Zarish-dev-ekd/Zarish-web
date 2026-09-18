'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { Coupon } from '@/lib/types';

interface InternationalDeliveryProps {
  whatsappNumber?: string | null;
}

export default function InternationalDelivery({ whatsappNumber }: InternationalDeliveryProps) {
  const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');
  const message = encodeURIComponent('Hello ZARISH! I would like to inquire about international delivery.');
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${message}`
    : `https://wa.me/?text=${message}`;

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchActiveCoupon() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          // Check if not expired
          if (!data.valid_until || new Date(data.valid_until) >= new Date()) {
            setCoupon(data as Coupon);
          }
        }
      } catch (err) {
        console.error('Error fetching coupon for banner:', err);
      }
    }
    fetchActiveCoupon();
  }, []);

  const handleCopyCoupon = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="w-full py-3 sm:py-4 md:py-5 px-4 sm:px-6 lg:px-8 bg-white"
      aria-labelledby="international-delivery-heading"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className={`grid grid-cols-1 ${coupon ? 'lg:grid-cols-2' : ''} gap-4 lg:gap-6 items-stretch`}>

          {/* ─── LEFT: International Delivery Box (Equal 50% width when coupon exists, full width centered when no coupon) ──── */}
          <div className={`relative overflow-hidden rounded-[18px] sm:rounded-[22px] bg-[#FAF6F0] border border-[#EBE0D6] flex flex-row items-center ${coupon ? 'justify-between' : 'justify-center'} min-h-[160px] sm:min-h-[175px]`}>

            {/* Full Background Image */}
            <div
              className="absolute inset-0 pointer-events-none select-none overflow-hidden"
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/international-delivery-banner.png"
                alt="International delivery"
                className={`w-full h-full object-cover ${coupon ? 'object-right' : 'object-center'}`}
                loading="lazy"
              />
              <div
                className={`absolute inset-0 ${
                  coupon
                    ? 'bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:from-white/90 sm:via-white/60 sm:to-transparent'
                    : 'bg-gradient-to-r from-white/90 via-white/80 to-white/90 sm:from-white/85 sm:via-white/75 sm:to-white/85'
                }`}
              />
            </div>

            {/* Fluid lines */}
            <svg
              className="absolute bottom-0 left-0 w-28 sm:w-40 h-14 sm:h-20 pointer-events-none select-none text-[#DDC8BA]/40"
              viewBox="0 0 200 130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M-20 120 C 40 120, 80 80, 110 30 C 130 -10, 160 -10, 200 -20"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>

            {/* Content info & button */}
            <div className={`relative z-10 flex flex-col justify-center flex-1 min-w-0 p-4 sm:p-6 ${coupon ? 'items-start text-left' : 'items-center text-center'}`}>
              <span className="text-[8.5px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-[#8C6352] mb-1">
                BEAUTY HAS NO BORDERS
              </span>

              <h2
                id="international-delivery-heading"
                className={`font-display font-bold text-[#351E17] leading-tight tracking-tight mb-2 sm:mb-3 ${
                  coupon
                    ? 'text-sm sm:text-2xl lg:text-xl xl:text-2xl'
                    : 'text-base sm:text-2xl lg:text-3xl'
                }`}
              >
                {coupon ? (
                  <>
                    International<br />Delivery Available
                  </>
                ) : (
                  <span className="sm:whitespace-nowrap">International Delivery Available</span>
                )}
              </h2>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-[#874B3E] hover:bg-[#6E3A2F] text-white text-[9px] sm:text-[11px] font-bold tracking-[0.12em] uppercase transition-all duration-300 shadow-[0_3px_12px_rgba(135,75,62,0.2)] hover:shadow-[0_5px_16px_rgba(135,75,62,0.3)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.49 0-2.95-.4-4.23-1.16l-.3-.18-3.14.82.84-3.06-.2-.31a8.19 8.19 0 01-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.02 4.54-3.68 8.24-8.23 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43l-.48-.01c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.59.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.17-.48-.29z" />
                  </svg>
                </span>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* ─── RIGHT: Coupon Code Card (Equal 50% width) ───────────── */}
          {coupon && (
            <div className="relative overflow-hidden rounded-[18px] sm:rounded-[22px] bg-gradient-to-br from-[#FAF6F0] via-[#F5ECE1] to-[#F1E5D6] border border-[#E2D4C4] p-5 sm:p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(44,29,19,0.04)] min-h-[160px]">

              {/* Top Row: Eyebrow + Discount Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#7B5B3A] block mb-0.5">
                    SPECIAL OFFER
                  </span>
                  <h3 className=" text-lg sm:text-xl font-bold text-[#2C1D13] leading-tight">
                    {coupon.discount_type === 'percentage'
                      ? `Get ${coupon.discount_value}% OFF`
                      : `Save ${formatPrice(coupon.discount_value)} FLAT`}
                  </h3>
                </div>

                <div className="bg-[#8B4E5A] text-white text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs shrink-0">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : 'FLAT OFF'}
                </div>
              </div>

              {/* Middle: Details */}
              <p className="text-xs text-[#6B5744] mb-4 leading-relaxed">
                {coupon.min_order_value > 0
                  ? `Applicable on orders above ${formatPrice(coupon.min_order_value)}.`
                  : 'Valid on your checkout order with no minimum limit.'}
              </p>

              {/* Bottom: Coupon Code Pill with Copy Action */}
              <div className="flex items-center justify-between gap-2 p-1.5 pl-3.5 bg-white rounded-full border border-[#D8C7B5] shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#8C7B6B] font-semibold">CODE:</span>
                  <span className="font-mono font-bold text-sm tracking-wider text-[#2C1D13]">
                    {coupon.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all bg-[#2C1D13] text-white hover:bg-[#7B5B3A] active:scale-95 cursor-pointer shrink-0"
                >
                  {copied ? 'Copied! ✓' : 'Copy Code'}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}
