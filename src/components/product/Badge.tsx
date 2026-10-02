import type { ProductBadge } from '@/lib/types';

interface BadgeProps {
  variant?: 'new' | 'sale' | 'out-of-stock';
  text?: string;
  badge?: ProductBadge | null;
  className?: string;
  inline?: boolean;
}

const defaultLabels: Record<string, string> = {
  new: 'New',
  sale: 'Sale',
  'out-of-stock': 'Sold Out',
};

const variantClasses: Record<string, string> = {
  new: 'bg-[#0E7064] text-white',
  sale: 'bg-[#8B4E5A] text-white',
  'out-of-stock': 'bg-[#8C7B6B] text-white',
};

export default function Badge({ variant, text, badge, className = '', inline = false }: BadgeProps) {
  // 1. If custom badge is passed
  if (badge) {
    const bg = badge.bg_color || '#D4AF37';
    const fg = badge.text_color || '#FFFFFF';
    const label = badge.text || 'FEATURED';

    // Inline preview (used in dropdowns, badges manager list, etc.)
    if (inline) {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase shadow-xs ${className}`}
          style={{ backgroundColor: bg, color: fg }}
        >
          <span>{label}</span>
        </span>
      );
    }

    // Full storefront display
    switch (badge.style) {
      case 'corner_ribbon':
        return (
          <div className={`absolute top-0 left-0 w-24 h-24 overflow-hidden pointer-events-none z-20 ${className}`}>
            {/* Top folded edge shadow */}
            <span
              className="absolute top-0 right-[21px] w-0 h-0 border-t-[5px] border-r-[5px] border-t-transparent border-r-black/45"
              aria-hidden="true"
            />
            {/* Left folded edge shadow */}
            <span
              className="absolute bottom-[21px] left-0 w-0 h-0 border-b-[5px] border-l-[5px] border-b-transparent border-l-black/45"
              aria-hidden="true"
            />
            {/* Main Diagonal Ribbon Banner */}
            <div
              className="absolute top-[18px] -left-[30px] w-[122px] py-[4px] text-center font-black text-[10px] tracking-widest uppercase shadow-[0_3px_8px_rgba(0,0,0,0.25)] transform -rotate-45 select-none"
              style={{
                backgroundColor: bg,
                color: fg,
              }}
            >
              {label}
            </div>
          </div>
        );


      case 'hanging_flag':
        return (
          <div
            className={`absolute top-0 left-2.5 sm:left-3.5 z-20 px-2 sm:px-2.5 pt-1.5 pb-2.5 text-center font-bold text-[9px] sm:text-[10px] tracking-wider uppercase shadow-md pointer-events-none select-none ${className}`}
            style={{
              backgroundColor: bg,
              color: fg,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
            }}
          >
            {label}
          </div>
        );

      case 'rosette':
        return (
          <div
            className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex flex-col items-center justify-center p-1 text-center font-black text-[8px] sm:text-[9px] leading-tight tracking-tight uppercase shadow-lg border border-white/60 pointer-events-none select-none ${className}`}
            style={{
              backgroundColor: bg,
              color: fg,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2), inset 0 0 8px rgba(0,0,0,0.12)',
            }}
          >
            <span>{label}</span>
          </div>
        );

      case 'side_tag':
        return (
          <div
            className={`absolute top-3 left-0 z-20 pl-2.5 pr-3 py-1 font-bold text-[9px] sm:text-[10px] tracking-wider uppercase rounded-r shadow-md pointer-events-none select-none flex items-center ${className}`}
            style={{
              backgroundColor: bg,
              color: fg,
            }}
          >
            {label}
          </div>
        );

      case 'luxury_pill':
      default:
        return (
          <div
            className={`absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase shadow-sm pointer-events-none select-none border border-white/30 backdrop-blur-xs ${className}`}
            style={{
              backgroundColor: bg,
              color: fg,
            }}
          >
            {label}
          </div>
        );
    }
  }

  // 2. Standard variant badge
  if (variant) {
    return (
      <span
        className={`inline-flex items-center justify-center px-2 py-1 rounded text-[11px] font-medium tracking-wide uppercase leading-none shadow-xs ${
          variantClasses[variant] || 'bg-[#7B5B3A] text-white'
        } ${className}`}
      >
        {text || defaultLabels[variant]}
      </span>
    );
  }

  return null;
}
