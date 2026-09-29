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
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">
        Select Courier Partner {isKerala ? '(Across Kerala)' : '(Interstate Delivery)'}
      </label>

      {/* Delivery Options Grid (Compact & Simple) */}
      <div className={`grid grid-cols-1 ${isKerala ? 'sm:grid-cols-3' : 'sm:grid-cols-1'} gap-2`}>
        {options.map((option: DeliveryOption) => {
          const isSelected = selectedMethod === option.id;

          return (
            <div
              key={option.id}
              onClick={() => onSelectMethod(option.id)}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 ${
                isSelected
                  ? 'border-[#7B5B3A] bg-[#FAF6F0] ring-1 ring-[#7B5B3A]/25 shadow-2xs'
                  : 'border-[#E2D5C7] bg-white hover:border-[#7B5B3A]/40 hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#7B5B3A] bg-[#7B5B3A]' : 'border-[#C8BCB0] bg-white'
                  }`}
                >
                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#2C1D13] leading-tight truncate">
                    {option.name}
                  </h4>
                  <span className="text-[10.5px] font-medium text-[#7A6F66] block leading-tight mt-0.5">
                    {option.deliveryTime}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {option.isBlinkingFree ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span className="animate-pulse">FREE</span>
                  </span>
                ) : (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-[#7B5B3A] text-white'
                        : 'bg-[#F2ECE4] text-[#2C1D13]'
                    }`}
                  >
                    {option.priceLabel}
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
