'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '@/lib/types';
import {
  DEFAULT_SHIPPING_SENDER_INFO,
  getLocalShippingSender,
  saveShippingSenderLocally,
  type ShippingSenderInfo,
} from '@/lib/shipping-sender';

interface ShippingLabelPrintModalProps {
  orders: Order[];
  onClose: () => void;
}

export default function ShippingLabelPrintModal({
  orders,
  onClose,
}: ShippingLabelPrintModalProps) {
  const [senderInfo, setSenderInfo] = useState<ShippingSenderInfo>(getLocalShippingSender);

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

  const totalSheets = Math.ceil(orders.length / 4);

  return (
    <>
      {/* ─── PRINT STYLESHEET (Only active during window.print()) ─── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 5mm 4mm 5mm;
          }
          html, body {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #shipping-print-area,
          #shipping-print-area * {
            visibility: visible !important;
          }
          #shipping-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page-stack {
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            gap: 2mm !important;
            width: 100% !important;
            height: 288mm !important;
            max-height: 288mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
          }
          .print-row-container {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            height: 70mm !important;
            max-height: 70mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            background: #fff !important;
          }
          .print-row-card {
            border: 1.5px solid #111 !important;
            padding: 2.5mm 3.5mm !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
            height: 64mm !important;
            max-height: 64mm !important;
            box-sizing: border-box !important;
            background: #fff !important;
          }
          .print-cut-line {
            display: flex !important;
            align-items: center !important;
            gap: 2mm !important;
            height: 4mm !important;
            font-size: 7pt !important;
            color: #555 !important;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ─── ON-SCREEN PREVIEW MODAL ─── */}
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200 no-print">
        <div className="bg-[#FAF8F5] border border-[#E8E0D5] w-full max-w-5xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-3.5 bg-[#2C241E] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🖨️</span>
              <div>
                <h3 className="text-sm sm:text-base font-bold tracking-wide">
                  Delivery Box Shipping Labels ({orders.length} {orders.length === 1 ? 'Order' : 'Orders'})
                </h3>
                <p className="text-[11px] text-[#C4B5A5]">
                  Full-width horizontal strips &middot; Stacked 4 per A4 Sheet (25% height per order with cutting marks)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-[#E5D2BA] hover:bg-[#d8c3a9] text-[#2C241E] text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>🖨️</span>
                <span>Print Labels</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="px-5 py-2.5 bg-[#F3ECE2] border-b border-[#E8E0D5] flex items-center justify-between text-xs text-[#5C4A3C]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#2C241E]">📄 Layout:</span>
              <span>
                1 Full Row per Order (4 horizontal strips per A4 sheet with scissor cut marks) &middot; {totalSheets}{' '}
                {totalSheets === 1 ? 'A4 Sheet' : 'A4 Sheets'}
              </span>
            </div>
            <div className="text-[11px] text-[#7A6F66]">
              ✓ Prices hidden &middot; Lower 3/4 product image &middot; Ready for box seal
            </div>
          </div>

          {/* Scrollable Preview Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#EFE9E0]/50 space-y-6">
            {Array.from({ length: totalSheets }).map((_, sheetIdx) => {
              const sheetOrders = orders.slice(sheetIdx * 4, sheetIdx * 4 + 4);
              return (
                <div key={sheetIdx} className="max-w-4xl mx-auto">
                  <div className="text-[11px] font-bold text-[#7A6F66] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>A4 Sheet #{sheetIdx + 1} (Portrait)</span>
                    <span>{sheetOrders.length} / 4 Rows</span>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-[#D8C8BA] space-y-3">
                    {sheetOrders.map((order, orderIdx) => (
                      <div key={order.id}>
                        <div className="border border-black rounded-lg p-3 bg-white shadow-xs">
                          <ShippingLabelRowContent order={order} senderInfo={senderInfo} />
                        </div>
                        {/* Cut Line Mark */}
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono my-2 select-none">
                          <span className="text-xs">✂</span>
                          <div className="flex-1 border-b border-dashed border-gray-400" />
                          <span className="text-[9px] uppercase tracking-wider text-gray-400">Cut along line</span>
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
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#E8E0D5] flex items-center justify-between">
            <div className="text-xs text-[#7A6F66]">
              Tip: In print settings, select <strong>A4</strong> and set margins to <strong>Minimum / None</strong> for perfect fit.
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
                className="px-5 py-2 bg-[#2C241E] hover:bg-[#43362A] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                🖨️ Print Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PRINT ONLY CONTAINER (Attached to DOM for window.print()) ─── */}
      <div id="shipping-print-area" className="hidden">
        {Array.from({ length: totalSheets }).map((_, sheetIdx) => {
          const sheetOrders = orders.slice(sheetIdx * 4, sheetIdx * 4 + 4);
          return (
            <div key={`print-sheet-${sheetIdx}`} className="print-page-stack">
              {sheetOrders.map((order) => (
                <div key={`print-order-${order.id}`} className="print-row-container">
                  <div className="print-row-card">
                    <ShippingLabelRowContent order={order} senderInfo={senderInfo} />
                  </div>
                  <div className="print-cut-line">
                    <span>✂</span>
                    <div style={{ flex: 1, borderBottom: '1px dashed #666' }} />
                    <span style={{ fontSize: '6.5pt', textTransform: 'uppercase' }}>CUT ALONG LINE</span>
                    <div style={{ flex: 1, borderBottom: '1px dashed #666' }} />
                  </div>
                </div>
              ))}
              {/* If fewer than 4 on the last sheet, render empty boxes to keep page dimensions consistent */}
              {Array.from({ length: 4 - sheetOrders.length }).map((_, emptyIdx) => (
                <div key={`print-empty-${emptyIdx}`} className="print-row-container">
                  <div
                    className="print-row-card"
                    style={{ border: '1px dashed #ccc', opacity: 0.3 }}
                  >
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                      [ EMPTY SLOT ]
                    </div>
                  </div>
                  <div className="print-cut-line" style={{ opacity: 0.3 }}>
                    <span>✂</span>
                    <div style={{ flex: 1, borderBottom: '1px dashed #ccc' }} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── FULL-WIDTH HORIZONTAL ROW STRIP CONTENT ───
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

  const courierTitle =
    addr.deliveryMethodTitle ||
    (addr.deliveryMethod === 'speed_post'
      ? 'Speed Post'
      : addr.deliveryMethod === 'dtdc_express'
      ? 'DTDC Express'
      : 'India Post');

  const customerPhone = addr.phone || order.customer_phone || '';
  const customerName = addr.fullName || order.customer_name || 'Valued Customer';
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="w-full flex items-stretch justify-between gap-3 text-black font-sans leading-tight">
      
      {/* 1. ORDER & COURIER BADGE (Left Column ~22%) */}
      <div className="w-[22%] border-r border-gray-300 pr-2 flex flex-col justify-between">
        <div>
          <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500 block">
            ORDER NUMBER
          </span>
          <strong className="text-xs sm:text-[13px] font-mono font-black tracking-tight text-black block">
            {order.order_number}
          </strong>

          <div className="mt-1">
            <span className="inline-block px-1.5 py-0.5 rounded bg-black text-white font-bold text-[9px] uppercase tracking-wider">
              {courierTitle}
            </span>
          </div>

          {order.tracking_number && (
            <div className="text-[8.5px] font-mono text-gray-800 font-bold mt-1">
              AWB: {order.tracking_number}
            </div>
          )}
        </div>

        <div className="text-[8px] text-gray-500 font-mono pt-1">
          {orderDate} &middot; ZARISH
        </div>
      </div>

      {/* 2. FROM SENDER ADDRESS (Middle-Left Column ~25%) */}
      <div className="w-[25%] border-r border-gray-300 pr-2 flex flex-col justify-between text-[9px]">
        <div>
          <span className="font-extrabold uppercase text-[9.5px] text-black block mb-0.5 tracking-wide">
            FROM:
          </span>
          <div className="font-black text-[10.5px] text-black">
            {senderInfo?.storeName || DEFAULT_SHIPPING_SENDER_INFO.storeName}
          </div>
          <div className="text-gray-900 mt-0.5 leading-tight">
            {senderInfo?.address || DEFAULT_SHIPPING_SENDER_INFO.address}
          </div>
          {senderInfo?.customerId && (
            <div className="font-medium text-gray-800 mt-0.5">
              Customer ID: {senderInfo.customerId}
            </div>
          )}
          {senderInfo?.accountInfo && (
            <div className="font-medium text-gray-800">
              {senderInfo.accountInfo}
            </div>
          )}
        </div>

        {senderInfo?.phone && (
          <div className="font-bold text-black text-[9px] pt-1 border-t border-gray-200">
            Ph: {senderInfo.phone}
          </div>
        )}
      </div>

      {/* 3. DELIVER TO CUSTOMER (Middle-Right Column ~28%) */}
      <div className="w-[28%] border-r border-gray-300 pr-2 flex flex-col justify-between text-[9px]">
        <div>
          <span className="font-extrabold uppercase text-[9.5px] text-black block mb-0.5 tracking-wide bg-gray-100 px-1 py-0.2 rounded w-fit">
            DELIVER TO:
          </span>
          <div className="font-black text-[11px] text-black leading-snug">
            {customerName}
          </div>
          <div className="text-gray-900 mt-0.5 leading-snug">
            {addr.addressLine1 && <div>{addr.addressLine1}</div>}
            {addr.addressLine2 && <div>{addr.addressLine2}</div>}
            <div className="font-bold text-[10px] text-black mt-0.5">
              {[addr.city, addr.state, addr.postalCode ? `- ${addr.postalCode}` : '']
                .filter(Boolean)
                .join(', ')
                .replace(', -', ' -')}
            </div>
            <div>{addr.country || 'India'}</div>
          </div>
        </div>

        {customerPhone && (
          <div className="font-black text-[9.5px] text-black pt-1 border-t border-gray-200">
            Ph: {customerPhone}
          </div>
        )}
      </div>

      {/* 4. PACKED ITEMS (Right Column ~25% - NO PRICE, LOWER 3/4 IMAGE) */}
      <div className="w-[25%] flex flex-col justify-between">
        <div>
          <div className="text-[8.5px] font-bold uppercase tracking-wider text-gray-600 mb-1 flex items-center justify-between">
            <span>PACKED ITEMS</span>
            <span className="text-[7.5px] font-normal text-gray-500">Box Contents</span>
          </div>

          <div className="space-y-1">
            {order.items && order.items.length > 0 ? (
              order.items.slice(0, 2).map((it, idx) => (
                <div
                  key={it.id || idx}
                  className="flex items-center gap-1.5 bg-gray-50 p-1 rounded border border-gray-200"
                >
                  {/* Product Image: Cropped lower 3/4 (top 30% area hidden) */}
                  {it.image_url ? (
                    <div className="w-8 h-10 rounded bg-gray-200 border border-gray-300 overflow-hidden shrink-0 relative">
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
                    <div className="w-8 h-10 rounded bg-gray-200 border border-gray-300 flex items-center justify-center text-xs shrink-0">
                      👗
                    </div>
                  )}

                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="font-bold text-[9px] text-black truncate">
                      {it.product_name}
                    </div>
                    <div className="text-[8px] text-gray-700 flex items-center gap-1 mt-0.5">
                      {it.size && (
                        <span className="font-bold px-1 py-0.2 rounded bg-gray-200 text-black">
                          {it.size}
                        </span>
                      )}
                      <span className="font-extrabold text-black bg-yellow-100 px-1 py-0.2 rounded border border-yellow-300">
                        QTY: {it.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[8.5px] text-gray-500 italic">No items</div>
            )}

            {order.items && order.items.length > 2 && (
              <div className="text-[7.5px] font-bold text-gray-600 text-right">
                +{order.items.length - 2} more items
              </div>
            )}
          </div>
        </div>

        <div className="text-[7.5px] text-gray-500 font-mono text-right pt-0.5">
          SEAL &amp; DELIVER
        </div>
      </div>
    </div>
  );
}
