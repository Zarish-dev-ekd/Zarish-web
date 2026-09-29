'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { IconX } from '@/components/icons';
import { getDefaultSizeChartRows, getEffectiveProductSizeChart, getSizeGuideConfig } from '@/lib/sizeChart';
import type { Product, SiteSettings, SizeMeasurementRow } from '@/lib/types';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'chart' | 'measure';
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
  availableSizes?: { id: string; name: string; inStock: boolean }[];
  product?: Product;
  settings?: SiteSettings | null;
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  initialTab = 'chart',
  selectedSize,
  onSelectSize,
  availableSizes = [],
  product,
  settings,
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'measure'>(initialTab);
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  // Dynamically resolve measurement rows: Custom product size chart OR Global Default Size Chart
  const measurementRows = useMemo(() => {
    const globalDefaults = getDefaultSizeChartRows(settings);
    const resolved = getEffectiveProductSizeChart(product, globalDefaults);
    return resolved.rows;
  }, [product, settings]);

  // Dynamically resolve How-to-Measure graphic settings
  const guideConfig = useMemo(() => {
    return getSizeGuideConfig(settings);
  }, [settings]);

  const modelImageUrl = guideConfig.imageUrl;

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialTab]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatMeasurement = (inches: number) => {
    if (unit === 'cm') {
      return (inches * 2.54).toFixed(1);
    }
    return inches.toFixed(1);
  };

  const hasWaist = measurementRows.some((r) => r.waistIn && r.waistIn > 0);
  const hasHips = measurementRows.some((r) => r.hipsIn && r.hipsIn > 0);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-[#1A120B]/65 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-modal-title"
    >
      <div
        className="bg-[#FFFFFF] rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-[0_25px_60px_-15px_rgba(44,29,19,0.3)] border border-[#E8E0D5] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 pt-6 pb-4 border-b border-[#EFE9E1] flex items-center justify-between bg-white relative">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8B6B4A] block mb-1">
              ZARISH ATELIER
            </span>
            <h2 id="size-guide-modal-title" className="font-serif text-2xl sm:text-[26px] text-[#2C1D13] font-normal tracking-wide m-0">
              Size & Fit Guide
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#6E6259] hover:text-[#2C1D13] flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-[#E8E0D5]"
            aria-label="Close size guide"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Mobile Tab Switcher & Unit Bar (sm:hidden) */}
        <div className="sm:hidden px-4 pt-3 pb-2.5 bg-[#FAF7F2] border-b border-[#EFE9E1]">
          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#EAE2D7] rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('chart')}
              className={`py-2 px-3 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chart'
                  ? 'bg-[#2C1D13] text-white shadow-xs'
                  : 'text-[#5C4D42] hover:text-[#2C1D13] font-semibold'
              }`}
            >
              <span>Size Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('measure')}
              className={`py-2 px-3 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'measure'
                  ? 'bg-[#2C1D13] text-white shadow-xs'
                  : 'text-[#5C4D42] hover:text-[#2C1D13] font-semibold'
              }`}
            >
              <span>How to Measure</span>
            </button>
          </div>

          {/* Unit Toggle & Helper row (Size Chart only) */}
          {activeTab === 'chart' && (
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#EAE3DA]">
              <span className="text-[11px] text-[#6E6259]">
                Unit: <strong className="text-[#2C1D13]">{unit === 'in' ? 'Inches (in)' : 'Centimeters (cm)'}</strong>
              </span>
              <div className="inline-flex items-center bg-[#F2ECE4] p-0.5 rounded-full border border-[#D8CABE]">
                <button
                  type="button"
                  onClick={() => setUnit('in')}
                  className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    unit === 'in'
                      ? 'bg-[#2C1D13] text-white shadow-xs'
                      : 'text-[#6E6259] hover:text-[#2C1D13]'
                  }`}
                >
                  in
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    unit === 'cm'
                      ? 'bg-[#2C1D13] text-white shadow-xs'
                      : 'text-[#6E6259] hover:text-[#2C1D13]'
                  }`}
                >
                  cm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Tab Switcher & Unit Toggle (hidden sm:flex - unchanged) */}
        <div className="hidden sm:flex px-6 pt-3 pb-2 border-b border-[#EFE9E1] items-center justify-between bg-[#FCFAF8] gap-3">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              type="button"
              onClick={() => setActiveTab('chart')}
              className={`relative pb-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'chart'
                  ? 'text-[#2C1D13]'
                  : 'text-[#8C7B6B] hover:text-[#2C1D13]'
              }`}
            >
              <span>Size Chart</span>
              {activeTab === 'chart' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7B5B3A] rounded-full animate-in fade-in duration-200" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('measure')}
              className={`relative pb-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'measure'
                  ? 'text-[#2C1D13]'
                  : 'text-[#8C7B6B] hover:text-[#2C1D13]'
              }`}
            >
              <span>How to Measure</span>
              {activeTab === 'measure' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7B5B3A] rounded-full animate-in fade-in duration-200" />
              )}
            </button>
          </div>

          {/* Unit Toggle (in / cm) - only for size chart */}
          {activeTab === 'chart' && (
            <div className="inline-flex items-center bg-[#F2ECE4] p-0.5 rounded-full border border-[#E2D5C7]">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  unit === 'in'
                    ? 'bg-[#2C1D13] text-white shadow-xs'
                    : 'text-[#6E6259] hover:text-[#2C1D13]'
                }`}
              >
                in
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  unit === 'cm'
                    ? 'bg-[#2C1D13] text-white shadow-xs'
                    : 'text-[#6E6259] hover:text-[#2C1D13]'
                }`}
              >
                cm
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FFFFFF]">
          {activeTab === 'chart' ? (
            /* TAB 1: EDITORIAL SIZE CHART TABLE */
            <div className="space-y-4 sm:space-y-5">
              <div className="hidden sm:flex items-center justify-between text-xs text-[#7A6F66]">
                <span>
                  Measurements shown in <strong className="text-[#2C1D13]">{unit === 'in' ? 'inches (in)' : 'centimeters (cm)'}</strong>.
                </span>
                <span className="text-[11px] text-[#8B6B4A]">
                  Click a row to select your size
                </span>
              </div>
              <div className="sm:hidden flex items-center justify-between text-[11px] text-[#7A6F66]">
                <span className="text-[#8B6B4A] font-medium">
                  Tap any row below to select your size:
                </span>
              </div>

              <div className="border border-[#E8E0D5] rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#E8E0D5] text-[11px] font-bold text-[#6E6259] uppercase tracking-[0.08em]">
                        <th className="py-3.5 px-4 w-12 text-center"></th>
                        <th className="py-3.5 px-4">Size</th>
                        <th className="py-3.5 px-4">Bust ({unit})</th>
                        <th className="py-3.5 px-4">Length ({unit})</th>
                        {hasWaist && <th className="py-3.5 px-4">Waist ({unit})</th>}
                        {hasHips && <th className="py-3.5 px-4">Hips ({unit})</th>}
                        <th className="py-3.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE9E1] text-xs sm:text-sm">
                      {measurementRows.map((row) => {
                        const isCurrentSelected =
                          selectedSize?.trim().toUpperCase() === row.size.toUpperCase();
                        
                        const matchedVariantSize = availableSizes.find(
                          (s) => s.name.toUpperCase() === row.size.toUpperCase()
                        );
                        const isAvailable = matchedVariantSize ? matchedVariantSize.inStock : true;

                        return (
                          <tr
                            key={row.size}
                            onClick={() => {
                              if (onSelectSize && isAvailable) {
                                onSelectSize(row.size);
                              }
                            }}
                            className={`group transition-all cursor-pointer ${
                              isCurrentSelected
                                ? 'bg-[#FAF4ED] font-semibold text-[#2C1D13]'
                                : isAvailable
                                ? 'hover:bg-[#FAF7F2] text-[#3D2B1F]'
                                : 'opacity-50 hover:bg-transparent cursor-not-allowed text-[#9CA3AF]'
                            }`}
                          >
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center">
                                <div
                                  className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                                    isCurrentSelected
                                      ? 'border-[#7B5B3A] bg-[#7B5B3A]'
                                      : 'border-[#D4CCC4] bg-white group-hover:border-[#7B5B3A]'
                                  }`}
                                >
                                  {isCurrentSelected && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[#2C1D13] tracking-wide">
                              {row.size}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-medium text-[#4A3B30]">
                              {formatMeasurement(row.bustIn)}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-medium text-[#4A3B30]">
                              {formatMeasurement(row.lengthIn)}
                            </td>
                            {hasWaist && (
                              <td className="py-3.5 px-4 font-mono font-medium text-[#4A3B30]">
                                {row.waistIn ? formatMeasurement(row.waistIn) : '—'}
                              </td>
                            )}
                            {hasHips && (
                              <td className="py-3.5 px-4 font-mono font-medium text-[#4A3B30]">
                                {row.hipsIn ? formatMeasurement(row.hipsIn) : '—'}
                              </td>
                            )}
                            <td className="py-3.5 px-4 text-right">
                              {matchedVariantSize && !isAvailable ? (
                                <span className="text-[11px] font-medium text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full">
                                  Out of stock
                                </span>
                              ) : isCurrentSelected ? (
                                <span className="text-[11px] font-bold text-[#7B5B3A] uppercase tracking-wider bg-[#F5ECE1] px-2.5 py-0.5 rounded-full">
                                  Selected
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-[#16A34A] opacity-0 group-hover:opacity-100 transition-opacity">
                                  Select Size
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sizing Recommendation Note */}
              <div className="bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 text-xs text-[#5C4D42]">
                <span className="w-5 h-5 rounded-full bg-[#F2ECE4] border border-[#E2D5C7] flex items-center justify-center text-[#7B5B3A] shrink-0 text-xs">
                  ✦
                </span>
                <p className="leading-relaxed m-0 text-xs text-[#5C4D42] font-medium">
                  If you are between two sizes, we recommend choosing the larger size for a more graceful drape.
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: HOW TO MEASURE GUIDE (IMAGE ONLY) */
            <div className="flex flex-col items-center justify-center py-1 sm:py-2">
              <div className="relative w-full max-w-xl h-[65vh] min-h-[350px] max-h-[560px] bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] p-3 sm:p-5 shadow-xs overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={modelImageUrl}
                    alt="How to Measure Guide"
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 600px"
                    className="object-contain object-center"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#EFE9E1] bg-[#FCFAF8] flex items-center justify-between gap-4">
          <div className="text-xs text-[#6E6259]">
            {selectedSize ? (
              <span className="flex items-center gap-1.5">
                <span>Selected Fit:</span>
                <strong className="text-[#2C1D13] font-bold text-sm bg-white border border-[#E8E0D5] px-2.5 py-0.5 rounded-md shadow-2xs">
                  {selectedSize}
                </strong>
              </span>
            ) : (
              <span>Select your size to apply to cart</span>
            )}
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#2C1D13] hover:bg-[#422C1D] text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xs active:scale-98"
          >
            {selectedSize ? 'Apply & Close' : 'Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
}
