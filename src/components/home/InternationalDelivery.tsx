'use client';

interface InternationalDeliveryProps {
  whatsappNumber?: string | null;
}

export default function InternationalDelivery({ whatsappNumber }: InternationalDeliveryProps) {
  const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');
  const message = encodeURIComponent('Hello ZARISH! I would like to inquire about international delivery.');
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${message}`
    : `https://wa.me/?text=${message}`;

  return (
    <section
      className="w-full py-3 sm:py-4 md:py-5 px-4 sm:px-6 lg:px-8 bg-white"
      aria-labelledby="international-delivery-heading"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* ─── Outer Banner Card Matching Reference ───────────────────── */}
        <div className="relative overflow-hidden rounded-[16px] sm:rounded-[20px] md:rounded-[24px] bg-white border border-[#EBE0D6] flex flex-col lg:flex-row items-center justify-between h-auto lg:h-[150px] xl:h-[155px]">
          
          {/* ─── Subtle Fluid Contour Lines (Bottom-Left) ─────────────── */}
          <svg
            className="absolute bottom-0 left-0 w-32 sm:w-40 h-16 sm:h-24 pointer-events-none select-none text-[#DDC8BA]/50"
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
            <path
              d="M-20 140 C 50 140, 95 95, 130 40 C 150 5, 180 5, 220 0"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>

          {/* ─── 1. LEFT: Text Content ─────────────────────────────────── */}
          <div className="relative z-10 px-5 py-2.5 sm:px-7 sm:py-3 lg:py-0 lg:pl-8 lg:pr-3 flex flex-col justify-center shrink-0 w-full lg:w-auto max-w-full lg:max-w-[340px] text-center lg:text-left">
            <span className="text-[9px] sm:text-[9.5px] font-semibold tracking-[0.2em] uppercase text-[#8C6352] mb-0.5">
              BEAUTY HAS NO BORDERS
            </span>

            <h2
              id="international-delivery-heading"
              className="font-display text-base sm:text-lg lg:text-[21px] font-bold text-[#351E17] leading-[1.15] tracking-tight mb-1"
            >
              International<br />Delivery Available
            </h2>
          </div>

          {/* ─── 2. CENTER: WhatsApp Button ─────────────── */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 py-2 sm:py-2.5 lg:py-0 shrink-0">
            {/* Pill CTA Button (Chat on WhatsApp) */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#874B3E] hover:bg-[#6E3A2F] text-white text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase transition-all duration-300 shadow-[0_3px_12px_rgba(135,75,62,0.2)] hover:shadow-[0_5px_16px_rgba(135,75,62,0.3)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              {/* WhatsApp Icon */}
              <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                <svg
                  className="w-3 h-3 fill-white"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.49 0-2.95-.4-4.23-1.16l-.3-.18-3.14.82.84-3.06-.2-.31a8.19 8.19 0 01-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.02 4.54-3.68 8.24-8.23 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43l-.48-.01c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.59.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.17-.48-.29z" />
                </svg>
              </span>
              <span>CHAT ON WHATSAPP</span>
            </a>
          </div>

          {/* ─── 3. RIGHT: Decorative Still-Life Scene in Organic Arch ──── */}
          <div
            className="relative w-full lg:w-[36%] xl:w-[38%] self-stretch h-32 lg:h-full overflow-hidden rounded-b-[16px] lg:rounded-b-none lg:rounded-l-[120px] pointer-events-none select-none shrink-0"
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/international-delivery-banner.png"
              alt="International delivery with vintage globe, gift box parcel, and passport"
              className="absolute inset-0 w-full h-full object-cover object-right scale-105"
              loading="lazy"
            />
            {/* Smooth edge blend gradient from the banner background */}
            <div className="absolute inset-y-0 left-0 w-20 lg:w-28 bg-gradient-to-r from-white via-white/75 to-transparent hidden lg:block" />
          </div>

        </div>
      </div>
    </section>
  );
}
