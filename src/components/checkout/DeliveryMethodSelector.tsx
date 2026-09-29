'use client';

import { useMemo, useEffect } from 'react';
import { getDeliveryOptions, type DeliveryMethodId, type DeliveryOption } from '@/lib/delivery';

interface DeliveryMethodSelectorProps {
  stateName: string;
  selectedMethod: DeliveryMethodId;
  onSelectMethod: (method: DeliveryMethodId) => void;
  className?: string;
}

export default function DeliveryMethodSelector({
  stateName,
  selectedMethod,
  onSelectMethod,
  className = '',
}: DeliveryMethodSelectorProps) {
  const { isKerala, options, defaultMethodId } = useMemo(
    () => getDeliveryOptions(stateName),
    [stateName]
  );

  // Automatically adjust selection if current selection is not valid for the state
  useEffect(() => {
    const isValid = options.some((opt) => opt.id === selectedMethod);
    if (!isValid) {
      onSelectMethod(defaultMethodId);
    }
  }, [options, selectedMethod, defaultMethodId, onSelectMethod]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1D13]">
          Select Courier Partner {isKerala ? '(Across Kerala)' : '(Interstate Delivery)'}
        </label>
        <span className="text-[11px] text-[#7B5B3A] font-semibold">
          {isKerala ? '3 Express Options' : 'Express National Courier'}
        </span>
      </div>

      {/* Delivery Options Grid */}
      <div className={`grid grid-cols-1 ${isKerala ? 'sm:grid-cols-3' : 'sm:grid-cols-1'} gap-3`}>
        {options.map((option: DeliveryOption) => {
          const isSelected = selectedMethod === option.id;

          return (
            <div
              key={option.id}
              onClick={() => onSelectMethod(option.id)}
              className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? 'border-[#7B5B3A] bg-[#FAF6F0] shadow-sm'
                  : 'border-[#E2D5C7] bg-white hover:border-[#7B5B3A]/50 hover:bg-[#FAF8F5]'
              }`}
            >
              {/* Top Row: Radio circle + Courier Name */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#7B5B3A] bg-[#7B5B3A]'
                        : 'border-[#D4CCC4] bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#2C1D13] leading-snug">
                    {option.name}
                  </h4>
                </div>

                {/* Blinking Green Text for Free Shipping or Price Tag */}
                {option.isBlinkingFree ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span className="animate-pulse">{option.badge || 'FREE SHIP'}</span>
                  </span>
                ) : (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#7B5B3A] text-white'
                        : 'bg-[#F2ECE4] text-[#2C1D13]'
                    }`}
                  >
                    {option.priceLabel}
                  </span>
                )}
              </div>

              {/* Bottom Row: Delivery Transit Time */}
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#EFE9E1] text-[#6E6259]">
                <span className="text-[11px] font-medium text-[#7A6F66]">Delivery:</span>
                <span className="text-[11px] font-bold text-[#2C1D13] bg-white px-2 py-0.5 rounded-md border border-[#E8E0D5]">
                  {option.deliveryTime}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
