import type { Benefit } from '@/lib/types';
import { IconTruck, IconPackage, IconGlobe, IconHeadphones, IconShield } from '@/components/icons';

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  truck: IconTruck,
  package: IconPackage,
  globe: IconGlobe,
  headphones: IconHeadphones,
  shield: IconShield,
};

interface BenefitsStripProps {
  benefits: Benefit[];
}

export default function BenefitsStrip({ benefits }: BenefitsStripProps) {
  const activeBenefits = benefits.filter((b) => b.is_active);

  if (activeBenefits.length === 0) return null;

  return (
    <section className="border-b border-[#E2D5C7] bg-[#FAF6F0]" aria-label="Our benefits">
      <div className="flex items-center justify-center gap-8 md:gap-16 py-4 md:py-6 px-4 md:px-8 max-w-[1280px] mx-auto max-md:overflow-x-auto max-md:justify-start [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {activeBenefits.map((benefit) => {
          const IconComponent = iconMap[benefit.icon] || IconTruck;
          return (
            <div key={benefit.id} className="flex items-center gap-4 shrink-0 md:shrink">
              <div className="w-10 h-10 flex items-center justify-center text-[#7B5B3A] shrink-0 [&>svg]:w-6 [&>svg]:h-6">
                <IconComponent size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[#8C7B6B] tracking-wide whitespace-nowrap">{benefit.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
