'use client';

import React, { useState } from 'react';
import type { Order, ShippingAddress } from '@/lib/types';
import type { STORE_SENDER_CONFIG } from '@/lib/indiapost';
import BarcodeSvg from '@/components/admin/BarcodeSvg';

interface LabelPrintClientProps {
  order: Order;
  addr: ShippingAddress;
  trackingBarcode: string;
  isSpeedPost: boolean;
  serviceLabel: string;
  sender: typeof STORE_SENDER_CONFIG;
}

export default function LabelPrintClient({
  order,
  addr,
  trackingBarcode,
  isSpeedPost,
  serviceLabel,
  sender,
}: LabelPrintClientProps) {
  const [paperFormat, setPaperFormat] = useState<'a6' | 'a4'>('a6');

  const customerName = addr.fullName || order.customer_name || 'Customer';
  const customerPhone = addr.phone || order.customer_phone || '';
  const bookingDate = new Date(order.created_at).toLocaleDateString('en-GB');

  return (
    <div className="min-h-screen bg-[#F4EFEA] p-4 sm:p-8 flex flex-col items-center justify-start print:p-0 print:m-0 print:bg-white print:min-h-0 print:block">
      {/* ─── DYNAMIC PRINT MEDIA QUERY ─── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: ${paperFormat === 'a6' ? '100mm 150mm' : 'A4 portrait'};
              margin: ${paperFormat === 'a6' ? '0mm' : '8mm 10mm'};
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                width: ${paperFormat === 'a6' ? '100mm' : '100%'} !important;
                height: auto !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              header, aside, nav, .print\\:hidden, #admin-header, #admin-sidebar {
                display: none !important;
              }
              .no-print {
                display: none !important;
              }
              #print-container-a6 {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100mm !important;
                max-width: 100mm !important;
                height: 148mm !important;
                max-height: 148mm !important;
                margin: 0 !important;
                padding: 3.5mm !important;
                border: 2px solid #000000 !important;
                box-sizing: border-box !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
              }
              #print-container-a4 {
                display: block !important;
                width: 100% !important;
                max-width: 190mm !important;
                margin: 0 auto !important;
                padding: 0 !important;
                border: none !important;
                box-sizing: border-box !important;
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
            }
          `,
        }}
      />

      {/* ─── TOP CONTROLS BAR (Hidden during printing) ─── */}
      <div className="w-full max-w-[620px] mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden bg-white p-3.5 rounded-xl border border-[#E8E0D5] shadow-xs">
        <a
          href="/admin/orders"
          className="text-xs font-semibold text-[#7B5B3A] hover:text-[#2C1D13] flex items-center gap-1.5 transition-colors"
        >
          ← Back to Orders
        </a>

        {/* Paper Format Switcher */}
        <div className="flex items-center gap-1 bg-[#F4EFEA] p-1 rounded-lg border border-[#E8E0D5]">
          <button
            type="button"
            onClick={() => setPaperFormat('a6')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              paperFormat === 'a6'
                ? 'bg-[#C4161C] text-white shadow-xs'
                : 'text-[#5C4A3C] hover:text-[#2C1D13]'
            }`}
          >
            🏷️ A6 Thermal (4"×6")
          </button>
          <button
            type="button"
            onClick={() => setPaperFormat('a4')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              paperFormat === 'a4'
                ? 'bg-[#C4161C] text-white shadow-xs'
                : 'text-[#5C4A3C] hover:text-[#2C1D13]'
            }`}
          >
            📄 A4 Sheet (+ Post Office Receipt)
          </button>
        </div>

        {/* Print Trigger Button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 bg-[#C4161C] hover:bg-[#A31217] text-white px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span>Print {paperFormat.toUpperCase()}</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 1. FORMAT: A6 THERMAL LABEL (100mm x 150mm)                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {paperFormat === 'a6' && (
        <div
          id="print-container-a6"
          className="w-[100mm] min-h-[148mm] max-w-[420px] bg-white border-2 border-black rounded-sm p-3.5 flex flex-col justify-between text-[#111] shadow-md print:shadow-none print:border-black print:m-0 print:p-3"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          {/* Header: Official Emblem + Service Badge */}
          <div className="border-b-2 border-black pb-2 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/india-post-logo.webp"
                  alt="India Post"
                  className="h-11 w-auto object-contain max-w-[130px]"
                />
                <div className="border-l border-black/40 pl-2">
                  <span className="text-[12px] font-black tracking-wider block text-black leading-tight uppercase">
                    Department of Posts
                  </span>
                  <span className="text-[9px] font-semibold text-gray-600 block tracking-tight">
                    Govt. of India
                  </span>
                </div>
              </div>

              <div className="text-right">
                {isSpeedPost ? (
                  <div className="flex flex-col items-end">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/courier-ems.jpg"
                      alt="EMS Speed Post"
                      className="h-5 w-auto object-contain mb-0.5"
                    />
                    <span className="inline-block bg-black text-white text-[11px] font-black px-2 py-0.5 rounded-xs tracking-wider uppercase">
                      SPEED POST
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="inline-block bg-black text-white text-[12px] font-black px-2.5 py-0.5 rounded-xs tracking-wider uppercase">
                      BUSINESS PARCEL
                    </span>
                    <span className="block text-[9px] font-semibold text-gray-600 mt-0.5">
                      DOMESTIC EXPRESS
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Barcode Section */}
          <div className="border-b-2 border-black pb-2 mb-2 text-center">
            <div className="flex justify-center items-center py-1">
              <BarcodeSvg
                value={trackingBarcode}
                width={2}
                height={46}
                className="w-full max-w-[280px] h-12"
              />
            </div>
            <span className="text-[14px] font-mono font-black tracking-widest block text-black mt-0.5">
              {trackingBarcode}
            </span>
            <span className="text-[10px] text-gray-600 block">
              Ref: {order.order_number}
            </span>
          </div>

          {/* Delivery / To Section */}
          <div className="border-b-2 border-black pb-3 mb-2">
            <span className="text-[10px] font-black uppercase text-gray-700 tracking-wider block mb-1">
              DELIVER TO (RECIPIENT):
            </span>
            <h2 className="text-[15px] font-black text-black leading-snug">
              {customerName}
            </h2>
            <p className="text-[12px] font-bold text-black mt-0.5 leading-tight">
              {addr.addressLine1}
              {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
            </p>
            <p className="text-[12px] font-bold text-black leading-tight mt-0.5">
              {addr.city}, {addr.state}
            </p>
            <div className="mt-1.5 flex items-baseline justify-between bg-black text-white px-2 py-1 rounded-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider">PINCODE:</span>
              <span className="text-[18px] font-mono font-black tracking-wider">
                {addr.postalCode}
              </span>
            </div>
            {customerPhone && (
              <p className="text-[11px] font-bold text-black mt-1">
                Phone: <span className="font-mono">{customerPhone}</span>
              </p>
            )}
          </div>

          {/* Return Address Section */}
          <div className="border-b border-gray-400 pb-2 mb-2 text-[10px] text-gray-800 leading-snug">
            <span className="font-black text-black uppercase tracking-wider block mb-0.5">
              IF UNDELIVERED, RETURN TO:
            </span>
            <p className="font-bold text-black">{sender.name}</p>
            <p>{sender.addressLine1}, {sender.addressLine2}</p>
            <p>{sender.city}, {sender.state} — PIN: <strong>{sender.pincode}</strong></p>
            <p>Mob: {sender.mobile} • {sender.email}</p>
          </div>

          {/* Booking Details Grid */}
          <div className="text-[9px] text-gray-700 border-t border-gray-300 pt-1 flex justify-between items-center">
            <div>
              <span>Booking Office: <strong>{sender.bookingOfficeName}</strong></span>
              <span className="block">Date: {bookingDate}</span>
            </div>
            <div className="text-right">
              <span>Payment Mode: <strong>PREPAID (ONLINE)</strong></span>
              <span className="block font-bold text-black">Total: ₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 2. FORMAT: A4 SHEET (Box Shipping Label + Post Office Counterfoil) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {paperFormat === 'a4' && (
        <div
          id="print-container-a4"
          className="w-full max-w-[210mm] bg-white border border-[#E8E0D5] rounded-sm p-6 sm:p-8 flex flex-col text-[#111] shadow-lg print:shadow-none print:border-none print:p-0"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          {/* Sheet Header Instructions */}
          <div className="text-center pb-3 border-b border-gray-300 mb-4 print:pb-1 print:mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#C4161C]">
              INDIA POST DOMESTIC DISPATCH CONSIGNMENT NOTE
            </span>
            <span className="block text-[9px] text-gray-500">
              Department of Posts • Government of India • E-Commerce Portal Integration
            </span>
          </div>

          {/* TOP HALF: BOX PARCEL LABEL */}
          <div className="border-2 border-black rounded-sm p-4 bg-white mb-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/india-post-logo.webp"
                  alt="India Post"
                  className="h-12 w-auto object-contain max-w-[140px]"
                />
                <div className="border-l-2 border-black/50 pl-2.5">
                  <span className="text-[13px] font-black tracking-wider block text-black uppercase">
                    Department of Posts
                  </span>
                  <span className="text-[9px] font-semibold text-gray-700 block">
                    Government of India
                  </span>
                </div>
              </div>

              <div className="text-right">
                {isSpeedPost ? (
                  <div className="flex flex-col items-end">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/courier-ems.jpg"
                      alt="EMS Speed Post"
                      className="h-6 w-auto object-contain mb-1"
                    />
                    <span className="bg-black text-white text-[11px] font-black px-2.5 py-0.5 rounded-xs tracking-wider uppercase">
                      SPEED POST
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="inline-block bg-black text-white text-[13px] font-black px-3 py-1 rounded-xs tracking-wider uppercase">
                      BUSINESS PARCEL
                    </span>
                    <span className="block text-[9px] font-bold text-gray-700 mt-0.5">
                      DOMESTIC EXPRESS
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Barcode Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-b-2 border-black pb-3 mb-3">
              <div className="text-center sm:text-left">
                <div className="flex justify-start items-center py-1">
                  <BarcodeSvg
                    value={trackingBarcode}
                    width={2}
                    height={46}
                    className="w-full max-w-[260px] h-12"
                  />
                </div>
                <span className="text-[15px] font-mono font-black tracking-widest block text-black">
                  {trackingBarcode}
                </span>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E2D5C7] p-2.5 rounded-xs text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Reference:</span>
                  <strong className="font-mono">{order.order_number}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <strong>{bookingDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <strong className="text-emerald-700">PREPAID (₹{order.total_amount})</strong>
                </div>
              </div>
            </div>

            {/* Recipient & Sender Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-700 tracking-wider block mb-1">
                  DELIVER TO (RECIPIENT):
                </span>
                <h3 className="text-[16px] font-black text-black leading-snug">
                  {customerName}
                </h3>
                <p className="text-[12px] font-bold text-black mt-0.5 leading-snug">
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                </p>
                <p className="text-[12px] font-bold text-black leading-snug mt-0.5">
                  {addr.city}, {addr.state}
                </p>
                <div className="mt-2 inline-flex items-baseline gap-2 bg-black text-white px-3 py-1 rounded-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider">PINCODE:</span>
                  <span className="text-[19px] font-mono font-black tracking-wider">
                    {addr.postalCode}
                  </span>
                </div>
                {customerPhone && (
                  <p className="text-[11px] font-bold text-black mt-1.5">
                    Phone: <span className="font-mono">{customerPhone}</span>
                  </p>
                )}
              </div>

              <div className="border-t sm:border-t-0 sm:border-l sm:pl-4 border-gray-300">
                <span className="text-[10px] font-black uppercase text-gray-700 tracking-wider block mb-1">
                  IF UNDELIVERED, RETURN TO:
                </span>
                <p className="text-[13px] font-black text-black">{sender.name}</p>
                <p className="text-[11px] text-gray-800 leading-snug mt-0.5">
                  {sender.addressLine1}, {sender.addressLine2}
                </p>
                <p className="text-[11px] text-gray-800 leading-snug">
                  {sender.city}, {sender.state} — PIN: <strong>{sender.pincode}</strong>
                </p>
                <p className="text-[11px] text-gray-800 leading-snug mt-1">
                  Mob: <strong>{sender.mobile}</strong>
                </p>
                <p className="text-[10px] text-gray-600">Email: {sender.email}</p>

                <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-600">
                  <span>Booking Office: <strong>{sender.bookingOfficeName}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* ✂ CUTTING LINE DIVIDER ✂ */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t-2 border-dashed border-gray-400" />
            </div>
            <div className="relative bg-white px-4 text-gray-500 text-[11px] font-mono flex items-center gap-1.5 uppercase tracking-wider">
              <span>✂</span>
              <span>Cut along dotted line & paste top label onto parcel</span>
              <span>✂</span>
            </div>
          </div>

          {/* BOTTOM HALF: OFFICIAL SENDER BOOKING RECEIPT / COUNTERFOIL */}
          <div className="border border-black rounded-sm p-4 bg-[#FCFBF8] text-[11px]">
            <div className="flex items-center justify-between border-b border-black pb-2 mb-3">
              <div>
                <span className="text-[13px] font-black tracking-wide text-black block">
                  DEPARTMENT OF POSTS — SENDER BOOKING RECEIPT (COUNTERFOIL)
                </span>
                <span className="text-[9px] text-gray-600 block">
                  Customer Copy • Retain as proof of posting • Tracking: www.indiapost.gov.in
                </span>
              </div>
              <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-xs tracking-wider uppercase">
                {serviceLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {/* Col 1: Consignment Info */}
              <div className="space-y-1.5">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Article Consignment No:</span>
                  <strong className="text-[14px] font-mono font-black text-black block">{trackingBarcode}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Order Ref:</span>
                  <span className="font-mono font-semibold">{order.order_number}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Booking Office:</span>
                  <span className="font-semibold">{sender.bookingOfficeName} ({sender.bookingOfficePin})</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Booking Date:</span>
                  <span>{bookingDate}</span>
                </div>
              </div>

              {/* Col 2: Destination & Charges */}
              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-4 border-gray-300">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Recipient Destination:</span>
                  <strong className="block text-black">{customerName}</strong>
                  <span className="text-gray-700 block">{addr.city}, {addr.state}</span>
                  <span className="font-mono font-bold text-black block">PIN: {addr.postalCode}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Declared Order Value:</span>
                  <strong className="text-black">₹{order.total_amount} (Prepaid)</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Sender Name:</span>
                  <span>{sender.name} ({sender.mobile})</span>
                </div>
              </div>

              {/* Col 3: Postal Round Stamp Box & Clerk Signature */}
              <div className="border-t sm:border-t-0 sm:border-l sm:pl-4 border-gray-300 flex flex-col items-center justify-between min-h-[120px]">
                <div className="w-28 h-28 border-2 border-dashed border-gray-500 rounded-full flex flex-col items-center justify-center text-center p-1.5 text-[8px] text-gray-500 leading-tight">
                  <span className="font-bold uppercase">Post Office</span>
                  <span className="font-bold">Round Date Stamp</span>
                  <span className="text-[7px] text-gray-400 mt-1">(To be stamped by counter clerk)</span>
                </div>
                <div className="w-full text-center mt-2 pt-2 border-t border-gray-300 text-[9px] text-gray-600">
                  <span>Signature of Postal Assistant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
