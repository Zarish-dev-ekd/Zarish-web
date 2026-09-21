'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function ProductSortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newSort && newSort !== 'newest') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currentSort || 'newest'}
        onChange={handleSortChange}
        aria-label="Sort garments"
        className="appearance-none bg-[#FAF8F5] border border-[#E2D5C7] hover:border-[#2C1D13] text-[#2C1D13] text-xs font-semibold py-2 pl-3.5 pr-8 rounded-full focus:outline-none focus:ring-1 focus:ring-[#2C1D13] cursor-pointer transition-all shadow-2xs"
      >
        <option value="newest">Sort: Newest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7B5B3A]">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 1L5 5L9 1" />
        </svg>
      </div>
    </div>
  );
}
