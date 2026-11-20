'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Order } from '@/lib/types';
import {
  DEFAULT_SHIPPING_SENDER_INFO,
  getLocalShippingSender,
  saveShippingSenderLocally,
  type ShippingSenderInfo,
} from '@/lib/shipping-sender';
import BarcodeSvg from '@/components/admin/BarcodeSvg';

interface ShippingLabelPrintModalProps {
  orders: Order[];
  onClose: () => void;
}

export type ShippingLabelPaperFormat = 'thermal_4x6' | 'a4_sheet';

const FORMAT_STORAGE_KEY = 'zarish_shipping_label_format_v1';

export const isConfirmedPaidOrder = (order: Order): boolean => {
  const isPaid = order.payment_status?.toLowerCase() === 'paid';
  const isConfirmedStatus = ['confirmed', 'processing', 'shipped'].includes(
    order.order_status?.toLowerCase()
  );
  return (isPaid || isConfirmedStatus) && order.order_status?.toLowerCase() !== 'cancelled';
};

export default function ShippingLabelPrintModal({
  orders,
  onClose,
}: ShippingLabelPrintModalProps) {
  const [senderInfo, setSenderInfo] = useState<ShippingSenderInfo>(getLocalShippingSender);
  const [paperFormat, setPaperFormat] = useState<ShippingLabelPaperFormat>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(FORMAT_STORAGE_KEY);
        if (saved === 'a4_sheet' || saved === 'thermal_4x6') return saved;
      } catch {}
    }
    return 'thermal_4x6';
  });
  const [mounted, setMounted] = useState(false);

  const confirmedOrders = orders.filter(isConfirmedPaidOrder);
  const pendingOrders = orders.filter((o) => !isConfirmedPaidOrder(o));
  const hasPending = pendingOrders.length > 0;

  // Default to confirmed only if any confirmed order is present
  const [filterConfirmedOnly, setFilterConfirmedOnly] = useState<boolean>(() => {
    return confirmedOrders.length > 0;
  });

  const activeOrders =
    filterConfirmedOnly && confirmedOrders.length > 0 ? confirmedOrders : orders;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFormatChange = (fmt: ShippingLabelPaperFormat) => {
    setPaperFormat(fmt);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FORMAT_STORAGE_KEY, fmt);
      } catch {}
    }
  };

  // Load latest sender address from server on modal open
  useEffect(() => {
    fetch('/api/shipping-sender-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.senderInfo) {
          setSenderInfo(data.senderInfo);
          saveShippingSenderLocally(data.senderInfo);
        }
      })
      .catch(() => {});
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const totalSheets = Math.ceil(activeOrders.length / 4);

  return (
    <>
      {/* ─── DYNAMIC PRINT STYLESHEET (Active during window.print()) ─── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: ${paperFormat === 'thermal_4x6' ? '100mm 150mm' : 'A4 portrait'};
              margin: ${paperFormat === 'thermal_4x6' ? '0mm' : '4mm 6mm'};
            }

            @media print {
              /* Hide all application chrome and screen elements */
              body > *:not(#shipping-print-portal) {
                display: none !important;
              }

              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: ${paperFormat === 'thermal_4x6' ? '100mm' : '100%'} !important;
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
                background: #ffffff !important;
                color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              #shipping-print-portal {
                display: block !important;
                position: static !important;
                width: ${paperFormat === 'thermal_4x6' ? '100mm' : '100%'} !important;
                max-width: ${paperFormat === 'thermal_4x6' ? '100mm' : '100%'} !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                box-sizing: border-box !important;
              }

              /* ── 4"x6" Thermal Format Styles (100mm x 150mm) ── */
              .print-thermal-card {
                width: 100mm !important;
                max-width: 100mm !important;
                height: 148mm !important;
                max-height: 148mm !important;
                margin: 0 !important;
                padding: 3mm 3.5mm !important;
                border: 2px solid #000000 !important;
                box-sizing: border-box !important;
                overflow: hidden !important;
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                background: #ffffff !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }

              .print-thermal-card:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
              }

              /* ── A4 Sheet Format Styles (4 horizontal strips per page) ── */
              .print-page-stack {
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                width: 100% !important;
                height: 286mm !important;
                max-height: 286mm !important;
                page-break-after: always !important;
                break-after: page !important;
                box-sizing: border-box !important;
                padding: 0 !important;
                margin: 0 !important;
              }

              .print-page-stack:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
              }

              .print-row-container {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                width: 100% !important;
                height: 69mm !important;
                max-height: 69mm !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
              }

              .print-row-card {
                border: 1.5px solid #111111 !important;
                border-radius: 4px !important;
                padding: 2.5mm 3.5mm !important;
                width: 100% !important;
                height: 64mm !important;
                max-height: 64mm !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
                display: flex !important;
                flex-direction: row !important;
                align-items: stretch !important;
              }

              .print-cut-line {
                display: flex !important;
                align-items: center !important;
                gap: 2mm !important;
                height: 4mm !important;
                font-size: 7pt !important;
                color: #555555 !important;
                box-sizing: border-box !important;
                width: 100% !important;
              }

              .print-cut-dash {
                flex: 1 !important;
                border-bottom: 1px dashed #666666 !important;
                height: 0 !important;
              }

              .print-cut-text {
                font-size: 6.5pt !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                font-family: monospace !important;
                color: #555555 !important;
              }

              .no-print {
                display: none !important;
              }
            }

            @media screen {
              #shipping-print-portal {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* ─── ON-SCREEN PREVIEW MODAL ─── */}
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200 no-print">
        <div className="bg-[#FAF8F5] border border-[#E8E0D5] w-full max-w-5xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 bg-[#2C241E] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🖨️</span>
              <div>
                <h3 className="text-sm sm:text-base font-bold tracking-wide">
                  Delivery Box Shipping Labels ({activeOrders.length}{' '}
                  {activeOrders.length === 1 ? 'Order' : 'Orders'})
                </h3>
                <p className="text-[11px] text-[#C4B5A5]">
                  Select label size &middot; Compatible with 4&quot;&times;6&quot; Helett thermal roll &amp; A4 paper
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Paper Format Switcher Toggle */}
              <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => handleFormatChange('thermal_4x6')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paperFormat === 'thermal_4x6'
                      ? 'bg-[#E5D2BA] text-[#2C241E] shadow-sm'
                      : 'text-[#E8E0D5] hover:text-white hover:bg-white/10'
                  }`}
                  title="Direct Thermal roll format (4x6 inch / 100x150mm) for Helett and thermal label printers"
                >
                  <span>🏷️</span>
                  <span>4&quot;&times;6&quot; Thermal</span>
                  <span className="text-[9.5px] opacity-75 hidden md:inline font-mono">
                    (100&times;150mm)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatChange('a4_sheet')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paperFormat === 'a4_sheet'
                      ? 'bg-[#E5D2BA] text-[#2C241E] shadow-sm'
                      : 'text-[#E8E0D5] hover:text-white hover:bg-white/10'
                  }`}
                  title="Standard A4 sheet with 4 horizontal strips and scissor cutting lines"
                >
                  <span>📄</span>
                  <span>A4 Sheet</span>
                  <span className="text-[9.5px] opacity-75 hidden md:inline font-mono">
                    (4 per page)
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-[#E5D2BA] hover:bg-[#d8c3a9] text-[#2C241E] text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>🖨️</span>
                <span>Print {paperFormat === 'thermal_4x6' ? '4"×6" Roll' : 'A4 Sheets'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold shrink-0"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Safety Shield Banner if Unpaid/Pending Orders Present */}
          {hasPending && (
            <div className="px-5 py-2.5 bg-[#FEF3C7] border-b border-[#FDE68A] flex items-center justify-between text-xs text-[#92400E] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <div>
                  <span className="font-bold">Safety Shield Active:</span>{' '}
                  <span>
                    {filterConfirmedOnly
                      ? `Excluded ${pendingOrders.length} unpaid/pending order(s) so they are not accidentally dispatched.`
                      : `⚠️ Warning: Showing all orders including ${pendingOrders.length} unpaid/pending order(s).`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFilterConfirmedOnly(!filterConfirmedOnly)}
                className="px-2.5 py-1 rounded bg-[#B45309] hover:bg-[#92400E] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
              >
                {filterConfirmedOnly
                  ? `Include Pending (${orders.length})`
                  : `Filter to Confirmed (${confirmedOrders.length})`}
              </button>
            </div>
          )}

          {/* Info Banner */}
          <div className="px-5 py-2.5 bg-[#F3ECE2] border-b border-[#E8E0D5] flex items-center justify-between text-xs text-[#5C4A3C] flex-wrap gap-2">
            {paperFormat === 'thermal_4x6' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2C241E]">🏷️ Format:</span>
                  <span>
                    Direct Thermal 4&quot;&times;6&quot; (100&times;150mm) &middot; 1 Sticker per Order &middot;
                    Perfect fit for Helett / Zebra thermal printers &middot; {activeOrders.length}{' '}
                    {activeOrders.length === 1 ? 'Sticker' : 'Stickers'}
                  </span>
                </div>
                <div className="text-[11px] text-[#7A6F66]">
                  ✓ Continuous roll &middot; Scannable barcode &middot; Garment photos &amp; size &middot; Prices hidden
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2C241E]">📄 Format:</span>
                  <span>
                    1 Full Row per Order (4 horizontal strips per A4 sheet with scissor cut marks) &middot;{' '}
                    {totalSheets} {totalSheets === 1 ? 'A4 Sheet' : 'A4 Sheets'}
                  </span>
                </div>
                <div className="text-[11px] text-[#7A6F66]">
                  ✓ Prices hidden &middot; Lower 3/4 product image &middot; 100% A4 width fit
                </div>
              </>
            )}
          </div>

          {/* Scrollable Preview Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#EFE9E0]/50 space-y-6">
            {paperFormat === 'thermal_4x6' ? (
              /* ── 4"x6" Thermal Sticker Roll Preview ── */
              <div className="max-w-xl mx-auto space-y-6">
                {activeOrders.map((order, idx) => (
                  <div key={order.id || idx} className="flex flex-col items-center">
                    <div className="w-full max-w-[100mm] text-[11px] font-bold text-[#7A6F66] uppercase tracking-wider mb-1.5 flex items-center justify-between px-1">
                      <span>
                        🏷️ Sticker #{idx + 1} of {activeOrders.length} (4&quot;&times;6&quot; Thermal Roll)
                      </span>
                      <span className="font-mono text-black">#{order.order_number}</span>
                    </div>

                    <div className="w-[100mm] min-h-[148mm] max-w-[100mm] bg-white rounded-md p-3.5 shadow-md border-2 border-black box-border">
                      <ShippingLabelThermalContent order={order} senderInfo={senderInfo} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── A4 Sheet (4 per page) Preview ── */
              Array.from({ length: totalSheets }).map((_, sheetIdx) => {
                const sheetOrders = activeOrders.slice(sheetIdx * 4, sheetIdx * 4 + 4);
                return (
                  <div key={sheetIdx} className="max-w-4xl mx-auto">
                    <div className="text-[11px] font-bold text-[#7A6F66] uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>A4 Sheet #{sheetIdx + 1} (Portrait)</span>
                      <span>{sheetOrders.length} / 4 Rows</span>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-[#D8C8BA] space-y-3">
                      {sheetOrders.map((order) => (
                        <div key={order.id}>
                          <div className="border border-black rounded-lg p-3 bg-white shadow-xs">
                            <ShippingLabelRowContent order={order} senderInfo={senderInfo} />
                          </div>
                          {/* Cut Line Mark */}
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono my-2 select-none">
                            <span className="text-xs">✂</span>
                            <div className="flex-1 border-b border-dashed border-gray-400" />
                            <span className="text-[9px] uppercase tracking-wider text-gray-400">
                              Cut along line
                            </span>
                            <div className="flex-1 border-b border-dashed border-gray-400" />
                          </div>
                        </div>
                      ))}

                      {/* Empty placeholder rows if less than 4 on sheet */}
                      {Array.from({ length: 4 - sheetOrders.length }).map((_, emptyIdx) => (
                        <div key={`empty-${emptyIdx}`}>
                          <div className="border border-dashed border-[#D8C8BA] rounded-lg p-4 flex items-center justify-center text-xs text-[#A89F95] italic bg-[#FAF8F5]/50 h-24">
                            [ Empty Row Slot - Next Order ]
                          </div>
                          {emptyIdx < 4 - sheetOrders.length - 1 && (
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono my-2 select-none">
                              <span className="text-xs">✂</span>
                              <div className="flex-1 border-b border-dashed border-gray-300" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#E8E0D5] flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-[#7A6F66]">
              {paperFormat === 'thermal_4x6' ? (
                <>
                  Tip: In printer settings, select paper size <strong>4&quot;&times;6&quot; (100&times;150mm)</strong> and margins to <strong>None / Minimum</strong> for direct roll printing.
                </>
              ) : (
                <>
                  Tip: In print settings, select <strong>A4</strong> and set margins to <strong>Minimum / None</strong> for perfect edge-to-edge fit.
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 bg-[#2C241E] hover:bg-[#43362A] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <span>🖨️</span>
                <span>Print {paperFormat === 'thermal_4x6' ? '4"×6" Thermal' : 'A4 Sheets'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PRINT ONLY PORTAL (Direct body child during window.print()) ─── */}
      {mounted &&
        createPortal(
          <div id="shipping-print-portal" aria-hidden="true">
            {paperFormat === 'thermal_4x6' ? (
              /* ── 4"x6" Thermal Format: 1 Sticker per Order ── */
              activeOrders.map((order, idx) => (
                <div key={`print-thermal-${order.id || idx}`} className="print-thermal-card">
                  <ShippingLabelThermalContent order={order} senderInfo={senderInfo} />
                </div>
              ))
            ) : (
              /* ── A4 Sheet Format: 4 Orders per Sheet ── */
              Array.from({ length: totalSheets }).map((_, sheetIdx) => {
                const sheetOrders = activeOrders.slice(sheetIdx * 4, sheetIdx * 4 + 4);
                return (
                  <div key={`print-sheet-${sheetIdx}`} className="print-page-stack">
                    {sheetOrders.map((order) => (
                      <div key={`print-order-${order.id}`} className="print-row-container">
                        <div className="print-row-card">
                          <ShippingLabelRowContent order={order} senderInfo={senderInfo} />
                        </div>
                        <div className="print-cut-line">
                          <span>✂</span>
                          <div className="print-cut-dash" />
                          <span className="print-cut-text">CUT ALONG LINE</span>
                          <div className="print-cut-dash" />
                        </div>
                      </div>
                    ))}
                    {/* If fewer than 4 on the last sheet, render empty boxes to keep sheet dimensions consistent */}
                    {Array.from({ length: 4 - sheetOrders.length }).map((_, emptyIdx) => (
                      <div key={`print-empty-${emptyIdx}`} className="print-row-container">
                        <div
                          className="print-row-card"
                          style={{ border: '1px dashed #bbb', opacity: 0.35 }}
                        >
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-mono tracking-wider">
                            [ EMPTY SLOT — RESERVED FOR NEXT ORDER ]
                          </div>
                        </div>
                        <div className="print-cut-line" style={{ opacity: 0.3 }}>
                          <span>✂</span>
                          <div className="print-cut-dash" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}
    </>
  );
}

// ─── 4"x6" (100x150mm) VERTICAL THERMAL STICKER CONTENT ───
function ShippingLabelThermalContent({
  order,
  senderInfo,
}: {
  order: Order;
  senderInfo: ShippingSenderInfo;
}) {
  const addr =
    typeof order.shipping_address === 'string'
      ? (() => {
          try {
            return JSON.parse(order.shipping_address);
          } catch {
            return {};
          }
        })()
      : order.shipping_address || {};

  const rawCourierTitle =
    addr.deliveryMethodTitle ||
    (addr.deliveryMethod === 'speed_post'
      ? 'Speed Post'
      : addr.deliveryMethod === 'dtdc_express'
      ? 'DTDC Express'
      : 'India Post Parcel');

  // Remove duration mentions like "(3-5 days)", "(3-5 Days)", "- 3-5 days"
  const courierTitle = rawCourierTitle
    .replace(/\s*\([^)]*(?:day|days|date|business|working|approx|hrs|hours)[^)]*\)/gi, '')
    .replace(/\s*-\s*\d+[\s\d\-–—]*(?:days|working days|business days)/gi, '')
    .replace(/\s*\b\d+\s*-\s*\d+\s*(?:days|day)\b/gi, '')
    .trim();

  const customerPhone = addr.phone || order.customer_phone || '';
  const customerName = addr.fullName || order.customer_name || 'Valued Customer';
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const barcodeValue = (order.tracking_number || order.order_number || '').trim();
  const isPaid = isConfirmedPaidOrder(order);

  return (
    <div className="w-full h-full flex flex-col justify-between text-black font-sans leading-tight">
      {/* UNPAID / PENDING WARNING IF FORCED TO PRINT */}
      {!isPaid && (
        <div className="bg-amber-100 border border-amber-600 text-amber-950 font-black text-[8px] uppercase tracking-wider py-0.5 px-1 text-center rounded-2xs mb-1">
          ⚠️ UNPAID / PAYMENT PENDING — VERIFY BEFORE SHIPPING
        </div>
      )}

      {/* ── 1. HEADER: BRAND LOGO + COURIER + ORDER NUMBER ── */}
      <div className="border-b-2 border-black pb-1.5 flex items-start justify-between">
        <div className="flex flex-col">
          {/* Zarish Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-zarish.png"
            alt="ZARISH"
            className="h-5.5 w-auto object-contain max-w-[100px] mb-0.5"
          />
          <span className="text-[7.5px] uppercase tracking-widest font-black text-gray-800">
            BY NEHALA MUFEED
          </span>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="inline-block px-2 py-0.5 rounded-xs bg-black text-white font-black text-[9px] uppercase tracking-wider">
            {courierTitle}
          </span>
          <span className="text-[12px] font-mono font-black text-black tracking-tight mt-0.5">
            #{order.order_number}
          </span>
          <span className="text-[8.5px] text-gray-600 font-mono">{orderDate}</span>
        </div>
      </div>

      {/* ── 2. FROM (SENDER RETURN ADDRESS) ── */}
      <div className="border-b border-black py-1.5 text-[9px] leading-snug">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-black uppercase text-[7.5px] text-white bg-black px-1.5 py-0.2 rounded-xs tracking-wider">
            FROM:
          </span>
          <strong className="text-[9.5px] font-black text-black tracking-tight">
            ZARISH BY NEHALA MUFEED
          </strong>
        </div>
        <div className="text-gray-900 font-medium leading-tight">
          {senderInfo?.address || DEFAULT_SHIPPING_SENDER_INFO.address}
        </div>
        <div className="flex items-center gap-2 text-[8.5px] font-bold text-gray-800 mt-0.5">
          <span>Customer ID: {senderInfo?.customerId || DEFAULT_SHIPPING_SENDER_INFO.customerId}</span>
          <span>&bull;</span>
          <span>{senderInfo?.accountInfo || DEFAULT_SHIPPING_SENDER_INFO.accountInfo}</span>
        </div>
        <div className="text-[8.5px] font-black text-black mt-0.5">
          Mob: 9562292945 / {senderInfo?.phone || DEFAULT_SHIPPING_SENDER_INFO.phone}
        </div>
      </div>

      {/* ── 3. DELIVER TO (RECIPIENT ADDRESS - HIGH CONTRAST) ── */}
      <div className="border-b-2 border-black py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="font-black uppercase text-[8.5px] text-black bg-gray-200 border border-gray-400 px-1.5 py-0.5 rounded-xs tracking-wider">
            DELIVER TO (RECIPIENT):
          </span>
          {order.tracking_number && (
            <span className="text-[8.5px] font-mono font-bold text-gray-700">
              AWB: {order.tracking_number}
            </span>
          )}
        </div>

        <div className="text-[15.5px] font-black text-black leading-tight tracking-tight">
          {customerName}
        </div>

        <div className="mt-1 space-y-0.5 text-black">
          {addr.addressLine1 && (
            <div className="font-extrabold text-[12px] leading-tight break-words">
              {addr.addressLine1}
            </div>
          )}
          {addr.addressLine2 && (
            <div className="font-extrabold text-[12px] leading-tight break-words">
              {addr.addressLine2}
            </div>
          )}
          <div className="font-bold text-[12px] leading-tight">
            {[addr.city, addr.state].filter(Boolean).join(', ')}
          </div>
        </div>

        {/* PINCODE & PHONE ROW */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {addr.postalCode ? (
            <div className="flex items-center gap-1.5 bg-black text-white px-2 py-0.5 rounded-xs">
              <span className="text-[8.5px] font-bold uppercase tracking-wider">PINCODE:</span>
              <span className="text-[16px] font-mono font-black tracking-widest leading-none">
                {addr.postalCode}
              </span>
            </div>
          ) : null}

          {customerPhone && (
            <div className="text-[11px] font-black text-black bg-gray-100 border border-black/40 px-2 py-0.5 rounded-xs tracking-wide">
              Ph: <span className="font-mono">{customerPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. PACKED ITEMS (GARMENT PHOTO, SIZE, COLOR & QTY) ── */}
      <div className="border-b border-black py-1.5 flex-1 min-h-0 flex flex-col justify-start">
        <div className="text-[8px] font-black uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
          <span>PACKED ITEMS (VERIFY CONTENTS):</span>
          <span className="text-[7.5px] font-normal text-gray-500">Box Contents &bull; Prices Hidden</span>
        </div>

        <div className="space-y-1 overflow-hidden">
          {order.items && order.items.length > 0 ? (
            order.items.slice(0, 3).map((it, idx) => {
              const itemColor =
                (it as any).color || (it as any).color_name || (it as any).variant_color || null;
              return (
                <div
                  key={it.id || idx}
                  className="bg-gray-50 p-1.5 rounded-xs border border-gray-300"
                >
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="font-black text-[10px] text-black truncate leading-tight">
                      {it.quantity}x {it.product_name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {it.size && (
                        <span className="font-mono font-black px-1.5 py-0.2 rounded-2xs bg-black text-white text-[8.5px]">
                          SIZE: {it.size}
                        </span>
                      )}
                      {itemColor && (
                        <span className="font-bold px-1.5 py-0.2 rounded-2xs bg-gray-200 text-black border border-gray-300 text-[8px]">
                          COLOR: {itemColor}
                        </span>
                      )}
                      <span className="font-extrabold text-black bg-amber-100 px-1.5 py-0.2 rounded-2xs border border-amber-300 text-[8px]">
                        QTY: {it.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-[8.5px] text-gray-500 italic">No item details</div>
          )}

          {order.items && order.items.length > 3 && (
            <div className="text-[8px] font-bold text-gray-700 text-right">
              +{order.items.length - 3} more items packed
            </div>
          )}
        </div>
      </div>

      {/* ── 5. BARCODE & FOOTER ── */}
      <div className="pt-1 flex flex-col items-center justify-center text-center">
        {barcodeValue && (
          <div className="w-full flex flex-col items-center justify-center">
            <BarcodeSvg
              value={barcodeValue}
              width={1.6}
              height={26}
              className="max-w-[240px] h-7"
            />
            <span className="text-[9px] font-mono font-bold tracking-widest text-black mt-0.5">
              {barcodeValue}
            </span>
          </div>
        )}
        <div className="text-[7.5px] font-mono uppercase text-gray-500 tracking-wider mt-0.5">
          ZARISH LUXURY APPAREL &middot; HANDLE WITH CARE
        </div>
      </div>
    </div>
  );
}

// ─── FULL-WIDTH HORIZONTAL ROW STRIP CONTENT (FOR A4 SHEETS) ───
function ShippingLabelRowContent({
  order,
  senderInfo,
}: {
  order: Order;
  senderInfo: ShippingSenderInfo;
}) {
  const addr =
    typeof order.shipping_address === 'string'
      ? (() => {
          try {
            return JSON.parse(order.shipping_address);
          } catch {
            return {};
          }
        })()
      : order.shipping_address || {};

  const rawCourierTitle =
    addr.deliveryMethodTitle ||
    (addr.deliveryMethod === 'speed_post'
      ? 'Speed Post'
      : addr.deliveryMethod === 'dtdc_express'
      ? 'DTDC Express'
      : 'India Post Parcel');

  // Remove duration mentions like "(3-5 days)", "(3-5 Days)", "- 3-5 days"
  const courierTitle = rawCourierTitle
    .replace(/\s*\([^)]*(?:day|days|date|business|working|approx|hrs|hours)[^)]*\)/gi, '')
    .replace(/\s*-\s*\d+[\s\d\-–—]*(?:days|working days|business days)/gi, '')
    .replace(/\s*\b\d+\s*-\s*\d+\s*(?:days|day)\b/gi, '')
    .trim();

  const customerPhone = addr.phone || order.customer_phone || '';
  const customerName = addr.fullName || order.customer_name || 'Valued Customer';
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const isPaid = isConfirmedPaidOrder(order);

  return (
    <div className="w-full h-full flex items-stretch text-black font-sans leading-tight">
      {/* 1. ORDER & COURIER BADGE (Left Column ~21%) */}
      <div className="w-[21%] border-r border-gray-300 pr-3.5 flex flex-col justify-start shrink-0 box-border">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
            ORDER NUMBER
          </span>
          <strong className="text-[15px] font-mono font-black tracking-tight text-black block truncate mt-0.5">
            {order.order_number}
          </strong>

          {!isPaid && (
            <div className="mt-1 bg-amber-100 border border-amber-500 text-amber-900 text-[7.5px] font-black uppercase tracking-wider px-1 py-0.2 rounded-2xs inline-block">
              ⚠️ PENDING PAYMENT
            </div>
          )}

          <div className="mt-2">
            <span className="inline-block px-2.5 py-0.5 rounded bg-black text-white font-bold text-[9.5px] uppercase tracking-wider">
              {courierTitle}
            </span>
          </div>

          {order.tracking_number && (
            <div className="mt-2 inline-block bg-gray-100 border border-gray-300 px-2 py-0.5 rounded text-[9.5px] font-mono text-gray-900 font-bold truncate max-w-full">
              AWB: {order.tracking_number}
            </div>
          )}

          <div className="text-[9px] text-gray-500 font-mono mt-3 pt-2 border-t border-gray-100">
            {orderDate} &middot; ZARISH
          </div>
        </div>
      </div>

      {/* 2. FROM SENDER ADDRESS & LOGO (Middle-Left Column ~27%) */}
      <div className="w-[27%] border-r border-gray-300 px-3.5 flex flex-col justify-start text-[10px] shrink-0 box-border">
        <div>
          {/* FROM Header Tag */}
          <div className="pb-1 border-b border-gray-200">
            <span className="font-black uppercase text-[9px] text-white bg-black px-2 py-0.5 rounded tracking-wide inline-block">
              FROM:
            </span>
          </div>

          <div className="mt-1.5">
            {/* Zarish Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-zarish.png"
              alt="ZARISH"
              className="h-5.5 w-auto object-contain max-w-[100px] mb-1.5"
            />
            <div className="text-gray-900 leading-snug text-[9.5px] line-clamp-3 font-medium">
              {senderInfo?.address || DEFAULT_SHIPPING_SENDER_INFO.address}
            </div>
            {senderInfo?.customerId && (
              <div className="font-bold text-gray-800 mt-1 text-[9px] truncate">
                Customer ID: {senderInfo.customerId}
              </div>
            )}
            {senderInfo?.accountInfo && (
              <div className="font-bold text-gray-800 text-[9px] truncate">
                {senderInfo.accountInfo}
              </div>
            )}
            <div className="font-black text-black text-[9.5px] mt-1.5">
              Mob: 9562292945 / {senderInfo?.phone || DEFAULT_SHIPPING_SENDER_INFO.phone}
            </div>
          </div>
        </div>
      </div>

      {/* 3. DELIVER TO CUSTOMER (Middle-Right Column ~28%) */}
      <div className="w-[28%] border-r border-gray-300 px-3.5 flex flex-col justify-start shrink-0 box-border">
        <div>
          <span className="font-black uppercase text-[10px] text-black bg-gray-200 px-2 py-0.5 rounded tracking-wider inline-block">
            DELIVER TO:
          </span>
          <div className="font-black text-[15.5px] text-black leading-snug tracking-tight truncate mt-1">
            {customerName}
          </div>
          <div className="text-black mt-1 leading-snug space-y-0.5">
            {addr.addressLine1 && (
              <div className="font-extrabold text-[12px] text-black break-words leading-tight">
                {addr.addressLine1}
              </div>
            )}
            {addr.addressLine2 && (
              <div className="font-extrabold text-[12px] text-black break-words leading-tight">
                {addr.addressLine2}
              </div>
            )}
            <div className="font-black text-[13px] text-black tracking-tight mt-1 leading-tight">
              {[addr.city, addr.state, addr.postalCode ? `- ${addr.postalCode}` : '']
                .filter(Boolean)
                .join(', ')
                .replace(', -', ' -')}
            </div>
            <div className="font-bold text-gray-800 text-[10.5px]">{addr.country || 'India'}</div>
            {customerPhone && (
              <div className="font-black text-[12.5px] text-black mt-1.5 inline-block bg-gray-100 border border-gray-400 px-2 py-0.5 rounded tracking-wide">
                Ph: {customerPhone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. PACKED ITEMS (Right Column ~24%) */}
      <div className="w-[24%] pl-3.5 flex flex-col justify-start shrink-0 box-border">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-gray-700 pb-1 border-b border-gray-200 flex items-center justify-between">
            <span>PACKED ITEMS</span>
            <span className="text-[8px] font-normal text-gray-500">Box Contents</span>
          </div>

          <div className="space-y-1.5 mt-1.5">
            {order.items && order.items.length > 0 ? (
              order.items.slice(0, 2).map((it, idx) => {
                const itemColor =
                  (it as any).color || (it as any).color_name || (it as any).variant_color || null;
                return (
                  <div
                    key={it.id || idx}
                    className="flex items-center gap-2 bg-gray-50 p-1.5 rounded border border-gray-200"
                  >
                    {/* Product Image: Cropped lower 3/4 */}
                    {it.image_url ? (
                      <div className="w-10 h-12 rounded bg-gray-200 border border-gray-300 overflow-hidden shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={it.image_url}
                          alt={it.product_name}
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition: 'center 75%',
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-12 rounded bg-gray-200 border border-gray-300 flex items-center justify-center text-xs shrink-0">
                        👗
                      </div>
                    )}

                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="font-bold text-[9.5px] text-black truncate">
                        {it.product_name}
                      </div>
                      <div className="text-[8.5px] text-gray-700 flex items-center gap-1 mt-1 flex-wrap">
                        {it.size && (
                          <span className="font-bold px-1.5 py-0.5 rounded bg-gray-200 text-black text-[8px]">
                            {it.size}
                          </span>
                        )}
                        {itemColor && (
                          <span className="font-bold px-1.5 py-0.5 rounded bg-gray-200 text-black border border-gray-300 text-[8px]">
                            {itemColor}
                          </span>
                        )}
                        <span className="font-extrabold text-black bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-400 text-[8px]">
                          QTY: {it.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-[9px] text-gray-500 italic">No items</div>
            )}

            {order.items && order.items.length > 2 && (
              <div className="text-[8px] font-bold text-gray-600 text-right">
                +{order.items.length - 2} more items
              </div>
            )}
          </div>

          <div className="text-[8px] text-gray-400 font-mono text-right mt-2">
            SEAL &amp; DELIVER
          </div>
        </div>
      </div>
    </div>
  );
}
