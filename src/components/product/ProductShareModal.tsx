'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';
import {
  IconX,
  IconCopy,
  IconCheck,
  IconWhatsapp,
  IconFacebook,
  IconTwitter,
  IconPinterest,
  IconMail,
  IconShare,
} from '@/components/icons';

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductShareModal({
  isOpen,
  onClose,
  product,
}: ProductShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
      setSupportsNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    }
  }, [isOpen]);

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const primaryImage =
    product.images?.find((img) => img.role === 'primary')?.secure_url ||
    product.images?.[0]?.secure_url ||
    '';

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API fails
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (!supportsNativeShare) return;
    try {
      await navigator.share({
        title: `${product.name} | ZARISH`,
        text: `Discover ${product.name} at ZARISH by Nehala Mufeed`,
        url: shareUrl,
      });
      onClose();
    } catch {
      // User cancelled share or error
    }
  };

  const shareText = encodeURIComponent(`${product.name} | ZARISH: `);
  const encodedUrl = encodeURIComponent(shareUrl);

  const channels = [
    {
      name: 'WhatsApp',
      icon: <IconWhatsapp size={19} className="text-[#25D366]" />,
      href: `https://api.whatsapp.com/send?text=${shareText}${encodedUrl}`,
      bg: 'hover:bg-[#E7F9EE] hover:border-[#25D366]/40',
      labelColor: 'text-[#1E7D42]',
    },
    {
      name: 'Facebook',
      icon: <IconFacebook size={18} className="text-[#1877F2]" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'hover:bg-[#EBF3FF] hover:border-[#1877F2]/40',
      labelColor: 'text-[#1877F2]',
    },
    {
      name: 'X (Twitter)',
      icon: <IconTwitter size={16} className="text-[#0F1419]" />,
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
      bg: 'hover:bg-[#F0F2F5] hover:border-[#0F1419]/30',
      labelColor: 'text-[#0F1419]',
    },
    {
      name: 'Pinterest',
      icon: <IconPinterest size={18} className="text-[#E60023]" />,
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(
        primaryImage
      )}&description=${encodeURIComponent(product.name)}`,
      bg: 'hover:bg-[#FDF0F2] hover:border-[#E60023]/40',
      labelColor: 'text-[#E60023]',
    },
    {
      name: 'Email',
      icon: <IconMail size={18} className="text-[#7B5B3A]" />,
      href: `mailto:?subject=${encodeURIComponent(
        `${product.name} | ZARISH by Nehala Mufeed`
      )}&body=${encodeURIComponent(
        `Thought you would love this piece from ZARISH:\n\n${product.name}\n${shareUrl}`
      )}`,
      bg: 'hover:bg-[#FAF6F0] hover:border-[#7B5B3A]/40',
      labelColor: 'text-[#7B5B3A]',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="share-modal-title"
    >
      <div
        className="relative w-full max-w-[460px] bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(44,29,19,0.24)] border border-[#EDE4DC] overflow-hidden transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3 border-b border-[#F0EBE5]">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#7B5B3A]">
              SHARE WITH FRIENDS
            </span>
            <h2
              id="share-modal-title"
              className="font-serif text-lg sm:text-xl font-medium text-[#2C1D13] mt-0.5"
            >
              Share this Piece
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#EAE0D5] text-[#6B5744] hover:text-[#2C1D13] flex items-center justify-center transition-all cursor-pointer active:scale-90"
            aria-label="Close share dialog"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Product Mini Preview Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE]">
            {primaryImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={optimizeCloudinaryUrl(primaryImage, { width: 160 })}
                alt={product.name}
                className="w-14 h-18 sm:w-16 sm:h-20 rounded-xl object-cover object-top border border-black/5 shrink-0"
              />
            ) : (
              <div className="w-14 h-18 rounded-xl bg-[#EAE0D5] shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              {product.category && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#7B5B3A] block mb-0.5">
                  {product.category.name}
                </span>
              )}
              <h3 className="text-sm font-semibold text-[#2C1D13] line-clamp-1 leading-snug">
                {product.name}
              </h3>
              <p className="text-xs font-bold text-[#2C1D13] mt-1">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          {/* One-Click Copy Link Box */}
          <div>
            <label className="block text-xs font-semibold text-[#5A4535] mb-1.5 uppercase tracking-wider text-[11px]">
              Product Link
            </label>
            <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-xl border border-[#E2D5C7] bg-[#FAF8F5] focus-within:border-[#7B5B3A] focus-within:bg-white transition-all">
              <input
                type="text"
                readOnly
                value={shareUrl}
                aria-label="Product link URL"
                className="w-full text-xs text-[#2C1D13] bg-transparent border-none outline-none font-mono truncate select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  copied
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-[#2C1D13] hover:bg-[#7B5B3A] text-white shadow-xs active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <IconCheck size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <IconCopy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Channels Grid */}
          <div>
            <label className="block text-xs font-semibold text-[#5A4535] mb-2 uppercase tracking-wider text-[11px]">
              Share via
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {channels.map((ch) => (
                <a
                  key={ch.name}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border border-[#EAE2DA] bg-white transition-all cursor-pointer active:scale-95 ${ch.bg}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0">
                    {ch.icon}
                  </div>
                  <span className={`text-xs font-medium text-[#3D2B1F] truncate ${ch.labelColor}`}>
                    {ch.name}
                  </span>
                </a>
              ))}

              {/* Native device share if supported */}
              {supportsNativeShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#7B5B3A]/30 bg-[#FAF6F0] hover:bg-[#7B5B3A] hover:text-white text-[#7B5B3A] transition-all cursor-pointer active:scale-95 group"
                >
                  <IconShare size={15} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold truncate">More...</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#FAF7F2] border-t border-[#F0EBE5] flex items-center justify-center text-center">
          <p className="text-[11px] text-[#8C7B6B]">
            ZARISH • Luxury Modest Fashion by Nehala Mufeed
          </p>
        </div>
      </div>
    </div>
  );
}
