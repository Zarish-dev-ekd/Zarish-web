'use client';

import { useMemo, useEffect } from 'react';
import {
  getDeliveryOptions,
  calculateDeliveryFee,
  getEstimatedDeliveryDates,
  type DeliveryMethodId,
  type DeliveryOption,
  type DeliveryConfig,
} from '@/lib/delivery';

interface DeliveryMethodSelectorProps {
  stateName: string;
  selectedMethod: DeliveryMethodId;
  onSelectMethod: (method: DeliveryMethodId) => void;
  className?: string;
  config?: DeliveryConfig | null;
  quantity?: number;
}

function renderCourierLogo(id: string) {
  const normId = id.toLowerCase();

  // 1. India Post Parcel
  if (normId.includes('india_post') || normId.includes('parcel')) {
    return (
      <div className="flex items-center justify-center bg-white px-1.5 py-0.5 rounded border border-[#EADBCE] shadow-2xs shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/courier-india-post.webp"
          alt="India Post"
          loading="lazy"
          className="h-4 sm:h-5 w-auto max-w-[42px] sm:max-w-[48px] object-contain"
        />
      </div>
    );
  }

  // 2. EMS Speed Post
  if (normId.includes('speed') || normId.includes('ems')) {
    return (
      <div className="flex items-center justify-center bg-white px-1.5 py-0.5 rounded border border-[#EADBCE] shadow-2xs shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/courier-ems.jpg"
          alt="EMS Speed Post"
          loading="lazy"
          className="h-3.5 sm:h-4 w-auto max-w-[58px] sm:max-w-[68px] object-contain mix-blend-multiply"
        />
      </div>
    );
  }

  // 3. DTDC Express
  if (normId.includes('dtdc')) {
    return (
      <div className="flex items-center justify-center bg-white px-1.5 py-0.5 rounded border border-[#EADBCE] shadow-2xs shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/courier-dtdc.png"
          alt="DTDC Express"
          loading="lazy"
          className="h-3.5 sm:h-4 w-auto max-w-[58px] sm:max-w-[70px] object-contain mix-blend-multiply"
        />
      </div>
    );
  }

  return null;
}

export default function DeliveryMethodSelector({
  stateName,
  selectedMethod,
  onSelectMethod,
  className = '',
  config,
  quantity = 1,
}: DeliveryMethodSelectorProps) {
  const { isKerala, options, defaultMethodId } = useMemo(
    () => getDeliveryOptions(stateName, config),
    [stateName, config]
  );

  // Automatically adjust selection if current selection is not valid for the state
  useEffect(() => {
    const isValid = options.some((opt) => opt.id === selectedMethod);
    if (!isValid) {
      onSelectMethod(defaultMethodId);
    }
  }, [options, selectedMethod, defaultMethodId, onSelectMethod]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#3D2B1F]">
          Shipping method {isKerala ? '(Across Kerala)' : '(Interstate)'}
        </label>
        <span className="text-[11px] text-[#8C7B6B]">Estimated delivery dates</span>
      </div>

      {/* Unified clean card with dividers — matching Shopify / high-converting checkout */}
      <div className="border border-[#E2D5C7] rounded-xl overflow-hidden divide-y divide-[#EADECF] bg-white shadow-2xs">
        {options.map((option: DeliveryOption) => {
          const isSelected = selectedMethod === option.id;
          const calc = calculateDeliveryFee(option.id, stateName, quantity, config);
          const isFree = calc.isBlinkingFree || calc.fee === 0;

          // Compute dynamic delivery estimates
          const minDays =
            option.minDays ||
            (option.id.includes('parcel') ? 3 : option.id.includes('dtdc') ? 1 : 1);
          const maxDays =
            option.maxDays ||
            (option.id.includes('parcel') ? 5 : option.id.includes('dtdc') ? 2 : 3);
          const estimate = getEstimatedDeliveryDates(minDays, maxDays);

          const LEGACY_NOTES = new Set([
            'Ships next day',
            'Ships same day(until 4pm IST)',
            'Fast reliable delivery',
          ]);
          const customNote =
            option.defaultNote && !LEGACY_NOTES.has(option.defaultNote)
              ? option.defaultNote
              : null;

          const dispatchSubtext =
            customNote ||
            (option.id.includes('dtdc')
              ? 'Same-day shipping until 5pm IST.'
              : option.id.includes('speed') || option.id.includes('ems')
                ? 'Fast service, convenient home delivery.'
                : 'Reliable doorstep delivery');

          return (
            <div
              key={option.id}
              onClick={() => onSelectMethod(option.id)}
              className={`p-3 sm:p-3.5 transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                isSelected
                  ? 'bg-[#FAF6F0] ring-1 ring-inset ring-[#7B5B3A]/30'
                  : 'bg-white hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Radio Circle */}
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected ? 'border-[#7B5B3A] bg-[#7B5B3A]' : 'border-[#C8BCB0] bg-white'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div className="min-w-0 space-y-0.5">
                  {/* Courier / Method Name */}
                  <div className="text-xs sm:text-[13px] font-semibold text-[#2C1D13] leading-snug">
                    {option.name}
                  </div>

                  {/* Dynamic Calendar Date Range */}
                  <div className="text-[11px] sm:text-xs font-bold text-[#2C1D13]">
                    {estimate.dateRangeText}
                  </div>

                  {/* Dispatch note */}
                  <div className="text-[10px] sm:text-[11px] text-[#7A6F66]">
                    {dispatchSubtext}
                  </div>
                </div>
              </div>

              {/* Right side: Price + Courier Logo */}
              <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                <div className="text-xs sm:text-[13px] font-bold text-[#2C1D13]">
                  {isFree ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      FREE
                    </span>
                  ) : (
                    <span>{calc.priceLabel}</span>
                  )}
                </div>

                {renderCourierLogo(option.id)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
