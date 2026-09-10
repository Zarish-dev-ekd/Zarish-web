'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { loadRazorpayScript } from '@/lib/loadRazorpay';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedSize: string;
  quantity: number;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  product,
  selectedSize,
  quantity,
}: CheckoutModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer & Shipping fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Kerala');
  const [postalCode, setPostalCode] = useState('');

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

  // Pre-fill if authenticated
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
          setStateName(addr.state || 'Kerala');
          setPostalCode(addr.postalCode || '');
        }
      }
    }
    if (isOpen) {
      loadUser();
    }
  }, [isOpen, supabase]);

  if (!isOpen) return null;

  const subtotal = product.price * quantity;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = Math.max(1, subtotal - discountAmount);

  const primaryImg =
    product.images?.find((img) => img.role === 'primary')?.secure_url ||
    product.images?.[0]?.secure_url ||
    '';

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
        setCouponError(data.error || 'Invalid coupon code.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          discountType: data.coupon.discount_type,
          discountValue: data.coupon.discount_value,
        });
        setCouponInput('');
      }
    } catch (err: any) {
      setCouponError('Failed to validate coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !postalCode.trim()) {
      setError('Please complete all shipping address fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create order via API
      const res = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          size: selectedSize,
          customer: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
          shippingAddress: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            addressLine1: addressLine1.trim(),
            city: city.trim(),
            state: stateName.trim(),
            postalCode: postalCode.trim(),
            country: 'India',
          },
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to initialize payment order');
      }

      // 2. If running in Simulation Mode (before live keys added):
      if (data.isSimulated) {
        // Automatically simulate payment success and proceed
        router.push(`/order-confirmation/${data.orderNumber}`);
        onClose();
        return;
      }

      // 3. Load Razorpay script and open live gateway
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Could not load Razorpay SDK. Please check your internet connection.');
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'ZARISH by Nehala Mufeed',
        description: `Order ${data.orderNumber} - ${product.name}`,
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
            if (verifyData.success) {
              router.push(`/order-confirmation/${data.orderNumber}`);
              onClose();
            } else {
              setError('Payment verification incomplete. Please contact support.');
            }
          } catch (vErr) {
            console.error('Verify error:', vErr);
            router.push(`/order-confirmation/${data.orderNumber}`);
            onClose();
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err?.message || 'Failed to process checkout');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2D5C7] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E2D5C7] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#7B5B3A] uppercase block">
              Secure Checkout
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#2C1D13]">
              Express Order with Razorpay
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#6B5744] hover:text-[#2C1D13] flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Order Item Preview */}
        <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E2D5C7] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {primaryImg ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={primaryImg}
                alt={product.name}
                className="w-14 h-16 rounded-xl object-cover border border-[#E2D5C7]"
              />
            ) : (
              <div className="w-14 h-16 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-xs">
                👗
              </div>
            )}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2C1D13]">{product.name}</h4>
              <p className="text-[11px] text-[#8C7B6B]">
                Size: <strong className="text-[#2C1D13]">{selectedSize}</strong> • Quantity: {quantity}
              </p>
            </div>
          </div>
          <div className="text-right">
            {appliedCoupon ? (
              <div>
                <span className="text-xs text-[#8C7B6B] line-through block leading-none mb-1">
                  {formatPrice(subtotal)}
                </span>
                <div className="text-sm sm:text-base font-bold text-[#2C1D13]">
                  {formatPrice(finalPrice)}
                </div>
                <span className="text-[10px] text-[#047857] font-bold uppercase tracking-wider block">
                  Saved {formatPrice(discountAmount)}
                </span>
              </div>
            ) : (
              <div>
                <div className="text-sm sm:text-base font-bold text-[#2C1D13]">
                  {formatPrice(subtotal)}
                </div>
                <span className="text-[10px] text-[#0E7064] font-semibold uppercase tracking-wider block">
                  Free Express Shipping
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Coupon Code Section */}
        <div className="px-5 py-3.5 sm:px-6 bg-white border-b border-[#E2D5C7]">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-[#EBF8F2] border border-[#A7F3D0] rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-[#0E7064]">★</span>
                <div>
                  <div className="text-xs font-bold text-[#065F46] font-mono tracking-wider">
                    {appliedCoupon.code} APPLIED
                  </div>
                  <p className="text-[11px] text-[#047857]">
                    You save {formatPrice(appliedCoupon.discountAmount)} (
                    {appliedCoupon.discountType === 'percentage'
                      ? `${appliedCoupon.discountValue}% OFF`
                      : 'Flat Discount'}
                    )
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs font-semibold text-[#991B1B] hover:text-[#DC2626] transition-colors px-2 py-1"
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder="Have a coupon code? (e.g. WELCOME10)"
                  className="flex-1 h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm font-mono uppercase text-[#2C1D13] placeholder-[#A89887] focus:outline-none focus:border-[#7B5B3A] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 h-10 rounded-xl bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {couponError && (
                <p className="text-xs text-[#991B1B] mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {couponError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleCheckout} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-xs bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ayesha Rahman"
                className="w-full h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">Phone Number (Required for Delivery) *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">Delivery Address *</label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="House/Flat No., Street, Landmark"
              className="w-full h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">State *</label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="State"
                className="w-full h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">PIN Code *</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="PIN"
                className="w-full h-10 px-3 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white"
              />
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-between pt-3 text-[11px] text-[#8C7B6B]">
            <span>🔒 256-Bit SSL Encrypted</span>
            <span>⚡ UPI, Cards & Netbanking via Razorpay</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all shadow-[0_4px_16px_rgba(44,29,19,0.2)] hover:shadow-[0_6px_20px_rgba(123,91,58,0.3)] active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Opening Razorpay Gateway...</span>
              </>
            ) : (
              <span>Proceed to Pay {formatPrice(finalPrice)}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
