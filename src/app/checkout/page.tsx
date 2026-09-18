'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { IconArrowRight, IconShield, IconTruck, IconShoppingBag } from '@/components/icons';
import { INDIAN_STATES } from '@/lib/constants';
import { loadRazorpayScript } from '@/lib/loadRazorpay';
import type { Product } from '@/lib/types';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart();

  // Mode: direct item or cart checkout
  const productId = searchParams.get('product');
  const sizeParam = searchParams.get('size') || 'Standard';
  const colorParam = searchParams.get('color') || '';
  const quantityParam = parseInt(searchParams.get('quantity') || '1', 10);

  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(Boolean(productId));

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment method: 100% Online Payment
  const paymentMethod = 'online';

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load direct product if query has product ID
  useEffect(() => {
    async function loadDirectProduct() {
      if (!productId) return;
      try {
        setProductLoading(true);
        const { data, error: err } = await supabase
          .from('products')
          .select(`*, images:product_images(*)`)
          .eq('id', productId)
          .single();

        if (err || !data) {
          console.error('Error fetching checkout product:', err);
        } else {
          setDirectProduct(data as Product);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setProductLoading(false);
      }
    }
    loadDirectProduct();
  }, [productId, supabase]);

  // Pre-fill user profile if logged in
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || '');
        setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
        setPhone(user.user_metadata?.phone || '');
        if (user.user_metadata?.address) {
          const addr = user.user_metadata.address;
          setAddressLine1(addr.addressLine1 || '');
          setCity(addr.city || '');
          setStateName(addr.state || '');
          setPostalCode(addr.postalCode || '');
        }
      }
    }
    loadUser();
  }, [supabase]);

  // Calculate prices
  const isDirect = Boolean(productId && directProduct);
  const subtotal = isDirect
    ? Number(directProduct!.price) * Math.max(1, quantityParam)
    : cartSubtotal;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const isKerala = stateName?.trim().toLowerCase() === 'kerala';
  const deliveryFee = stateName ? (isKerala ? 0 : 50) : 0;
  const finalTotal = Math.max(1, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim(),
          orderAmount: subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
        });
        setCouponError(null);
      }
    } catch (err: any) {
      setCouponError('Could not validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in your name, email, and phone number.');
      return;
    }

    if (!addressLine1.trim() || !city.trim() || !postalCode.trim()) {
      setError('Please provide your complete delivery address and pincode.');
      return;
    }

    if (!isDirect && (!cartItems || cartItems.length === 0)) {
      setError('Your shopping bag is empty.');
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        customer: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        },
        shippingAddress: {
          addressLine1: addressLine1.trim(),
          city: city.trim(),
          state: stateName.trim(),
          postalCode: postalCode.trim(),
          phone: phone.trim(),
        },
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        notes: orderNotes.trim() || null,
      };

      if (isDirect) {
        payload.productId = directProduct!.id;
        payload.quantity = quantityParam;
        payload.size = sizeParam;
        payload.color = colorParam || null;
      } else {
        payload.items = cartItems;
      }

      const res = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment order.');
      }

      // 2. Load Razorpay Checkout SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Could not load Razorpay payment gateway. Please check your connection.');
      }

      // 3. Open Razorpay Checkout Window
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'ZARISH by Nehala Mufeed',
        description: `Order #${data.orderNumber}`,
        image: '/logo-zarish.png',
        order_id: data.razorpayOrderId,
        prefill: {
          name: fullName.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        theme: {
          color: '#7B5B3A',
        },
        handler: async function (response: any) {
          try {
            setSubmitting(true);
            const verifyRes = await fetch('/api/payment/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderNumber: data.orderNumber,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              if (!isDirect) {
                clearCart();
              }
              router.push(`/order-confirmation/${data.orderNumber}`);
            } else {
              setError(verifyData.error || 'Payment verification failed. Please contact support.');
              setSubmitting(false);
            }
          } catch (vErr: any) {
            console.error('Payment verification request failed:', vErr);
            setError(
              'Could not verify payment with server. If your account was debited, contact support with Order #' +
                data.orderNumber
            );
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp: any) {
        setError(resp.error?.description || 'Payment was unsuccessful. Please try again.');
        setSubmitting(false);
      });
      razorpayInstance.open();
    } catch (err: any) {
      console.error('Order submission error:', err);
      setError(err?.message || 'Something went wrong while initiating checkout.');
      setSubmitting(false);
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#7B5B3A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasItems = isDirect || (cartItems && cartItems.length > 0);

  if (!hasItems) {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F5EDE3] text-[#7B5B3A] flex items-center justify-center mx-auto mb-4">
          <IconShoppingBag size={24} />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#2C1D13] mb-2">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-sm text-[#6B5744] mb-6">
          Explore our graceful modest collection and add pieces to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2C1D13] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#7B5B3A] transition-colors"
        >
          <span>Explore Collections</span>
          <IconArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 pb-10 lg:pb-14">
      {/* Page Header */}
      <div className="mb-8 md:mb-10 text-center md:text-left">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#7B5B3A] uppercase block mb-1">
          CONFIRM YOUR ORDER
        </span>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1D13]">
          Checkout & Delivery
        </h1>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] border border-[#FECACA] rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      <form id="checkout-form" onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ─── LEFT: Delivery Details & Payment Choice (7 cols) ─── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Contact Info */}
            <div className="bg-white border border-[#E8E0D5] rounded-2xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h2 className="text-base font-bold text-[#2C1D13] uppercase tracking-wider mb-4 pb-2 border-b border-[#F2ECE4]">
                1. Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3D2B1F] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2D5C7] rounded-xl bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:border-[#7B5B3A] focus:outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D2B1F] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2D5C7] rounded-xl bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:border-[#7B5B3A] focus:outline-hidden transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D2B1F] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2D5C7] rounded-xl bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:border-[#7B5B3A] focus:outline-hidden transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white border border-[#E8E0D5] rounded-2xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h2 className="text-base font-bold text-[#2C1D13] uppercase tracking-wider mb-4 pb-2 border-b border-[#F2ECE4]">
                2. Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3D2B1F] mb-1.5">
                    Street Address / House No. / Flat / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="House no., building, street, area, landmark"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2D5C7] rounded-xl bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:border-[#7B5B3A] focus:outline-hidden transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3D2B1F] mb-1.5">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City / Town"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2D5C7] rounded-xl bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:border-[#7B5B3A] focus:outline-hidden transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3D2B1F] mb-1.5">
                      State *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className={`w-full appearance-none px-4 py-2.5 pr-10 text-xs sm:text-sm border border-[#E2D5C7] rounded-xl bg-white transition-colors focus:border-[#7B5B3A] focus:outline-hidden cursor-pointer ${
                          !stateName ? 'text-[#8C7B6B]' : 'text-[#2C1D13] font-medium'
                        }`}
                      >
                        <option value="" disabled>
                          Select State
                        </option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state} className="text-[#2C1D13]">
                            {state}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8C7B6B]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3D2B1F] mb-1.5">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="PIN code"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2D5C7] rounded-xl bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:border-[#7B5B3A] focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D2B1F] mb-1.5">
                    Order Notes / Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Special instructions for delivery (optional)"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2D5C7] rounded-xl bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:border-[#7B5B3A] focus:outline-hidden transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ─── RIGHT: Order Summary & Confirm (5 cols) ─── */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border border-[#E8E0D5] rounded-2xl p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sticky top-24">
              <h2 className="text-base font-bold text-[#2C1D13] uppercase tracking-wider mb-4 pb-2 border-b border-[#F2ECE4]">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="divide-y divide-[#F2ECE4] max-h-[300px] overflow-y-auto mb-5 pr-1">
                {isDirect ? (
                  <div className="py-3.5 first:pt-0 flex items-center gap-3.5">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#FAF6F0] border border-[#E2D5C7] shrink-0">
                      {directProduct!.images?.[0]?.secure_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={optimizeCloudinaryUrl(directProduct!.images[0].secure_url, { width: 140 })}
                          alt={directProduct!.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#EDE4DC]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[#2C1D13] truncate">
                        {directProduct!.name}
                      </h4>
                      <p className="text-[11px] text-[#8C7B6B] mt-0.5">
                        {colorParam ? `${colorParam} • ` : ''}Size: {sizeParam} • Qty: {quantityParam}
                      </p>
                      <p className="text-xs font-bold text-[#7B5B3A] mt-1">
                        {formatPrice(Number(directProduct!.price) * quantityParam)}
                      </p>
                    </div>
                  </div>
                ) : (
                  cartItems.map((it) => (
                    <div key={it.id} className="py-3.5 first:pt-0 flex items-center gap-3.5">
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#FAF6F0] border border-[#E2D5C7] shrink-0">
                        {it.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={optimizeCloudinaryUrl(it.image_url, { width: 140 })}
                            alt={it.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#EDE4DC]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#2C1D13] truncate">
                          {it.name}
                        </h4>
                        <p className="text-[11px] text-[#8C7B6B] mt-0.5">
                          {it.color ? `${it.color} • ` : ''}Size: {it.size || 'Standard'} • Qty: {it.quantity}
                        </p>
                        <p className="text-xs font-bold text-[#7B5B3A] mt-1">
                          {formatPrice(it.price * it.quantity)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Coupon Box */}
              <div className="mb-5 pb-5 border-b border-[#F2ECE4]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7B5B3A] mb-1.5">
                  Have a Coupon Code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 px-3.5 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl">
                    <span className="text-xs font-mono font-bold text-[#2E7D32]">
                      ✓ {appliedCoupon.code} applied {formatPrice(appliedCoupon.discountAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-[#D32F2F] hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3.5 py-2 text-xs border border-[#E2D5C7] rounded-xl uppercase font-mono bg-white text-[#2C1D13]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 rounded-xl bg-[#7B5B3A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#613B24] transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-[11px] text-[#D32F2F] mt-1.5">{couponError}</p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 mb-6 text-xs sm:text-sm">
                <div className="flex justify-between text-[#6B5744]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2C1D13]">{formatPrice(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[#8B4E5A]">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-{formatPrice(appliedCoupon.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[#6B5744]">
                  <span>Delivery Charge</span>
                  {stateName ? (
                    isKerala ? (
                      <span className="font-bold text-[#0E7064]">FREE SHIPPING</span>
                    ) : (
                      <span className="font-bold text-[#2C1D13]">{formatPrice(deliveryFee)}</span>
                    )
                  ) : (
                    <span className="text-[11px] text-[#8C7B6B]">FREE in Kerala / ₹50 Other States</span>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E8E0D5] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#2C1D13] uppercase tracking-wider">
                    Total Amount
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-[#2C1D13]">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-sm tracking-[0.14em] uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(44,29,19,0.22)] hover:shadow-[0_8px_26px_rgba(123,91,58,0.32)] active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <span>Opening Payment Gateway...</span>
                ) : (
                  <span>Pay with Razorpay</span>
                )}
              </button>

              {/* Guarantees */}
              <div className="mt-5 pt-4 border-t border-[#F2ECE4] space-y-2 text-[11px] text-[#8C7B6B]">
                <div className="flex items-center gap-2">
                  <IconTruck size={14} className="text-[#7B5B3A] shrink-0" />
                  <span>Free delivery across Kerala • ₹50 for other states</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconShield size={14} className="text-[#7B5B3A] shrink-0" />
                  <span>Instant email confirmation to you and our workshop</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Sticky Mobile Bottom Navbar */}
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E2D5C7] px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(44,29,19,0.12)] flex items-center justify-between gap-4 lg:hidden">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7B6B]">
              Total Amount
            </span>
            <span className="text-lg sm:text-xl font-bold text-[#2C1D13] leading-tight">
              {formatPrice(finalTotal)}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex-1 max-w-[200px] min-h-[50px] h-[50px] rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-[0.12em] uppercase transition-all duration-200 flex items-center justify-center shadow-[0_4px_16px_rgba(44,29,19,0.2)] active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Opening Payment Gateway...' : 'Pay with Razorpay'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <Header navigationItems={[]} cartItemCount={0} />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <span className="w-8 h-8 border-2 border-[#7B5B3A] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer
        footerGroups={[]}
        brandDescription="ZARISH by Nehala Mufeed celebrates modesty as effortless grace."
        socialLinks={{}}
      />
    </div>
  );
}
