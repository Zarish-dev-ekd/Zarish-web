'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Badge from '@/components/product/Badge';
import type { ProductBadge, BadgeStyle } from '@/lib/types';
import { getProductBadges, saveProductBadge, deleteProductBadge, DEFAULT_PRODUCT_BADGES } from '@/lib/badges';

const BADGE_STYLES: { id: BadgeStyle; name: string; tag: string; desc: string }[] = [
  { id: 'corner_ribbon', name: 'Left Corner Ribbon', tag: 'CORNER', desc: 'Folded diagonal ribbon across the top-left corner (Recommended)' },
  { id: 'hanging_flag', name: 'Hanging Ribbon Flag', tag: 'BANNER', desc: 'V-cut banner ribbon hanging down from top edge' },
  { id: 'rosette', name: 'Scalloped Seal Stamp', tag: 'STAMP', desc: 'Round medallion / starburst seal stamp' },
  { id: 'side_tag', name: 'Side Ribbon Tag', tag: 'SIDE', desc: 'Folded ribbon tag protruding from the left side' },
  { id: 'luxury_pill', name: 'Modern Pill', tag: 'PILL', desc: 'Sleek luxury rounded capsule with soft border' },
];

const PRESET_COLORS = [
  { name: 'Vibrant Yellow (Classic)', bg: '#FFD200', text: '#000000' },
  { name: 'Royal Gold', bg: '#D4AF37', text: '#FFFFFF' },
  { name: 'Deep Emerald', bg: '#0E7064', text: '#FFFFFF' },
  { name: 'Velvet Crimson', bg: '#C44D4D', text: '#FFFFFF' },
  { name: 'Warm Mustard', bg: '#E5A93C', text: '#2C241E' },
  { name: 'Classic Mocha', bg: '#7B5B3A', text: '#FFFFFF' },
  { name: 'Midnight Charcoal', bg: '#2C241E', text: '#FFFFFF' },
];


export default function AdminBadgesPage() {
  const supabase = createClient();
  const [badges, setBadges] = useState<ProductBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<ProductBadge | null>(null);
  const [saving, setSaving] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [style, setStyle] = useState<BadgeStyle>('corner_ribbon');
  const [bgColor, setBgColor] = useState('#D4AF37');
  const [textColor, setTextColor] = useState('#FFFFFF');

  useEffect(() => {
    loadBadges();
  }, []);

  async function loadBadges() {
    setLoading(true);
    const data = await getProductBadges(supabase);
    setBadges(data);
    setLoading(false);
  }

  function handleOpenCreate() {
    setEditingBadge(null);
    setName('');
    setText('NEW');
    setStyle('corner_ribbon');
    setBgColor('#FFD200');
    setTextColor('#000000');
    setModalOpen(true);
  }


  function handleOpenEdit(b: ProductBadge) {
    setEditingBadge(b);
    setName(b.name);
    setText(b.text);
    setStyle(b.style);
    setBgColor(b.bg_color);
    setTextColor(b.text_color);
    setModalOpen(true);
  }

  async function handleSaveBadge(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setSaving(true);
    const badgePayload: Partial<ProductBadge> = {
      id: editingBadge ? editingBadge.id : `badge-${Date.now()}`,
      name: name.trim() || `${text.trim()} (${style.replace('_', ' ')})`,
      text: text.trim().toUpperCase(),
      style,
      bg_color: bgColor,
      text_color: textColor,
      is_active: true,
      display_order: editingBadge?.display_order ?? badges.length + 1,
    };

    const saved = await saveProductBadge(supabase, badgePayload);
    setBadges((prev) => {
      const idx = prev.findIndex((b) => b.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });

    setSaving(false);
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this badge?')) return;
    await deleteProductBadge(supabase, id);
    setBadges((prev) => prev.filter((b) => b.id !== id));
  }

  // Active mock badge for live preview
  const livePreviewBadge: ProductBadge = {
    id: 'preview',
    name: name || 'Preview Badge',
    text: text.trim().toUpperCase() || 'BESTSELLER',
    style,
    bg_color: bgColor,
    text_color: textColor,
  };

  const sqlCode = `-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Click Run

CREATE TABLE IF NOT EXISTS public.product_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'corner_ribbon',
  bg_color TEXT NOT NULL DEFAULT '#D4AF37',
  text_color TEXT NOT NULL DEFAULT '#FFFFFF',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.product_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read badges" ON public.product_badges FOR SELECT USING (true);
CREATE POLICY "Admin manage badges" ON public.product_badges FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'email') = 'zarish2025co@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'zarish2025co@gmail.com');

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge_id UUID REFERENCES public.product_badges(id) ON DELETE SET NULL;
`;

  return (
    <div className="pb-16 max-w-6xl mx-auto">
      {/* ─── Page Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1 font-semibold">
            Storefront Badges & Ribbons
          </h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Create custom promotional ribbons, corner folds, and golden stamps that can be assigned to any product.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSqlModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#E8E0D5] bg-white text-[#7B5B3A] hover:bg-[#FAF6F0] transition-colors"
          >
            📋 Supabase SQL
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Create New Badge</span>
          </button>
        </div>
      </div>

      {/* ─── Badges Showcase Grid ───────────────────────────────── */}
      {loading ? (
        <div className="text-center py-20">
          <span className="w-6 h-6 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
          <p className="mt-3 text-sm text-[#7A6F66]">Loading badge collections...</p>
        </div>
      ) : badges.length === 0 ? (
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-12 text-center">
          <p className="text-[#7A6F66] mb-4">No badges created yet.</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#7B5B3A] text-white hover:bg-[#63472C]"
          >
            Create Your First Badge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-[#E8E0D5] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Mock Product Card with Live Badge Preview */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-[#F5EDE4] to-[#EAE0D5] overflow-hidden flex items-center justify-center p-4">
                {/* Live rendered Badge */}
                <Badge badge={b} />

                {/* Subtle Mock Card Silhouette */}
                <div className="w-24 h-32 rounded-lg bg-white/70 shadow-sm flex flex-col items-center justify-center text-center p-2 border border-white/50 pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-[#7B5B3A]/10 flex items-center justify-center text-[#7B5B3A] text-xs font-serif mb-1">
                    Z
                  </div>
                  <span className="text-[10px] text-[#7A6F66] font-medium">Garment Card</span>
                </div>
              </div>

              {/* Badge Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-semibold text-sm text-[#2C241E] m-0">{b.name}</h3>
                    <Badge badge={b} inline />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#7A6F66] mt-1">
                    <span className="capitalize">{b.style.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{b.bg_color}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#F0EBE5]">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="px-3 py-1.5 text-xs font-medium text-[#7B5B3A] hover:bg-[#FAF6F0] rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1.5 text-xs font-medium text-[#C44D4D] hover:bg-[#FFEBEE] rounded-md transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create / Edit Modal ─────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E0D5] relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-[#7A6F66] hover:text-[#2C241E] text-xl font-bold p-1 cursor-pointer"
            >
              ✕
            </button>

            <h3 className="font-serif text-xl font-semibold text-[#2C241E] mb-1">
              {editingBadge ? 'Edit Badge' : 'Create New Product Badge'}
            </h3>
            <p className="text-xs text-[#7A6F66] mb-6">
              Configure how this badge looks and displays on product cards across the store.
            </p>

            <form onSubmit={handleSaveBadge} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Form Controls */}
                <div className="space-y-4">
                  {/* Badge Text */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#2C241E] mb-1">
                      Badge Text *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 text-sm border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] uppercase font-bold tracking-wider outline-none focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                      placeholder="e.g. BESTSELLER, 50% OFF, NEW"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={18}
                      required
                    />
                    <p className="text-[11px] text-[#7A6F66] mt-1">Short, high-impact uppercase words work best.</p>
                  </div>

                  {/* Badge Internal Name */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#2C241E] mb-1">
                      Badge Label (for Admin Dropdown)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 text-sm border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                      placeholder="e.g. Gold Corner Ribbon"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Style Selector */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#2C241E] mb-2">
                      Badge Style
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {BADGE_STYLES.map((st) => (
                        <label
                          key={st.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            style === st.id
                              ? 'border-[#7B5B3A] bg-[#FAF6F0] shadow-xs'
                              : 'border-[#E8E0D5] hover:bg-black/[0.02]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="badgeStyle"
                            value={st.id}
                            checked={style === st.id}
                            onChange={() => setStyle(st.id)}
                            className="text-[#7B5B3A] focus:ring-[#7B5B3A]"
                          />
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#7B5B3A]/10 text-[#7B5B3A] tracking-wider uppercase">
                            {st.tag}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="block text-xs font-semibold text-[#2C241E]">{st.name}</span>
                            <span className="block text-[11px] text-[#7A6F66] truncate">{st.desc}</span>
                          </div>

                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette Presets */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                      Color Palette
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {PRESET_COLORS.map((clr) => (
                        <button
                          key={clr.name}
                          type="button"
                          onClick={() => {
                            setBgColor(clr.bg);
                            setTextColor(clr.text);
                          }}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                            bgColor === clr.bg ? 'border-[#7B5B3A] scale-110 shadow-sm' : 'border-white shadow-xs'
                          }`}
                          style={{ backgroundColor: clr.bg }}
                          title={clr.name}
                        >
                          {bgColor === clr.bg && (
                            <span style={{ color: clr.text }} className="text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-[#7A6F66] block mb-1">Custom Background</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-8 h-8 rounded border border-[#E8E0D5] cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-[#E8E0D5] rounded font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#7A6F66] block mb-1">Custom Text</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-8 h-8 rounded border border-[#E8E0D5] cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-[#E8E0D5] rounded font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Mock Preview */}
                <div className="bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-4 flex flex-col items-center sticky top-4">
                  <span className="text-xs font-bold text-[#7B5B3A] tracking-wider uppercase mb-3">
                    Live Storefront Preview
                  </span>

                  <div className="relative w-48 h-64 bg-white rounded-xl shadow-md overflow-hidden border border-[#E8E0D5] flex flex-col justify-end p-3">
                    {/* Render badge on card */}
                    <Badge badge={livePreviewBadge} />

                    {/* Mock Garment Silhouette */}
                    <div className="absolute inset-x-0 top-0 bottom-16 bg-gradient-to-b from-[#F5EDE4] to-[#EAE0D5] flex items-center justify-center">
                      <span className="text-3xl opacity-20 font-serif">ZARISH</span>
                    </div>

                    {/* Mock Card Content */}
                    <div className="relative z-10 bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-black/5">
                      <div className="h-2 w-24 bg-[#2C241E]/40 rounded mb-1.5" />
                      <div className="h-2.5 w-14 bg-[#7B5B3A] rounded" />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#7A6F66] text-center mt-3">
                    This is how the badge will appear on your product cards in real time.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#7A6F66] hover:bg-black/5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 text-sm font-semibold rounded-lg bg-[#7B5B3A] text-white hover:bg-[#63472C] disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Saving...' : editingBadge ? 'Update Badge' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Supabase SQL Migration Modal ────────────────────────── */}
      {sqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E0D5] relative">
            <button
              type="button"
              onClick={() => setSqlModalOpen(false)}
              className="absolute top-5 right-5 text-[#7A6F66] hover:text-[#2C241E] text-xl font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-serif text-xl font-semibold text-[#2C241E] mb-2">
              Supabase SQL Migration
            </h3>
            <p className="text-xs text-[#7A6F66] mb-4">
              To permanently save your badges in your dedicated database table and link them to products via foreign keys, run this script once in your Supabase SQL Editor.
            </p>
            <pre className="bg-[#2B2118] text-[#E5DACF] p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-60 mb-4 select-all">
              {sqlCode}
            </pre>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A6F66]">
                Even before running this, your badges work immediately via fallback storage!
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sqlCode);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors"
              >
                {copiedSql ? '✓ Copied!' : 'Copy SQL Script'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
