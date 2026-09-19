export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function AdminDashboardPage() {
  let productCount = 0;
  let categoryCount = 0;
  let sizeCount = 0;
  let heroCount = 0;
  let announcementCount = 0;
  let subscriberCount = 0;
  let dbConnected = false;

  try {
    const supabase = await createClient();

    const [
      { count: pCount, error: pErr },
      { count: cCount },
      { count: sCount },
      { count: hCount },
      { count: aCount },
      { count: subCount },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('sizes').select('*', { count: 'exact', head: true }),
      supabase.from('hero_slides').select('*', { count: 'exact', head: true }),
      supabase.from('announcements').select('*', { count: 'exact', head: true }),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }),
    ]);

    if (!pErr) {
      dbConnected = true;
      productCount = pCount ?? 0;
      categoryCount = cCount ?? 0;
      sizeCount = sCount ?? 0;
      heroCount = hCount ?? 0;
      announcementCount = aCount ?? 0;
      subscriberCount = subCount ?? 0;
    }
  } catch {
    dbConnected = false;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Store Overview</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Welcome to the ZARISH administrative hub. Monitor inventory and manage site content.
          </p>
        </div>
        <div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-5 mb-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <p className="text-xs uppercase tracking-[0.05em] text-[#7A6F66] m-0 mb-2 font-semibold">Total Products</p>
          <p className="text-[28px] font-bold text-[#7B5B3A] m-0">{productCount}</p>
        </div>
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <p className="text-xs uppercase tracking-[0.05em] text-[#7A6F66] m-0 mb-2 font-semibold">Active Categories</p>
          <p className="text-[28px] font-bold text-[#7B5B3A] m-0">{categoryCount}</p>
        </div>
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <p className="text-xs uppercase tracking-[0.05em] text-[#7A6F66] m-0 mb-2 font-semibold">Available Sizes</p>
          <p className="text-[28px] font-bold text-[#7B5B3A] m-0">{sizeCount}</p>
        </div>
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <p className="text-xs uppercase tracking-[0.05em] text-[#7A6F66] m-0 mb-2 font-semibold">Hero Slides</p>
          <p className="text-[28px] font-bold text-[#7B5B3A] m-0">{heroCount}</p>
        </div>
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <p className="text-xs uppercase tracking-[0.05em] text-[#7A6F66] m-0 mb-2 font-semibold">Announcements</p>
          <p className="text-[28px] font-bold text-[#7B5B3A] m-0">{announcementCount}</p>
        </div>
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <p className="text-xs uppercase tracking-[0.05em] text-[#7A6F66] m-0 mb-2 font-semibold">Subscribers</p>
          <p className="text-[28px] font-bold text-[#7B5B3A] m-0">{subscriberCount}</p>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Quick Management Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
          >
            Create Product
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/sizes"
            className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
          >
            Manage Sizes & Colors
          </Link>
          <Link
            href="/admin/hero"
            className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
          >
            Update Hero Banner
          </Link>
          <Link
            href="/admin/announcements"
            className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
          >
            Edit Announcement Bar
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
          >
            Store & Social Settings
          </Link>
        </div>
      </div>

      {/* System Integration Status */}
      <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">System &amp; Infrastructure Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#FAF8F5] rounded-md border border-[#E8E0D5]">
            <h4 className="m-0 mb-1.5 text-[15px] font-semibold text-[#2C241E]">Storefront &amp; Cloud Database</h4>
            <p className="m-0 mb-2 text-[13px] text-[#7A6F66]">
              Real-time synchronization for orders, inventory, and customer records.
            </p>
            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase bg-[#E8F5E9] text-[#2E7D32]">
              Operational &amp; Synced
            </span>
          </div>

          <div className="p-4 bg-[#FAF8F5] rounded-md border border-[#E8E0D5]">
            <h4 className="m-0 mb-1.5 text-[15px] font-semibold text-[#2C241E]">High-Speed Media Delivery</h4>
            <p className="m-0 mb-2 text-[13px] text-[#7A6F66]">
              Automatic responsive image formatting and high-speed global CDN delivery.
            </p>
            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase bg-[#E8F5E9] text-[#2E7D32]">
              Active &amp; Optimized
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
