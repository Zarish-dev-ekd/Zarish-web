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
    <section className="benefits-strip" aria-label="Our benefits">
      <div className="benefits-strip__inner">
        {activeBenefits.map((benefit) => {
          const IconComponent = iconMap[benefit.icon] || IconTruck;
          return (
            <div key={benefit.id} className="benefits-strip__item">
              <div className="benefits-strip__icon">
                <IconComponent size={24} />
              </div>
              <div className="benefits-strip__text">
                <span className="benefits-strip__label">{benefit.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
