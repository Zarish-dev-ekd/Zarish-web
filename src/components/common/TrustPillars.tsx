import {
  IconShield,
  IconTruck,
  IconPackage,
  IconWhatsapp,
} from '@/components/icons';

interface TrustPillarsProps {
  className?: string;
  whatsappNumber?: string;
}

export default function TrustPillars({ className = '', whatsappNumber }: TrustPillarsProps) {
  const whatsappHref = whatsappNumber
    ? (whatsappNumber.startsWith('http') ? whatsappNumber : `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`)
    : 'https://wa.me/';

  return (
    <section className={`w-full border-y border-[#E2D5C7]/70 bg-[#F5EDE3]/50 ${className}`} aria-label="Brand Guarantees">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Pillar 1 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] flex items-center justify-center text-[#7B5B3A] shrink-0 shadow-2xs">
            <IconShield size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2C1D13] uppercase tracking-wider">Modest Elegance</p>
            <p className="text-[11px] text-[#7B6858] leading-tight">Curated premium fabrics</p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] flex items-center justify-center text-[#7B5B3A] shrink-0 shadow-2xs">
            <IconTruck size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2C1D13] uppercase tracking-wider">Fast Dispatch</p>
            <p className="text-[11px] text-[#7B6858] leading-tight">Carefully packed & shipped</p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] flex items-center justify-center text-[#7B5B3A] shrink-0 shadow-2xs">
            <IconPackage size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2C1D13] uppercase tracking-wider">Every Size Beautiful</p>
            <p className="text-[11px] text-[#7B6858] leading-tight">Custom fitting guidance</p>
          </div>
        </div>

        {/* Pillar 4 */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group transition-opacity hover:opacity-85"
        >
          <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] flex items-center justify-center text-[#7B5B3A] group-hover:text-[#0E7064] group-hover:border-[#0E7064] transition-colors shrink-0 shadow-2xs">
            <IconWhatsapp size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2C1D13] uppercase tracking-wider">Personal Support</p>
            <p className="text-[11px] text-[#7B6858] leading-tight">Direct WhatsApp concierge</p>
          </div>
        </a>
      </div>
    </section>
  );
}
