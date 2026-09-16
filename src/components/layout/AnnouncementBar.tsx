'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Announcement } from '@/lib/types';
import { IconTruck, IconGift, IconGlobe, IconPackage, IconHeadphones } from '@/components/icons';

// Map icon name strings to components
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  truck: IconTruck,
  gift: IconGift,
  package: IconPackage,
  globe: IconGlobe,
  headphones: IconHeadphones,
};

interface AnnouncementBarProps {
  announcements?: Announcement[];
}

// Default items matching exact store requirements
const defaultAnnouncements = [
  { id: 'ann-1', text: 'All India Delivery Available', icon: 'truck' },
  { id: 'ann-2', text: 'Free Shipping Across Kerala', icon: 'gift' },
  { id: 'ann-3', text: 'International Delivery', icon: 'globe' },
];

export default function AnnouncementBar({ announcements = [] }: AnnouncementBarProps) {
  const activeAnnouncements = announcements.filter((a) => a.is_active);
  const displayItems = activeAnnouncements.length > 0 ? activeAnnouncements : defaultAnnouncements;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (displayItems.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [displayItems.length, isPaused]);

  const currentItem = displayItems[currentIndex] || displayItems[0];
  const IconComponent = iconMap[currentItem.icon] || IconTruck;

  return (
    <div
      className="bg-[#3D2B1F] text-[#F5EDE3] h-9 sm:h-10 flex items-center overflow-hidden border-b border-[#3D2B1F]"
      role="complementary"
      aria-label="Store announcements"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between text-xs tracking-wide">
        {/* Placeholder spacer for desktop symmetry */}
        <div className="hidden sm:block w-28 shrink-0" aria-hidden="true" />

        {/* Dynamic Center Announcement */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div
            key={currentItem.id}
            className="flex items-center gap-2 whitespace-nowrap animate-fade-in font-medium"
          >
            <span className="shrink-0 text-[#C8A97E]">
              <IconComponent size={14} />
            </span>
            <span>{currentItem.text}</span>
          </div>
        </div>

        {/* Right Navigation / Support Links */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-[#F5EDE3]/80">
          <Link
            href="/account"
            className="hover:text-white transition-colors"
          >
            Track Order
          </Link>
          <span className="text-[#F5EDE3]/30 text-[11px] select-none" aria-hidden="true">
            |
          </span>
          <Link
            href="/about"
            className="hover:text-white transition-colors"
          >
            Help
          </Link>
        </div>
      </div>
    </div>
  );
}
