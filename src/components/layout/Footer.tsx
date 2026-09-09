import Link from 'next/link';
import Image from 'next/image';
import type { FooterGroup } from '@/lib/types';
import { IconInstagram, IconFacebook, IconWhatsapp, IconMail } from '@/components/icons';

interface FooterProps {
  footerGroups: FooterGroup[];
  brandDescription: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    email?: string;
  };
}

export default function Footer({ footerGroups, brandDescription, socialLinks }: FooterProps) {
  const activeGroups = footerGroups.filter((g) => g.is_active);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__top">
          {/* Brand Column */}
          <div className="footer__brand">
            <div className="footer__brand-logo">
              <Image
                src="/logo-zarish.png"
                alt="ZARISH by Nehala Mufeed"
                width={140}
                height={36}
                style={{ height: '32px', width: 'auto' }}
              />
            </div>
            {brandDescription && (
              <p className="footer__brand-description">{brandDescription}</p>
            )}
            <div className="footer__social">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Follow us on Instagram">
                  <IconInstagram />
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Follow us on Facebook">
                  <IconFacebook />
                </a>
              )}
              {socialLinks.whatsapp && (
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Contact us on WhatsApp">
                  <IconWhatsapp />
                </a>
              )}
              {socialLinks.email && (
                <a href={`mailto:${socialLinks.email}`} className="footer__social-link" aria-label="Email us">
                  <IconMail />
                </a>
              )}
            </div>
          </div>

          {/* Link Columns */}
          {activeGroups.map((group) => (
            <div key={group.id}>
              <h3 className="footer__column-title">{group.title}</h3>
              <ul className="footer__links">
                {group.links
                  .filter((l) => l.is_active)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="footer__link"
                        {...(link.open_in_new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} ZARISH by Nehala Mufeed. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
