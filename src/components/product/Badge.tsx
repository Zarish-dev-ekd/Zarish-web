interface BadgeProps {
  variant: 'new' | 'sale' | 'out-of-stock';
  text?: string;
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

export default function Badge({ variant, text }: BadgeProps) {
  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[11px] font-medium tracking-wide uppercase leading-none shadow-xs ${variantClasses[variant] || 'bg-[#7B5B3A] text-white'}`}>
      {text || defaultLabels[variant]}
    </span>
  );
}
