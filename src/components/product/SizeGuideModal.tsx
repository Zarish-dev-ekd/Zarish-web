'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { IconX, IconRuler, IconTapeMeasure } from '@/components/icons';
import { getDefaultSizeChartRows, getEffectiveProductSizeChart } from '@/lib/sizeChart';
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
  const [highlightedPoint, setHighlightedPoint] = useState<'bust' | 'waist' | 'hips' | 'length' | null>(null);

  // Dynamically resolve measurement rows: Custom product size chart OR Global Default Size Chart
  const measurementRows = useMemo(() => {
    const globalDefaults = getDefaultSizeChartRows(settings);
    const resolved = getEffectiveProductSizeChart(product, globalDefaults);
    return resolved.rows;
  }, [product, settings]);

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

          {/* Unit Toggle & Helper row */}
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

          {/* Unit Toggle (in / cm) */}
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

              {/* Bespoke Sizing Note */}
              <div className="bg-[#FAF7F2] border border-[#E8E0D5] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#6E6259]">
                <span className="w-5 h-5 rounded-full bg-[#F2ECE4] border border-[#E2D5C7] flex items-center justify-center text-[#7B5B3A] shrink-0 mt-0.5 text-xs">
                  ✦
                </span>
                <div>
                  <h4 className="font-bold text-[#2C1D13] mb-0.5">Atelier Fit Recommendation</h4>
                  <p className="leading-relaxed m-0">
                    Zarish garments are designed for an elegant, modest drape. If your measurements fall between standard sizes, we recommend choosing the larger size for the most graceful silhouette.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: REALISTIC HIGH-FASHION ILLUSTRATION HOW TO MEASURE GUIDE */
            <div className="space-y-6">
              <div>
                <p className="text-xs sm:text-sm text-[#6E6259] m-0">
                  Follow the guidelines below with a soft measuring tape. Hover or tap each measurement step to highlight the guide on the figure:
                </p>
              </div>

              {/* High-Fashion Realistic Silhouette Guide Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-[#FAF8F5] border border-[#E8E0D5] rounded-2xl p-5 sm:p-6">
                
                {/* Visual Model Graphic Column */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-44 sm:w-52 h-[340px] sm:h-[370px] bg-white rounded-2xl border border-[#EFE9E1] p-2 shadow-xs overflow-hidden flex items-center justify-center">
                    {/* Realistic High-Fashion Model Illustration */}
                    <div className="relative w-full h-full">
                      <Image
                        src="/size-guide-model.jpg"
                        alt="Body Measurement Guide Model"
                        fill
                        priority
                        className="object-contain object-center"
                      />

                      {/* SVG Dynamic Overlay Guidelines over Model */}
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 200 370"
                        preserveAspectRatio="none"
                      >
                        {/* 1. BUST GUIDELINE (at 30% height) */}
                        <g className={`transition-opacity duration-300 ${highlightedPoint === 'bust' || !highlightedPoint ? 'opacity-100' : 'opacity-35'}`}>
                          <line
                            x1="35"
                            y1="110"
                            x2="165"
                            y2="110"
                            stroke="#E11D48"
                            strokeWidth={highlightedPoint === 'bust' ? '2.5' : '1.75'}
                            strokeDasharray="4 3"
                          />
                          <circle cx="100" cy="110" r="3.5" fill="#E11D48" />
                        </g>

                        {/* 2. WAIST GUIDELINE (at 37% height) */}
                        <g className={`transition-opacity duration-300 ${highlightedPoint === 'waist' || !highlightedPoint ? 'opacity-100' : 'opacity-35'}`}>
                          <line
                            x1="45"
                            y1="138"
                            x2="155"
                            y2="138"
                            stroke="#E11D48"
                            strokeWidth={highlightedPoint === 'waist' ? '2.5' : '1.75'}
                            strokeDasharray="4 3"
                          />
                          <circle cx="100" cy="138" r="3.5" fill="#E11D48" />
                        </g>

                        {/* 3. HIPS GUIDELINE (at 46% height) */}
                        <g className={`transition-opacity duration-300 ${highlightedPoint === 'hips' || !highlightedPoint ? 'opacity-100' : 'opacity-35'}`}>
                          <line
                            x1="40"
                            y1="172"
                            x2="160"
                            y2="172"
                            stroke="#E11D48"
                            strokeWidth={highlightedPoint === 'hips' ? '2.5' : '1.75'}
                            strokeDasharray="4 3"
                          />
                          <circle cx="100" cy="172" r="3.5" fill="#E11D48" />
                        </g>

                        {/* 4. LENGTH GUIDELINE (Vertical from neck/shoulder to hemline) */}
                        {highlightedPoint === 'length' && (
                          <g className="transition-opacity duration-300">
                            <line
                              x1="70"
                              y1="75"
                              x2="70"
                              y2="340"
                              stroke="#7B5B3A"
                              strokeWidth="2"
                              strokeDasharray="4 3"
                            />
                            <circle cx="70" cy="75" r="3" fill="#7B5B3A" />
                            <circle cx="70" cy="340" r="3" fill="#7B5B3A" />
                          </g>
                        )}
                      </svg>

                      {/* On-model floating badges */}
                      <div
                        className={`absolute top-[28%] right-1 transition-all transform ${
                          highlightedPoint === 'bust' ? 'scale-110' : ''
                        }`}
                      >
                        <span className="text-[10px] font-bold text-[#E11D48] bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs border border-[#FECDD3]">
                          1. Bust
                        </span>
                      </div>

                      <div
                        className={`absolute top-[35.5%] right-1 transition-all transform ${
                          highlightedPoint === 'waist' ? 'scale-110' : ''
                        }`}
                      >
                        <span className="text-[10px] font-bold text-[#E11D48] bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs border border-[#FECDD3]">
                          2. Waist
                        </span>
                      </div>

                      <div
                        className={`absolute top-[44.5%] right-1 transition-all transform ${
                          highlightedPoint === 'hips' ? 'scale-110' : ''
                        }`}
                      >
                        <span className="text-[10px] font-bold text-[#E11D48] bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs border border-[#FECDD3]">
                          3. Hips
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step-by-step Interactive Guide Cards */}
                <div className="sm:col-span-7 space-y-3 text-xs">
                  {/* Step 1: Bust */}
                  <div
                    onMouseEnter={() => setHighlightedPoint('bust')}
                    onMouseLeave={() => setHighlightedPoint(null)}
                    onClick={() => setHighlightedPoint(highlightedPoint === 'bust' ? null : 'bust')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      highlightedPoint === 'bust'
                        ? 'bg-white border-[#E11D48] shadow-xs'
                        : 'bg-white/80 border-[#E8E0D5] hover:border-[#D6CEC5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-[#FFE4E6] text-[#E11D48] font-bold text-[10px] flex items-center justify-center">
                        01
                      </span>
                      <h4 className="font-bold text-[#2C1D13] text-xs uppercase tracking-wide">
                        Bust Measurement
                      </h4>
                    </div>
                    <p className="text-[#6E6259] leading-relaxed pl-7 m-0">
                      Wrap the measuring tape around the fullest part of your bust, keeping the tape level and parallel to the floor.
                    </p>
                  </div>

                  {/* Step 2: Waist */}
                  <div
                    onMouseEnter={() => setHighlightedPoint('waist')}
                    onMouseLeave={() => setHighlightedPoint(null)}
                    onClick={() => setHighlightedPoint(highlightedPoint === 'waist' ? null : 'waist')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      highlightedPoint === 'waist'
                        ? 'bg-white border-[#E11D48] shadow-xs'
                        : 'bg-white/80 border-[#E8E0D5] hover:border-[#D6CEC5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-[#FFE4E6] text-[#E11D48] font-bold text-[10px] flex items-center justify-center">
                        02
                      </span>
                      <h4 className="font-bold text-[#2C1D13] text-xs uppercase tracking-wide">
                        Waist Measurement
                      </h4>
                    </div>
                    <p className="text-[#6E6259] leading-relaxed pl-7 m-0">
                      Measure around your natural waistline (the narrowest curve of your torso, typically right above your navel).
                    </p>
                  </div>

                  {/* Step 3: Hips */}
                  <div
                    onMouseEnter={() => setHighlightedPoint('hips')}
                    onMouseLeave={() => setHighlightedPoint(null)}
                    onClick={() => setHighlightedPoint(highlightedPoint === 'hips' ? null : 'hips')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      highlightedPoint === 'hips'
                        ? 'bg-white border-[#E11D48] shadow-xs'
                        : 'bg-white/80 border-[#E8E0D5] hover:border-[#D6CEC5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-[#FFE4E6] text-[#E11D48] font-bold text-[10px] flex items-center justify-center">
                        03
                      </span>
                      <h4 className="font-bold text-[#2C1D13] text-xs uppercase tracking-wide">
                        Hips Measurement
                      </h4>
                    </div>
                    <p className="text-[#6E6259] leading-relaxed pl-7 m-0">
                      Stand upright with feet together. Wrap the measuring tape around the fullest point of your hips and seat.
                    </p>
                  </div>

                  {/* Step 4: Garment Length */}
                  <div
                    onMouseEnter={() => setHighlightedPoint('length')}
                    onMouseLeave={() => setHighlightedPoint(null)}
                    onClick={() => setHighlightedPoint(highlightedPoint === 'length' ? null : 'length')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      highlightedPoint === 'length'
                        ? 'bg-white border-[#7B5B3A] shadow-xs'
                        : 'bg-white/80 border-[#E8E0D5] hover:border-[#D6CEC5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-[#F5ECE1] text-[#7B5B3A] font-bold text-[10px] flex items-center justify-center">
                        04
                      </span>
                      <h4 className="font-bold text-[#2C1D13] text-xs uppercase tracking-wide">
                        Front Length
                      </h4>
                    </div>
                    <p className="text-[#6E6259] leading-relaxed pl-7 m-0">
                      Measured vertically from the highest point of the shoulder down along the front to the bottom hemline.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tailor Tip */}
              <div className="bg-[#FAF7F2] border border-[#E8E0D5] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#6E6259]">
                <IconTapeMeasure size={20} className="text-[#7B5B3A] shrink-0" />
                <p className="m-0 leading-relaxed">
                  <strong className="text-[#2C1D13]">Pro Sizing Tip:</strong> Always keep the measuring tape comfortably snug but never tight against your skin. For the most accurate fit, measure directly over lightweight undergarments.
                </p>
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
