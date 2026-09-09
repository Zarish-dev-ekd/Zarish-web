import type { Announcement } from '@/lib/types';
import { IconTruck, IconPackage, IconGlobe, IconHeadphones } from '@/components/icons';

// Map icon name strings to components
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  truck: IconTruck,
  package: IconPackage,
  globe: IconGlobe,
  headphones: IconHeadphones,
};

interface AnnouncementBarProps {
  announcements: Announcement[];
}

export default function AnnouncementBar({ announcements }: AnnouncementBarProps) {
  const activeAnnouncements = announcements.filter((a) => a.is_active);

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="announcement-bar" role="complementary" aria-label="Store announcements">
      <div className="announcement-bar__inner">
        {activeAnnouncements.map((announcement, index) => {
          const IconComponent = iconMap[announcement.icon] || IconTruck;
          return (
            <div key={announcement.id}>
              {index > 0 && <span className="announcement-bar__divider" aria-hidden="true" />}
              <div className="announcement-bar__item">
                <IconComponent size={14} />
                <span>{announcement.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
