import Image from 'next/image';
import Link from 'next/link';

interface BrandStoryProps {
  story?: any;
}

export default function BrandStory({ story }: BrandStoryProps) {
  return (
    <section
      id="brand-story"
      className="w-full bg-white py-14 sm:py-20 lg:py-24 border-t border-[#F0E6DC]/70"
      aria-label="A Note From Our Founder"
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column: Luxury Brand Card */}
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-[520px] aspect-square rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(44,29,19,0.12)] border border-[#3A0F17]/20 group">
              <Image
                src="/zarish-brand-card.webp"
                alt="ZARISH by Nehala Mufeed"
                fill
                sizes="(max-width: 768px) 100vw, 520px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                priority={false}
              />
            </div>
          </div>

          {/* Right Column: Founder Letter & Story */}
          <div className="w-full max-w-[560px] flex flex-col justify-center">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#2C1D13] tracking-tight mb-5 sm:mb-6">
              Dear Zarish Family,
            </h2>

            <div className="space-y-4 text-xs sm:text-[14px] lg:text-[15px] leading-relaxed sm:leading-[1.8] text-[#5C4A3E]">
              <p>
                Zarish started as a small dream my husband and I shared. While building it, we were
                also learning to be parents, and our little girl was growing alongside us. There
                were days we wished we could give her more of our time, but she quietly waited,
                adjusted, and grew with us. Looking back, I realise she didn’t just grow up alongside
                Zarish—she grew up with it.
              </p>

              <p>
                I’m forever grateful to my husband for being my strength through every high and low,
                believing in me when I doubted myself, and always encouraging me to keep going. And
                to our Zarish family, thank you for being part of this journey. Every order, kind
                message, share, recommendation, and every person who believed in us has meant more
                than you know.
              </p>

              <p>
                We started Zarish with a dream, and today, we carry it with gratitude. Every order
                reminds us that something we built with love has found a place in someone else’s
                life. As we continue to grow, we’re grateful to have you with us. Thank you for
                being a part of our Zarish story.
              </p>
            </div>

            {/* Founder Signature */}
            <div className="mt-6 pt-3 border-t border-[#F0E6DC]">
              <p className="font-serif italic text-sm text-[#7B5B3A]">With love,</p>
              <p className="font-display text-lg sm:text-xl font-bold text-[#2C1D13] mt-0.5">
                Nehala Mufeed
              </p>
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#8C7B6B] font-semibold mt-0.5">
                Founder, Zarish
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#2C1D13] text-white text-xs sm:text-sm font-medium tracking-wider uppercase rounded-xl hover:bg-[#7B5B3A] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Shop now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
