'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  DEFAULT_DELIVERY_CONFIG,
  saveDeliveryConfigLocally,
  type DeliveryConfig,
  type DeliveryOption,
} from '@/lib/delivery';

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'delivery' ? 'delivery' : 'general';
  const [activeTab, setActiveTab] = useState<'general' | 'delivery'>(initialTab);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settingId, setSettingId] = useState<string | null>(null);

  // General Store Form State
  const [siteName, setSiteName] = useState('ZARISH');
  const [tagline, setTagline] = useState('Beauty in Modesty');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [metaTitle, setMetaTitle] = useState('ZARISH by Nehala Mufeed | Premium Modest Fashion');
  const [metaDescription, setMetaDescription] = useState('Discover elegant modest fashion by ZARISH.');

  // Checkout Settings (Coupon box toggle)
  const [enableCoupons, setEnableCoupons] = useState(true);
  const [couponToggleLoading, setCouponToggleLoading] = useState(false);

  // Stock Urgency Badges Settings State
  const [enableLowStockBadge, setEnableLowStockBadge] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [showInStockBadge, setShowInStockBadge] = useState(false);
  const [stockBadgeSavingAction, setStockBadgeSavingAction] = useState<'urgency' | 'in_stock' | 'threshold' | null>(null);

  // Delivery Settings State
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>(DEFAULT_DELIVERY_CONFIG);
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliverySubmitting, setDeliverySubmitting] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  // Live preview interactive state
  const [previewState, setPreviewState] = useState<'kerala' | 'other'>('kerala');
  const [previewSelectedId, setPreviewSelectedId] = useState<string>('india_post_parcel');

  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettingId(data.id);
          setSiteName(data.site_name || 'ZARISH');
          setTagline(data.tagline || '');
          setContactEmail(data.contact_email || '');
          setContactPhone(data.contact_phone || '');
          setAddress(data.address || '');
          setWhatsapp(data.social_whatsapp || '');
          setInstagram(data.social_instagram || '');
          setFacebook(data.social_facebook || '');
          setCurrencySymbol(data.currency_symbol || '₹');
          setCurrencyCode(data.currency_code || 'INR');
          setMetaTitle(data.meta_title || '');
          setMetaDescription(data.meta_description || '');
          if (typeof data.enable_low_stock_badge === 'boolean') {
            setEnableLowStockBadge(data.enable_low_stock_badge);
          }
          if (typeof data.low_stock_threshold === 'number') {
            setLowStockThreshold(data.low_stock_threshold);
          }
          if (typeof data.show_in_stock_badge === 'boolean') {
            setShowInStockBadge(data.show_in_stock_badge);
          }
        }
      } catch (err: any) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Load stock badge settings from API
  useEffect(() => {
    fetch('/api/stock-badge-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          if (typeof data.config.enable_low_stock_badge === 'boolean') {
            setEnableLowStockBadge(data.config.enable_low_stock_badge);
          }
          if (typeof data.config.low_stock_threshold === 'number') {
            setLowStockThreshold(data.config.low_stock_threshold);
          }
          if (typeof data.config.show_in_stock_badge === 'boolean') {
            setShowInStockBadge(data.config.show_in_stock_badge);
          }
        }
      })
      .catch((err) => console.warn('Could not load stock badge settings:', err));
  }, []);

  const handleSaveStockBadgeSettings = async (
    patch?: Partial<{
      enable_low_stock_badge: boolean;
      low_stock_threshold: number;
      show_in_stock_badge: boolean;
    }>,
    action: 'urgency' | 'in_stock' | 'threshold' = 'urgency'
  ) => {
    try {
      setStockBadgeSavingAction(action);
      const nextConfig = {
        enable_low_stock_badge: patch && typeof patch.enable_low_stock_badge === 'boolean' ? patch.enable_low_stock_badge : enableLowStockBadge,
        low_stock_threshold: patch && typeof patch.low_stock_threshold === 'number' ? patch.low_stock_threshold : lowStockThreshold,
        show_in_stock_badge: patch && typeof patch.show_in_stock_badge === 'boolean' ? patch.show_in_stock_badge : showInStockBadge,
      };

      const res = await fetch('/api/stock-badge-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      });
      const data = await res.json();
      if (data?.success) {
        setEnableLowStockBadge(nextConfig.enable_low_stock_badge);
        setLowStockThreshold(nextConfig.low_stock_threshold);
        setShowInStockBadge(nextConfig.show_in_stock_badge);
        setSuccess('Stock badge settings saved! Product cards now reflect this globally.');
      } else {
        throw new Error(data?.error || 'Failed to save');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update stock badge setting');
    } finally {
      setStockBadgeSavingAction(null);
    }
  };

  // Load delivery config from API
  useEffect(() => {
    async function loadDeliverySettings() {
      try {
        setDeliveryLoading(true);
        const res = await fetch('/api/delivery-settings');
        const data = await res.json();
        if (data?.config && Array.isArray(data.config.kerala) && Array.isArray(data.config.otherStates)) {
          setDeliveryConfig(data.config);
          saveDeliveryConfigLocally(data.config);
        } else if (Array.isArray(data?.kerala) && Array.isArray(data?.otherStates)) {
          const cfg = { kerala: data.kerala, otherStates: data.otherStates };
          setDeliveryConfig(cfg);
          saveDeliveryConfigLocally(cfg);
        }
      } catch (err: any) {
        console.error('Failed to load delivery settings:', err);
      } finally {
        setDeliveryLoading(false);
      }
    }
    loadDeliverySettings();
  }, []);

  // Load checkout settings (coupons enabled / disabled)
  useEffect(() => {
    fetch('/api/checkout-settings')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.enable_coupons === 'boolean') {
          setEnableCoupons(data.enable_coupons);
        }
      })
      .catch((err) => console.warn('Could not load checkout settings:', err));
  }, []);

  const handleToggleCoupons = async () => {
    try {
      setCouponToggleLoading(true);
      const nextVal = !enableCoupons;
      const res = await fetch('/api/checkout-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable_coupons: nextVal }),
      });
      const data = await res.json();
      if (data?.success) {
        setEnableCoupons(nextVal);
        setSuccess(
          nextVal
            ? 'Checkout Coupon Code Box is now ENABLED on customer checkout.'
            : 'Checkout Coupon Code Box is now DISABLED and hidden from customer checkout.'
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update checkout setting');
    } finally {
      setCouponToggleLoading(false);
    }
  };

  // Update preview selection if options change
  useEffect(() => {
    const activeOpts =
      previewState === 'kerala'
        ? deliveryConfig.kerala.filter((o) => o.isActive !== false)
        : deliveryConfig.otherStates.filter((o) => o.isActive !== false);

    if (activeOpts.length > 0 && !activeOpts.some((o) => o.id === previewSelectedId)) {
      setPreviewSelectedId(activeOpts[0].id);
    }
  }, [previewState, deliveryConfig, previewSelectedId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        site_name: siteName.trim(),
        tagline: tagline.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        address: address.trim(),
        social_whatsapp: whatsapp.trim(),
        social_instagram: instagram.trim(),
        social_facebook: facebook.trim(),
        currency_symbol: currencySymbol.trim(),
        currency_code: currencyCode.trim(),
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        enable_low_stock_badge: enableLowStockBadge,
        low_stock_threshold: Math.max(1, Number(lowStockThreshold) || 3),
        show_in_stock_badge: showInStockBadge,
        updated_at: new Date().toISOString(),
      };

      if (settingId) {
        const { error: updateErr } = await supabase
          .from('site_settings')
          .update(payload)
          .eq('id', settingId);

        if (updateErr) throw updateErr;
      } else {
        const { data: newSetting, error: insertErr } = await supabase
          .from('site_settings')
          .insert([payload])
          .select()
          .single();

        if (insertErr) throw insertErr;
        if (newSetting) setSettingId(newSetting.id);
      }

      setSuccess('Settings saved successfully! Footer and metadata updated.');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err?.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  // Delivery Setting Handlers
  const updateKeralaOption = (index: number, patch: Partial<DeliveryOption>) => {
    setDeliveryConfig((prev) => {
      const copy = [...prev.kerala];
      copy[index] = { ...copy[index], ...patch };
      if (patch.price !== undefined) {
        const num = Math.max(0, Number(patch.price) || 0);
        copy[index].price = num;
        copy[index].priceLabel = num === 0 ? 'FREE' : `+₹${num}`;
        copy[index].isBlinkingFree = num === 0;
      }
      return { ...prev, kerala: copy };
    });
  };

  const updateOtherStateOption = (index: number, patch: Partial<DeliveryOption>) => {
    setDeliveryConfig((prev) => {
      const copy = [...prev.otherStates];
      copy[index] = { ...copy[index], ...patch };
      if (patch.price !== undefined) {
        const num = Math.max(0, Number(patch.price) || 0);
        copy[index].price = num;
        copy[index].priceLabel = num === 0 ? 'FREE' : `+₹${num}`;
        copy[index].isBlinkingFree = num === 0;
      }
      return { ...prev, otherStates: copy };
    });
  };

  const addKeralaOption = () => {
    const id = `courier_kl_${Date.now()}`;
    setDeliveryConfig((prev) => ({
      ...prev,
      kerala: [
        ...prev.kerala,
        {
          id,
          name: 'New Courier Service',
          deliveryTime: '2–4 Days',
          price: 50,
          priceLabel: '+₹50',
          isActive: true,
        },
      ],
    }));
  };

  const removeKeralaOption = (index: number) => {
    if (deliveryConfig.kerala.length <= 1) {
      alert('You must have at least one delivery partner for Kerala.');
      return;
    }
    setDeliveryConfig((prev) => ({
      ...prev,
      kerala: prev.kerala.filter((_, i) => i !== index),
    }));
  };

  const addOtherStateOption = () => {
    const id = `courier_other_${Date.now()}`;
    setDeliveryConfig((prev) => ({
      ...prev,
      otherStates: [
        ...prev.otherStates,
        {
          id,
          name: 'Express Courier',
          deliveryTime: '3–6 Days',
          price: 50,
          priceLabel: '+₹50',
          isActive: true,
        },
      ],
    }));
  };

  const removeOtherStateOption = (index: number) => {
    if (deliveryConfig.otherStates.length <= 1) {
      alert('You must have at least one delivery partner for Other States.');
      return;
    }
    setDeliveryConfig((prev) => ({
      ...prev,
      otherStates: prev.otherStates.filter((_, i) => i !== index),
    }));
  };

  const handleSaveDeliverySettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDeliverySubmitting(true);
    setDeliveryError(null);
    setDeliverySuccess(null);

    try {
      const res = await fetch('/api/delivery-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: deliveryConfig }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save delivery settings.');
      }

      saveDeliveryConfigLocally(deliveryConfig);
      setDeliverySuccess('Delivery settings saved! Changes are now immediately live on all checkouts.');
    } catch (err: any) {
      console.error('Error saving delivery settings:', err);
      setDeliveryError(err?.message || 'Failed to save delivery settings');
    } finally {
      setDeliverySubmitting(false);
    }
  };

  const handleResetDeliveryDefaults = () => {
    if (
      confirm(
        'Reset courier delivery settings back to factory defaults?\n• Kerala: India Post (Free, 3-5d), EMS Speed Post (+₹50, 1-3d), DTDC (+₹50, 1-2d)\n• Other States: EMS Speed Post (+₹50, 2-5d)'
      )
    ) {
      setDeliveryConfig(DEFAULT_DELIVERY_CONFIG);
      setDeliverySuccess('Reset to defaults! Click "Save Delivery Settings" to commit.');
    }
  };

  // Preview calculation
  const activePreviewOptions =
    previewState === 'kerala'
      ? deliveryConfig.kerala.filter((o) => o.isActive !== false)
      : deliveryConfig.otherStates.filter((o) => o.isActive !== false);

  const selectedPreviewOption =
    activePreviewOptions.find((o) => o.id === previewSelectedId) || activePreviewOptions[0];

  const previewDeliveryFee = selectedPreviewOption ? selectedPreviewOption.price : 0;
  const mockSubtotal = 1850;
  const mockTotal = mockSubtotal + previewDeliveryFee;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Store & System Settings</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Manage store identity, support channels, and courier shipping methods across Kerala and all Indian states.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-black/[0.04] p-1 rounded-lg w-fit mb-6" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'general'}
          onClick={() => {
            setActiveTab('general');
            setError(null);
            setSuccess(null);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border-0 cursor-pointer transition-all duration-200 ${
            activeTab === 'general'
              ? 'bg-white text-[#7B5B3A] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'bg-transparent text-[#7A6F66] hover:text-[#2C241E]'
          }`}
        >
          <span>Store & Contacts</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'delivery'}
          onClick={() => {
            setActiveTab('delivery');
            setDeliveryError(null);
            setDeliverySuccess(null);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border-0 cursor-pointer transition-all duration-200 ${
            activeTab === 'delivery'
              ? 'bg-white text-[#7B5B3A] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'bg-transparent text-[#7A6F66] hover:text-[#2C241E]'
          }`}
        >
          <span>Courier & Delivery Rates</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === 'delivery' ? 'bg-[#7B5B3A] text-white' : 'bg-black/[0.08] text-inherit'
            }`}
          >
            Kerala & Interstate
          </span>
        </button>
      </div>

      {/* ────────── TAB 1: STORE & CONTACT SETTINGS ────────── */}
      {activeTab === 'general' && (
        <>
          {error && (
            <div className="bg-[#FFEBEE] text-[#D32F2F] p-4 rounded-lg border border-[#FFCDD2] mb-6 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-[#E8F5E9] text-[#2E7D32] p-4 rounded-lg border border-[#C8E6C9] mb-6 text-sm">
              {success}
            </div>
          )}

          {/* Checkout Feature: Coupon Code Box Visibility */}
          <div className="max-w-[840px] bg-white border border-[#E8E0D5] rounded-xl p-5 sm:p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  enableCoupons
                    ? 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]'
                    : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828]'
                }`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M13 5v2" />
                    <path d="M13 17v2" />
                    <path d="M13 11v2" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-semibold text-[#2C241E] m-0">
                      Checkout Coupon Code Box
                    </h3>
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      enableCoupons
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                        : 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
                    }`}>
                      {enableCoupons ? '● Visible on Checkout' : '○ Hidden from Checkout'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-[#7A6F66] mt-1 leading-relaxed">
                    Controls whether customers see the &quot;Have a Coupon Code?&quot; box and Apply button on the Checkout page.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleCoupons}
                disabled={couponToggleLoading}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 whitespace-nowrap self-end sm:self-center flex items-center gap-2 ${
                  enableCoupons
                    ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white shadow-[#C62828]/20'
                    : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-[#2E7D32]/20'
                }`}
              >
                {couponToggleLoading ? (
                  <span>Saving...</span>
                ) : enableCoupons ? (
                  <span>Hide on Checkout</span>
                ) : (
                  <span>Show on Checkout</span>
                )}
              </button>
            </div>
          </div>

          {/* Product Badges Feature: Stock Urgency Badges */}
          <div className="max-w-[840px] mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#2C241E] m-0">Catalog Stock & Urgency Badges</h3>
                <p className="text-xs text-[#7A6F66] m-0 mt-0.5">Control which automated inventory tags appear on customer product cards.</p>
              </div>
            </div>

            {/* CARD 1: Low Stock Urgency Badge */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    enableLowStockBadge
                      ? 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828]'
                      : 'bg-[#F5F2ED] border-[#E8E0D5] text-[#7A6F66]'
                  }`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[14px] font-bold text-[#2C241E] m-0">
                        Low Stock Urgency Tag (&ldquo;ONLY X LEFT&rdquo;)
                      </h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        enableLowStockBadge
                          ? 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
                          : 'bg-[#F5F2ED] text-[#7A6F66] border border-[#E8E0D5]'
                      }`}>
                        {enableLowStockBadge ? '● Visible' : '○ Hidden'}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A6F66] mt-1 mb-3">
                      Shows the red urgency tag on items when available quantity is low.
                    </p>

                    {/* Inline Threshold Setting */}
                    <div className="flex items-center gap-2.5 bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EFE8DF] w-fit">
                      <span className="text-xs font-semibold text-[#2C241E]">Trigger when stock &le;</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={lowStockThreshold}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setLowStockThreshold(val);
                        }}
                        onBlur={() => handleSaveStockBadgeSettings({ low_stock_threshold: lowStockThreshold }, 'threshold')}
                        className="w-16 px-2 py-1 text-xs text-center font-bold border border-[#E8E0D5] rounded bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                      />
                      <span className="text-xs text-[#7A6F66]">
                        {stockBadgeSavingAction === 'threshold' ? 'Saving...' : 'units'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveStockBadgeSettings({ enable_low_stock_badge: !enableLowStockBadge }, 'urgency')}
                  disabled={stockBadgeSavingAction !== null}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 whitespace-nowrap self-end sm:self-center flex items-center gap-2 ${
                    enableLowStockBadge
                      ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white shadow-[#C62828]/20'
                      : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-[#2E7D32]/20'
                  }`}
                >
                  {stockBadgeSavingAction === 'urgency' ? (
                    <span>Saving...</span>
                  ) : enableLowStockBadge ? (
                    <span>Hide Urgency Tag</span>
                  ) : (
                    <span>Show Urgency Tag</span>
                  )}
                </button>
              </div>
            </div>

            {/* CARD 2: In Stock Badge */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    showInStockBadge
                      ? 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]'
                      : 'bg-[#F5F2ED] border-[#E8E0D5] text-[#7A6F66]'
                  }`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[14px] font-bold text-[#2C241E] m-0">
                        &ldquo;IN STOCK&rdquo; Tag
                      </h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        showInStockBadge
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                          : 'bg-[#F5F2ED] text-[#7A6F66] border border-[#E8E0D5]'
                      }`}>
                        {showInStockBadge ? '● Visible' : '○ Hidden (Clean Look)'}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A6F66] mt-1">
                      Display green &ldquo;IN STOCK&rdquo; tag on all regular available items (leave hidden for a minimal luxury catalog).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveStockBadgeSettings({ show_in_stock_badge: !showInStockBadge }, 'in_stock')}
                  disabled={stockBadgeSavingAction !== null}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 whitespace-nowrap self-end sm:self-center flex items-center gap-2 ${
                    showInStockBadge
                      ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white shadow-[#C62828]/20'
                      : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-[#2E7D32]/20'
                  }`}
                >
                  {stockBadgeSavingAction === 'in_stock' ? (
                    <span>Saving...</span>
                  ) : showInStockBadge ? (
                    <span>Hide In-Stock Tag</span>
                  ) : (
                    <span>Show In-Stock Tag</span>
                  )}
                </button>
              </div>
            </div>

            {/* Live Customer Catalog Preview */}
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="text-[#7A6F66] font-semibold">Customer Catalog Preview:</span>
              <div className="flex items-center gap-2">
                {enableLowStockBadge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#C0392B] text-white shadow-xs">
                    ONLY {lowStockThreshold} LEFT
                  </span>
                )}
                {showInStockBadge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#0E7064] text-white shadow-xs">
                    IN STOCK
                  </span>
                )}
                {!enableLowStockBadge && !showInStockBadge && (
                  <span className="text-xs italic text-[#7A6F66]">[Clean UI: No stock badges on available items]</span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#8C7B6B] text-white shadow-xs">
                  SOLD OUT
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-[840px]">
            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Brand Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Brand Name</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Brand Tagline</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Currency Symbol</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Currency Code</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">Direct Contacts & Social Channels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">WhatsApp Contact Link / Number</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    placeholder="https://wa.me/919876543210"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                  <p className="text-xs text-[#7A6F66] mt-1">Visitors clicking WhatsApp will chat with you directly.</p>
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Instagram Profile URL</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    placeholder="https://instagram.com/zarish_official"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Support Email</label>
                  <input
                    type="email"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    placeholder="support@zarish.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Support Phone</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">SEO Search Metadata</h3>
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Default Page Title</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">Default Meta Description</label>
                <textarea
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50"
              disabled={submitting || loading}
            >
              {submitting ? 'Updating Settings...' : 'Save All Settings'}
            </button>
          </form>
        </>
      )}

      {/* ────────── TAB 2: COURIER & DELIVERY RATES SETTINGS ────────── */}
      {activeTab === 'delivery' && (
        <div className="space-y-6 max-w-[980px]">
          {deliveryError && (
            <div className="bg-[#FFEBEE] text-[#D32F2F] p-4 rounded-xl border border-[#FFCDD2] text-sm flex items-center justify-between">
              <span>{deliveryError}</span>
              <button
                type="button"
                onClick={() => setDeliveryError(null)}
                className="text-xs font-bold uppercase underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {deliverySuccess && (
            <div className="bg-[#E8F5E9] text-[#2E7D32] p-4 rounded-xl border border-[#C8E6C9] text-sm flex items-center justify-between">
              <span>{deliverySuccess}</span>
              <button
                type="button"
                onClick={() => setDeliverySuccess(null)}
                className="text-xs font-bold uppercase underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-[#E8E0D5] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-[#2C241E]">
                Configured Couriers are Active on Storefront Checkout
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDeliveryDefaults}
                className="px-3.5 py-2 text-xs font-medium text-[#7A6F66] hover:text-[#991B1B] hover:bg-[#FFEBEE] border border-[#E8E0D5] rounded-lg transition-colors cursor-pointer"
              >
                Reset to Defaults
              </button>

              <button
                type="button"
                onClick={() => handleSaveDeliverySettings()}
                disabled={deliverySubmitting || deliveryLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-all shadow-[0_2px_8px_rgba(123,91,58,0.25)] disabled:opacity-50 cursor-pointer"
              >
                {deliverySubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Delivery Settings</span>
                )}
              </button>
            </div>
          </div>

          {/* ─── SECTION 1: KERALA DELIVERY OPTIONS ─── */}
          <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F2ECE4]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#2C241E] m-0">
                    Kerala Delivery Partners
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF5FB] text-[#2980B9]">
                    3 Options Default
                  </span>
                </div>
                <p className="text-xs text-[#7A6F66] mt-1 m-0">
                  Presented when the customer selects <strong>Kerala</strong> as the delivery state. If fee is ₹0, an animated green FREE tag will pulse.
                </p>
              </div>

              <button
                type="button"
                onClick={addKeralaOption}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#7B5B3A] text-[#7B5B3A] hover:bg-[#FAF6F0] transition-colors shrink-0"
              >
                + Add Partner
              </button>
            </div>

            <div className="space-y-3.5">
              {deliveryConfig.kerala.map((option, index) => (
                <div
                  key={option.id}
                  className={`p-4 rounded-xl border transition-all ${
                    option.isActive !== false
                      ? 'border-[#E8E0D5] bg-[#FAF8F5]'
                      : 'border-dashed border-gray-300 bg-gray-50/70 opacity-70'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Active toggle */}
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`kl_active_${index}`}
                        checked={option.isActive !== false}
                        onChange={(e) => updateKeralaOption(index, { isActive: e.target.checked })}
                        className="w-4 h-4 accent-[#7B5B3A] cursor-pointer"
                      />
                      <label
                        htmlFor={`kl_active_${index}`}
                        className="text-xs font-semibold text-[#2C241E] cursor-pointer select-none"
                      >
                        {option.isActive !== false ? (
                          <span className="text-emerald-700 font-bold">Enabled</span>
                        ) : (
                          <span className="text-gray-500">Disabled</span>
                        )}
                      </label>
                    </div>

                    {/* Courier Name */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-[#7A6F66] mb-1">
                        Courier Name
                      </label>
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateKeralaOption(index, { name: e.target.value })}
                        placeholder="e.g. India Post Parcel"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] focus:outline-none focus:border-[#7B5B3A]"
                      />
                    </div>

                    {/* Delivery Timeline */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-[#7A6F66] mb-1">
                        Timeline
                      </label>
                      <input
                        type="text"
                        value={option.deliveryTime}
                        onChange={(e) => updateKeralaOption(index, { deliveryTime: e.target.value })}
                        placeholder="e.g. 3–5 Days"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] focus:outline-none focus:border-[#7B5B3A]"
                      />
                    </div>

                    {/* Price in ₹ */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#7A6F66] mb-1">
                        Charge (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#7A6F66]">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={option.price}
                          onChange={(e) =>
                            updateKeralaOption(index, { price: Math.max(0, parseInt(e.target.value) || 0) })
                          }
                          className="w-full pl-6 pr-2 py-2 text-xs sm:text-sm font-semibold border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] focus:outline-none focus:border-[#7B5B3A]"
                        />
                      </div>
                    </div>

                    {/* Delete action */}
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeKeralaOption(index)}
                        title="Remove Option"
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Sub-badge explanation */}
                  <div className="mt-2.5 pt-2 border-t border-[#E8E0D5]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#7A6F66]">
                      Checkout Preview Tag:{' '}
                      {option.price === 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          FREE (Green Blinking)
                        </span>
                      ) : (
                        <span className="font-bold text-[#2C1D13] bg-[#EAE2D8] px-2 py-0.5 rounded">
                          +₹{option.price}
                        </span>
                      )}
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">ID: {option.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SECTION 2: OTHER STATES (INTERSTATE) ─── */}
          <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F2ECE4]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#2C241E] m-0">
                    Interstate Delivery Partners (Other States)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF9E7] text-[#B7950B]">
                    Outside Kerala
                  </span>
                </div>
                <p className="text-xs text-[#7A6F66] mt-1 m-0">
                  Presented when the customer selects any other state (Tamil Nadu, Karnataka, Delhi, Maharashtra, etc.).
                </p>
              </div>

              <button
                type="button"
                onClick={addOtherStateOption}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#7B5B3A] text-[#7B5B3A] hover:bg-[#FAF6F0] transition-colors shrink-0"
              >
                + Add Partner
              </button>
            </div>

            <div className="space-y-3.5">
              {deliveryConfig.otherStates.map((option, index) => (
                <div
                  key={option.id}
                  className={`p-4 rounded-xl border transition-all ${
                    option.isActive !== false
                      ? 'border-[#E8E0D5] bg-[#FAF8F5]'
                      : 'border-dashed border-gray-300 bg-gray-50/70 opacity-70'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Active toggle */}
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`other_active_${index}`}
                        checked={option.isActive !== false}
                        onChange={(e) => updateOtherStateOption(index, { isActive: e.target.checked })}
                        className="w-4 h-4 accent-[#7B5B3A] cursor-pointer"
                      />
                      <label
                        htmlFor={`other_active_${index}`}
                        className="text-xs font-semibold text-[#2C241E] cursor-pointer select-none"
                      >
                        {option.isActive !== false ? (
                          <span className="text-emerald-700 font-bold">Enabled</span>
                        ) : (
                          <span className="text-gray-500">Disabled</span>
                        )}
                      </label>
                    </div>

                    {/* Courier Name */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-[#7A6F66] mb-1">
                        Courier Name
                      </label>
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateOtherStateOption(index, { name: e.target.value })}
                        placeholder="e.g. EMS Speed Post"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] focus:outline-none focus:border-[#7B5B3A]"
                      />
                    </div>

                    {/* Delivery Timeline */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-[#7A6F66] mb-1">
                        Timeline
                      </label>
                      <input
                        type="text"
                        value={option.deliveryTime}
                        onChange={(e) => updateOtherStateOption(index, { deliveryTime: e.target.value })}
                        placeholder="e.g. 2–5 Days"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] focus:outline-none focus:border-[#7B5B3A]"
                      />
                    </div>

                    {/* Price in ₹ */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#7A6F66] mb-1">
                        Charge (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#7A6F66]">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={option.price}
                          onChange={(e) =>
                            updateOtherStateOption(index, { price: Math.max(0, parseInt(e.target.value) || 0) })
                          }
                          className="w-full pl-6 pr-2 py-2 text-xs sm:text-sm font-semibold border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] focus:outline-none focus:border-[#7B5B3A]"
                        />
                      </div>
                    </div>

                    {/* Delete action */}
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeOtherStateOption(index)}
                        title="Remove Option"
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Sub-badge explanation */}
                  <div className="mt-2.5 pt-2 border-t border-[#E8E0D5]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#7A6F66]">
                      Checkout Preview Tag:{' '}
                      {option.price === 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          FREE (Green Blinking)
                        </span>
                      ) : (
                        <span className="font-bold text-[#2C1D13] bg-[#EAE2D8] px-2 py-0.5 rounded">
                          +₹{option.price}
                        </span>
                      )}
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">ID: {option.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SECTION 3: LIVE CHECKOUT CUSTOMER PREVIEW ─── */}
          <div className="bg-[#FAF8F5] border-2 border-dashed border-[#7B5B3A]/30 rounded-2xl p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛍️</span>
                  <h3 className="text-base font-bold text-[#2C1D13] m-0">
                    Live Storefront Checkout Preview
                  </h3>
                </div>
                <p className="text-xs text-[#7A6F66] mt-0.5 m-0">
                  Interactive simulation of how customers will see and select delivery options in their browser.
                </p>
              </div>

              {/* State simulator tabs */}
              <div className="flex items-center gap-1 bg-white border border-[#E8E0D5] p-1 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewState('kerala')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    previewState === 'kerala'
                      ? 'bg-[#7B5B3A] text-white shadow-xs'
                      : 'text-[#6B5744] hover:bg-[#FAF8F5]'
                  }`}
                >
                  🌴 Kerala Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewState('other')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    previewState === 'other'
                      ? 'bg-[#7B5B3A] text-white shadow-xs'
                      : 'text-[#6B5744] hover:bg-[#FAF8F5]'
                  }`}
                >
                  🇮🇳 Other States (Tamil Nadu, etc.)
                </button>
              </div>
            </div>

            {/* Simulated Checkout Box */}
            <div className="bg-white rounded-xl border border-[#E8E0D5] p-4 sm:p-5 shadow-xs">
              <label className="block text-xs font-semibold text-[#3D2B1F] mb-2">
                Select Courier Partner {previewState === 'kerala' ? '(Across Kerala)' : '(Interstate Delivery)'}
              </label>

              <div
                className={`grid grid-cols-1 ${
                  previewState === 'kerala' && activePreviewOptions.length > 1
                    ? 'sm:grid-cols-3'
                    : 'sm:grid-cols-1'
                } gap-2.5 mb-4`}
              >
                {activePreviewOptions.map((opt) => {
                  const isSelected = previewSelectedId === opt.id;
                  const isFree = opt.price === 0;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setPreviewSelectedId(opt.id)}
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
                            {opt.name}
                          </h4>
                          <span className="text-[10.5px] font-medium text-[#7A6F66] block leading-tight mt-0.5">
                            {opt.deliveryTime}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isFree ? (
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
                            +₹{opt.price}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulated Price Summary */}
              <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E8E0D5] flex flex-wrap items-center justify-between text-xs text-[#2C1D13]">
                <div className="flex items-center gap-4">
                  <span>Product Subtotal: <strong>₹{mockSubtotal.toLocaleString()}</strong></span>
                  <span>
                    Shipping Charge ({selectedPreviewOption?.name || 'Courier'}):{' '}
                    <strong className={previewDeliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
                      {previewDeliveryFee === 0 ? 'FREE SHIPPING' : `+₹${previewDeliveryFee}`}
                    </strong>
                  </span>
                </div>
                <div className="font-bold text-sm text-[#7B5B3A]">
                  Final Customer Total: ₹{mockTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleSaveDeliverySettings()}
              disabled={deliverySubmitting || deliveryLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold tracking-wider uppercase rounded-xl bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-all shadow-[0_4px_16px_rgba(123,91,58,0.25)] disabled:opacity-50 cursor-pointer"
            >
              {deliverySubmitting ? 'Saving Settings...' : 'Save Courier & Delivery Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#7A6F66]">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
