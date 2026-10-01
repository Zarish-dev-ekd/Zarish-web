'use client';

import { useMemo, useEffect } from 'react';
import {
  getDeliveryOptions,
  calculateDeliveryFee,
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
      <div className="flex items-center justify-center bg-white px-2 py-0.5 rounded-md border border-[#EADBCE] shadow-2xs shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/courier-india-post.webp"
          alt="India Post"
          loading="lazy"
          className="h-5 sm:h-6 w-auto max-w-[46px] sm:max-w-[56px] object-contain"
        />
      </div>
    );
  }

  // 2. EMS Speed Post
  if (normId.includes('speed') || normId.includes('ems')) {
    return (
      <div className="flex items-center justify-center bg-white px-2 py-0.5 rounded-md border border-[#EADBCE] shadow-2xs shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/courier-ems.jpg"
          alt="EMS Speed Post"
          loading="lazy"
          className="h-4 sm:h-5 w-auto max-w-[68px] sm:max-w-[82px] object-contain mix-blend-multiply"
        />
      </div>
    );
  }

  // 3. DTDC Express
  if (normId.includes('dtdc')) {
    return (
      <div className="flex items-center justify-center bg-white px-2 py-0.5 rounded-md border border-[#EADBCE] shadow-2xs shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/courier-dtdc.png"
          alt="DTDC Express"
          loading="lazy"
          className="h-4 sm:h-5 w-auto max-w-[70px] sm:max-w-[86px] object-contain mix-blend-multiply"
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
      <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">
        Select Courier Partner {isKerala ? '(Across Kerala)' : '(Interstate Delivery)'}
      </label>

      {/* Delivery Options: Responsive list with ample room on mobile and laptop */}
      <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
        {options.map((option: DeliveryOption) => {
          const isSelected = selectedMethod === option.id;
          const calc = calculateDeliveryFee(option.id, stateName, quantity, config);
          const isFree = calc.isBlinkingFree || calc.fee === 0;

          return (
            <div
              key={option.id}
              onClick={() => onSelectMethod(option.id)}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 sm:gap-4 ${
                isSelected
                  ? 'border-[#7B5B3A] bg-[#FAF6F0] ring-1 ring-[#7B5B3A]/25 shadow-2xs'
                  : 'border-[#E2D5C7] bg-white hover:border-[#7B5B3A]/40 hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-[#7B5B3A] bg-[#7B5B3A]' : 'border-[#C8BCB0] bg-white'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#2C1D13] leading-tight truncate uppercase tracking-tight">
                    {option.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10.5px] sm:text-xs font-medium text-[#7A6F66] mt-0.5">
                    <span>{option.deliveryTime}</span>
                    {calc.rateHint && (
                      <>
                        <span className="text-[#C8BCB0]">•</span>
                        <span className="text-[#8C6D4C] font-semibold">{calc.rateHint}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side: Official Courier Logo + Price Pill */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {renderCourierLogo(option.id)}

                {isFree ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span className="animate-pulse">FREE</span>
                  </span>
                ) : (
                  <span
                    className={`text-xs sm:text-[13px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-[#7B5B3A] text-white'
                        : 'bg-[#F2ECE4] text-[#2C1D13]'
                    }`}
                  >
                    {calc.priceLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
