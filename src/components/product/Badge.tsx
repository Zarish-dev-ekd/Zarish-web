interface BadgeProps {
  variant: 'new' | 'sale' | 'out-of-stock';
  text?: string;
}

const defaultLabels: Record<string, string> = {
  new: 'New',
  sale: 'Sale',
  'out-of-stock': 'Sold Out',
};

export default function Badge({ variant, text }: BadgeProps) {
  return (
    <span className={`badge badge--${variant}`}>
      {text || defaultLabels[variant]}
    </span>
  );
}
