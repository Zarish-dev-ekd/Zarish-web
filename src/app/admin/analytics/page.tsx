'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { IconWhatsapp } from '@/components/icons';

interface ProductStat {
  id: string;
  name: string;
  image_url: string;
  category_name: string;
  units_sold: number;
  total_revenue: number;
  current_stock: number;
  price: number;
}

interface CategoryStat {
  id: string;
  name: string;
  units_sold: number;
  total_revenue: number;
  order_count: number;
  percentage: number;
}

interface BuyerStat {
  name: string;
  email: string;
  phone: string;
  orders_count: number;
  total_spent: number;
  aov: number;
  last_order_date: string;
  tier: string;
}

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalUnitsSold: number;
    aov: number;
    uniqueCustomers: number;
    repeatRate: number;
  };
  topProducts: ProductStat[];
  topCategories: CategoryStat[];
  topBuyers: BuyerStat[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'all' | '30d' | '7d' | 'today'>('all');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'buyers'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/analytics?range=${range}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || 'Failed to fetch analytics');
      }
      setData(json);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  // Export CSV
  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'products') {
      csvContent += 'Rank,Product Name,Category,Units Sold,Total Revenue (INR),Current Stock\n';
      data.topProducts.forEach((p, idx) => {
        csvContent += `${idx + 1},"${p.name.replace(/"/g, '""')}","${p.category_name}",${p.units_sold},${p.total_revenue},${p.current_stock}\n`;
      });
    } else if (activeTab === 'categories') {
      csvContent += 'Category,Units Sold,Total Revenue (INR),Order Count,Share (%)\n';
      data.topCategories.forEach((c) => {
        csvContent += `"${c.name}",${c.units_sold},${c.total_revenue},${c.order_count},${c.percentage}%\n`;
      });
    } else {
      csvContent += 'Customer Name,Email,Phone,Orders Count,Total Spent (INR),AOV (INR),Last Order Date\n';
      data.topBuyers.forEach((b) => {
        csvContent += `"${b.name}","${b.email}","${b.phone}",${b.orders_count},${b.total_spent},${b.aov},"${b.last_order_date}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zarish-analytics-${activeTab}-${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered top products
  const filteredProducts = useMemo(() => {
    if (!data?.topProducts) return [];
    if (!searchQuery.trim()) return data.topProducts;
    const q = searchQuery.toLowerCase();
    return data.topProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category_name.toLowerCase().includes(q)
    );
  }, [data?.topProducts, searchQuery]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!data?.topCategories) return [];
    if (!searchQuery.trim()) return data.topCategories;
    const q = searchQuery.toLowerCase();
    return data.topCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [data?.topCategories, searchQuery]);

  // Filtered buyers
  const filteredBuyers = useMemo(() => {
    if (!data?.topBuyers) return [];
    if (!searchQuery.trim()) return data.topBuyers;
    const q = searchQuery.toLowerCase();
    return data.topBuyers.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q)
    );
  }, [data?.topBuyers, searchQuery]);

  const maxUnits = useMemo(() => {
    if (!data?.topProducts || data.topProducts.length === 0) return 1;
    return Math.max(...data.topProducts.map((p) => p.units_sold), 1);
  }, [data?.topProducts]);

  return (
    <div className="space-y-6">
      {/* ─── Page Header & Time Filters ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C241E] m-0">
              Store Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF6F0] text-[#7B5B3A] border border-[#EADCCB]">
              Real-time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A6F66] mt-1 m-0">
            Track top selling products, popular categories, and your most active buyers.
          </p>
        </div>

        {/* Controls: Date range filter pills, export, and refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Pills */}
          <div className="inline-flex items-center p-1 bg-white border border-[#E8E0D5] rounded-xl shadow-2xs">
            {(
              [
                { key: 'today', label: 'Today' },
                { key: '7d', label: 'Last 7 Days' },
                { key: '30d', label: 'Last 30 Days' },
                { key: 'all', label: 'All Time' },
              ] as const
            ).map((r) => {
              const isSelected = range === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#7B5B3A] text-white shadow-2xs'
                      : 'text-[#6B5744] hover:bg-[#FAF6F0]'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-[#7B5B3A] bg-white hover:bg-[#FAF6F0] border border-[#D9C9B8] rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh metrics"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={loading || !data}
            className="px-3.5 py-2 text-xs font-semibold text-[#2C241E] bg-white hover:bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Download CSV report"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-bold uppercase underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── Metric KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="p-4 rounded-xl bg-white border border-[#E8E0D5] shadow-2xs col-span-2 sm:col-span-1 lg:col-span-2">
          <div className="text-[11px] font-bold text-[#7A6F66] uppercase tracking-wider">
            Total Revenue
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2C241E] mt-1 font-display tracking-tight text-[#7B5B3A]">
            {loading ? '...' : formatPrice(data?.summary.totalRevenue || 0)}
          </div>
          <div className="text-[11px] text-[#7A6F66] mt-1">
            From {data?.summary.totalOrders || 0} completed orders
          </div>
        </div>

        {/* Units Sold */}
        <div className="p-4 rounded-xl bg-white border border-[#E8E0D5] shadow-2xs">
          <div className="text-[11px] font-bold text-[#7A6F66] uppercase tracking-wider">
            Units Sold
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2C241E] mt-1">
            {loading ? '...' : (data?.summary.totalUnitsSold || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#7A6F66] mt-1">Total pieces</div>
        </div>

        {/* Total Orders */}
        <div className="p-4 rounded-xl bg-white border border-[#E8E0D5] shadow-2xs">
          <div className="text-[11px] font-bold text-[#7A6F66] uppercase tracking-wider">
            Total Orders
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2C241E] mt-1">
            {loading ? '...' : data?.summary.totalOrders || 0}
          </div>
          <div className="text-[11px] text-[#7A6F66] mt-1">Placed orders</div>
        </div>

        {/* AOV */}
        <div className="p-4 rounded-xl bg-white border border-[#E8E0D5] shadow-2xs">
          <div className="text-[11px] font-bold text-[#7A6F66] uppercase tracking-wider">
            Avg Order (AOV)
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#2C241E] mt-1">
            {loading ? '...' : formatPrice(data?.summary.aov || 0)}
          </div>
          <div className="text-[11px] text-[#7A6F66] mt-1">Per checkout</div>
        </div>

        {/* Repeat Rate */}
        <div className="p-4 rounded-xl bg-white border border-[#E8E0D5] shadow-2xs">
          <div className="text-[11px] font-bold text-[#7A6F66] uppercase tracking-wider">
            Repeat Buyers
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
            {loading ? '...' : `${data?.summary.repeatRate || 0}%`}
          </div>
          <div className="text-[11px] text-[#7A6F66] mt-1">
            {data?.summary.uniqueCustomers || 0} buyers
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs & Search ─── */}
      <div className="p-4 bg-white border border-[#E8E0D5] rounded-xl shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-[#7B5B3A] text-white shadow-2xs'
                : 'bg-[#FAF6F0] text-[#6B5744] hover:bg-[#F2ECE4]'
            }`}
          >
            <span>👗 Most Sold Products</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-white text-[#7B5B3A]'
              }`}
            >
              {data?.topProducts.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('categories');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-[#7B5B3A] text-white shadow-2xs'
                : 'bg-[#FAF6F0] text-[#6B5744] hover:bg-[#F2ECE4]'
            }`}
          >
            <span>🗂️ Categories</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-white text-[#7B5B3A]'
              }`}
            >
              {data?.topCategories.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('buyers');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'buyers'
                ? 'bg-[#7B5B3A] text-white shadow-2xs'
                : 'bg-[#FAF6F0] text-[#6B5744] hover:bg-[#F2ECE4]'
            }`}
          >
            <span>💎 Most Active Buyers</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'buyers' ? 'bg-white/20 text-white' : 'bg-white text-[#7B5B3A]'
              }`}
            >
              {data?.topBuyers.length || 0}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7B6B]">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'products'
                ? 'Search products...'
                : activeTab === 'categories'
                ? 'Search categories...'
                : 'Search buyers by name, phone...'
            }
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E2D5C7] rounded-lg bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:outline-none focus:border-[#7B5B3A]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7B6B] hover:text-[#2C1D13]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      {loading ? (
        <div className="p-16 text-center bg-white border border-[#E8E0D5] rounded-xl space-y-2">
          <div className="w-6 h-6 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#7A6F66]">Computing store analytics...</p>
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════════════════════════════
              TAB 1: MOST SOLD PRODUCTS
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-white border border-[#E8E0D5] rounded-xl space-y-2">
                  <div className="text-3xl">👗</div>
                  <h3 className="text-sm sm:text-base font-bold text-[#2C241E]">
                    {searchQuery ? 'No products match search' : 'No sales recorded yet'}
                  </h3>
                  <p className="text-xs text-[#7A6F66] max-w-sm mx-auto">
                    {searchQuery
                      ? 'Try another search term.'
                      : 'As customers purchase products, your highest selling pieces will rank here automatically.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-[#F0E6DC] bg-[#FAF8F5] text-[#7A6F66] uppercase text-[10.5px] font-bold tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">Rank</th>
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-center">Units Sold</th>
                          <th className="py-3 px-4 text-right">Total Revenue</th>
                          <th className="py-3 px-4 text-center">Current Stock</th>
                          <th className="py-3 px-4 w-44">Sales Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE4]">
                        {filteredProducts.map((product, idx) => {
                          const percentageOfMax = Math.round((product.units_sold / maxUnits) * 100);
                          const isLowStock = product.current_stock <= 3 && product.current_stock > 0;
                          const isOutOfStock = product.current_stock === 0;

                          return (
                            <tr key={product.id} className="hover:bg-[#FAF8F5] transition-colors">
                              {/* Rank */}
                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                    idx === 0
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : idx === 1
                                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                      : idx === 2
                                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                      : 'text-[#8C7B6B]'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              </td>

                              {/* Product Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-11 h-14 rounded-lg overflow-hidden bg-[#FAF6F0] border border-[#E2D5C7] shrink-0">
                                    <Image
                                      src={product.image_url}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                      sizes="44px"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-[#2C1D13] leading-snug line-clamp-1">
                                      {product.name}
                                    </h4>
                                    <span className="text-[11px] text-[#7A6F66]">
                                      Avg {formatPrice(product.price)}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF6F0] text-[#7B5B3A] border border-[#EADBCE]">
                                  {product.category_name}
                                </span>
                              </td>

                              {/* Units Sold */}
                              <td className="py-3.5 px-4 text-center font-bold text-[#2C1D13]">
                                <span className="px-2.5 py-1 rounded-md bg-[#FAF6F0] border border-[#E2D5C7]">
                                  {product.units_sold} pcs
                                </span>
                              </td>

                              {/* Revenue */}
                              <td className="py-3.5 px-4 text-right font-bold text-[#7B5B3A]">
                                {formatPrice(product.total_revenue)}
                              </td>

                              {/* Current Stock */}
                              <td className="py-3.5 px-4 text-center">
                                {isOutOfStock ? (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    Out of stock
                                  </span>
                                ) : isLowStock ? (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    Low ({product.current_stock} left)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                    {product.current_stock} in stock
                                  </span>
                                )}
                              </td>

                              {/* Visual Share Bar */}
                              <td className="py-3.5 px-4">
                                <div className="w-full bg-[#FAF6F0] rounded-full h-2 overflow-hidden border border-[#EADCCB]/60">
                                  <div
                                    className="bg-[#7B5B3A] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${percentageOfMax}%` }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: TOP CATEGORIES
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              {filteredCategories.length === 0 ? (
                <div className="p-12 text-center bg-white border border-[#E8E0D5] rounded-xl space-y-2">
                  <div className="text-3xl">🗂️</div>
                  <h3 className="text-sm sm:text-base font-bold text-[#2C241E]">
                    No category sales data yet
                  </h3>
                  <p className="text-xs text-[#7A6F66]">
                    Category volume breakdown will appear here once items are purchased.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category, idx) => (
                    <div
                      key={category.id || idx}
                      className="p-5 rounded-xl border border-[#E8E0D5] bg-white shadow-2xs hover:shadow-xs transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#FAF6F0] text-[#7B5B3A] border border-[#E2D5C7] text-xs font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <h3 className="font-bold text-sm sm:text-base text-[#2C1D13] m-0">
                            {category.name}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-[#7B5B3A] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#EADBCE]">
                          {category.percentage}% share
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F2ECE4] text-xs">
                        <div>
                          <span className="text-[#7A6F66] block text-[11px]">Units Sold</span>
                          <span className="font-bold text-[#2C1D13] text-sm">
                            {category.units_sold} pieces
                          </span>
                        </div>
                        <div>
                          <span className="text-[#7A6F66] block text-[11px]">Revenue</span>
                          <span className="font-bold text-[#7B5B3A] text-sm">
                            {formatPrice(category.total_revenue)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-[#7A6F66] mb-1">
                          <span>Volume share</span>
                          <span>{category.percentage}%</span>
                        </div>
                        <div className="w-full bg-[#FAF6F0] rounded-full h-2 overflow-hidden border border-[#EADBCE]/70">
                          <div
                            className="bg-gradient-to-r from-[#7B5B3A] to-[#B08968] h-full rounded-full transition-all duration-500"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: MOST ACTIVE BUYERS
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'buyers' && (
            <div className="space-y-3">
              {filteredBuyers.length === 0 ? (
                <div className="p-12 text-center bg-white border border-[#E8E0D5] rounded-xl space-y-2">
                  <div className="text-3xl">💎</div>
                  <h3 className="text-sm sm:text-base font-bold text-[#2C241E]">
                    {searchQuery ? 'No customers match search' : 'No customer records yet'}
                  </h3>
                  <p className="text-xs text-[#7A6F66] max-w-sm mx-auto">
                    {searchQuery
                      ? 'Try another search term.'
                      : 'As customers order, your top frequent shoppers and VIP buyers will rank here automatically.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-[#F0E6DC] bg-[#FAF8F5] text-[#7A6F66] uppercase text-[10.5px] font-bold tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">Rank</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Contact Info</th>
                          <th className="py-3 px-4 text-center">Orders Placed</th>
                          <th className="py-3 px-4 text-right">Total Spent</th>
                          <th className="py-3 px-4 text-right">Avg Order (AOV)</th>
                          <th className="py-3 px-4 text-center">Loyalty Tier</th>
                          <th className="py-3 px-4">Last Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE4]">
                        {filteredBuyers.map((buyer, idx) => {
                          const initials = buyer.name
                            ? buyer.name
                                .split(' ')
                                .map((n) => n[0])
                                .filter(Boolean)
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                            : 'C';

                          const cleanPhone = buyer.phone.replace(/[^0-9]/g, '');

                          return (
                            <tr key={buyer.email || buyer.phone || idx} className="hover:bg-[#FAF8F5] transition-colors">
                              {/* Rank */}
                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                    idx === 0
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : idx === 1
                                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                      : idx === 2
                                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                      : 'text-[#8C7B6B]'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              </td>

                              {/* Customer Avatar & Name */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] text-[#7B5B3A] font-bold text-xs flex items-center justify-center shrink-0">
                                    {initials}
                                  </div>
                                  <span className="font-bold text-[#2C1D13]">{buyer.name}</span>
                                </div>
                              </td>

                              {/* Contact */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  {buyer.email && (
                                    <a
                                      href={`mailto:${buyer.email}`}
                                      className="text-xs text-[#7B5B3A] hover:underline block truncate max-w-[200px]"
                                      title="Send email"
                                    >
                                      {buyer.email}
                                    </a>
                                  )}
                                  {buyer.phone && (
                                    <div className="flex items-center gap-1.5 text-xs text-[#7A6F66]">
                                      <span>{buyer.phone}</span>
                                      {cleanPhone && (
                                        <a
                                          href={`https://wa.me/${cleanPhone}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-emerald-600 hover:text-emerald-700"
                                          title="Chat on WhatsApp"
                                        >
                                          <IconWhatsapp size={12} />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Total Orders */}
                              <td className="py-3.5 px-4 text-center font-bold text-[#2C1D13]">
                                <span className="px-2.5 py-1 rounded-md bg-[#FAF6F0] border border-[#E2D5C7]">
                                  {buyer.orders_count} {buyer.orders_count === 1 ? 'order' : 'orders'}
                                </span>
                              </td>

                              {/* Total Spent */}
                              <td className="py-3.5 px-4 text-right font-bold text-[#7B5B3A]">
                                {formatPrice(buyer.total_spent)}
                              </td>

                              {/* AOV */}
                              <td className="py-3.5 px-4 text-right text-[#6B5744]">
                                {formatPrice(buyer.aov)}
                              </td>

                              {/* Loyalty Tier */}
                              <td className="py-3.5 px-4 text-center">
                                {buyer.tier === 'VIP Buyer' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    <span>👑</span>
                                    <span>VIP Buyer</span>
                                  </span>
                                ) : buyer.tier === 'Repeat Buyer' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <span>⭐</span>
                                    <span>Repeat</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF8F5] text-[#7A6F66] border border-[#E2D5C7]">
                                    Customer
                                  </span>
                                )}
                              </td>

                              {/* Last Order Date */}
                              <td className="py-3.5 px-4 text-xs text-[#7A6F66]">
                                {new Date(buyer.last_order_date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
