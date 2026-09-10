'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CustomerAccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'security'>('orders');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserAndOrders() {
      try {
        setLoading(true);
        const {
          data: { user: authUser },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr || !authUser) {
          router.push('/login?redirect=/account');
          return;
        }

        setUser(authUser);
        setFullName(
          authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split('@')[0] ||
            ''
        );
        setPhone(authUser.user_metadata?.phone || '');

        if (authUser.user_metadata?.address) {
          const addr = authUser.user_metadata.address;
          setAddressLine1(addr.addressLine1 || '');
          setAddressLine2(addr.addressLine2 || '');
          setCity(addr.city || '');
          setStateName(addr.state || '');
          setPostalCode(addr.postalCode || '');
        }

        // Fetch Orders for this user
        setLoadingOrders(true);
        const { data: userOrders, error: ordersErr } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .or(`user_id.eq.${authUser.id},customer_email.eq.${authUser.email}`)
          .order('created_at', { ascending: false });

        if (!ordersErr && userOrders) {
          setOrders(userOrders as Order[]);
        }
      } catch (err) {
        console.error('Account load error:', err);
      } finally {
        setLoading(false);
        setLoadingOrders(false);
      }
    }

    loadUserAndOrders();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          address: {
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim(),
            city: city.trim(),
            state: stateName.trim(),
            postalCode: postalCode.trim(),
            country: 'India',
          },
        },
      });

      if (error) throw error;
      setProfileMessage('Your profile & delivery address have been updated successfully.');
    } catch (err: any) {
      console.error('Update profile error:', err);
      setProfileMessage('Error updating profile: ' + (err?.message || 'Please try again.'));
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="text-center">
          <span className="w-8 h-8 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin inline-block mb-3" />
          <p className="text-xs text-[#6B5744]">Loading your ZARISH account...</p>
        </div>
      </div>
    );
  }

  const initials = (fullName || user?.email || 'Z')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <Header navigationItems={[]} cartItemCount={0} />

      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Customer Profile Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2D5C7]/80 shadow-[0_4px_24px_rgba(44,29,19,0.04)] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF6F0] border-2 border-[#C8A97E] text-[#7B5B3A] font-display font-bold text-xl sm:text-2xl flex items-center justify-center shadow-inner flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-[#2C1D13]">
                  {fullName || 'Valued Client'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FAF6F0] text-[#7B5B3A] border border-[#E2D5C7]">
                  Maison Member
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8C7B6B] mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full border border-[#D9C9B8] text-xs font-semibold text-[#6B5744] hover:bg-[#FAF6F0] hover:text-[#2C1D13] transition-all text-center"
            >
              Admin Portal
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-xs"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E2D5C7] mb-8 gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all border-b-2 ${
              activeTab === 'orders'
                ? 'border-[#2C1D13] text-[#2C1D13]'
                : 'border-transparent text-[#8C7B6B] hover:text-[#2C1D13]'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'border-[#2C1D13] text-[#2C1D13]'
                : 'border-transparent text-[#8C7B6B] hover:text-[#2C1D13]'
            }`}
          >
            Profile & Delivery Address
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all border-b-2 ${
              activeTab === 'security'
                ? 'border-[#2C1D13] text-[#2C1D13]'
                : 'border-transparent text-[#8C7B6B] hover:text-[#2C1D13]'
            }`}
          >
            Security & Payments
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="text-center py-16">
                <span className="w-6 h-6 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin inline-block mb-2" />
                <p className="text-xs text-[#8C7B6B]">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-[#E2D5C7]/80 shadow-xs">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FAF6F0] flex items-center justify-center text-2xl text-[#7B5B3A]">
                  🛍️
                </div>
                <h3 className="font-display text-xl font-bold text-[#2C1D13] mb-2">
                  No orders placed yet
                </h3>
                <p className="text-xs sm:text-sm text-[#6B5744] max-w-md mx-auto mb-6">
                  Explore our curated modest abayas, hijabs, and signature dresses crafted with
                  exceptional craftsmanship.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all shadow-sm"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const isPaid = order.payment_status === 'paid';
                  const dateFormatted = new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2D5C7]/80 p-5 sm:p-7 shadow-[0_2px_12px_rgba(44,29,19,0.03)]"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2D5C7]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#2C1D13]">
                              {order.order_number}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                isPaid
                                  ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                  : 'bg-[#FFF3E0] text-[#E65100]'
                              }`}
                            >
                              {isPaid ? 'Paid via Razorpay' : 'Payment Pending'}
                            </span>
                          </div>
                          <p className="text-xs text-[#8C7B6B] mt-0.5">Placed on {dateFormatted}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-base sm:text-lg font-bold text-[#2C1D13]">
                            {formatPrice(order.total_amount)}
                          </div>
                          <span className="text-[11px] font-semibold text-[#7B5B3A] uppercase tracking-wider">
                            Status: {order.order_status}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-[#E2D5C7]/50 my-4">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item) => (
                            <div
                              key={item.id}
                              className="py-3 flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3">
                                {item.image_url ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={item.image_url}
                                    alt={item.product_name}
                                    className="w-12 h-14 sm:w-14 sm:h-16 rounded-lg object-cover bg-[#FAF6F0]"
                                  />
                                ) : (
                                  <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-xs text-[#8C7B6B]">
                                    Garment
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-xs sm:text-sm font-semibold text-[#2C1D13]">
                                    {item.product_name}
                                  </h4>
                                  <p className="text-[11px] text-[#8C7B6B]">
                                    Size: {item.size || 'Standard'} • Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs sm:text-sm font-semibold text-[#2C1D13]">
                                {formatPrice(item.total_price)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-[#8C7B6B] py-2">
                            Order details registered in database.
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2D5C7]/60 text-xs text-[#6B5744]">
                        <div>
                          {order.shipping_address?.city && (
                            <span>
                              Shipping to: {order.shipping_address.city},{' '}
                              {order.shipping_address.state}
                            </span>
                          )}
                        </div>
                        {order.tracking_number && (
                          <div className="font-mono text-[11px] bg-[#FAF6F0] px-2.5 py-1 rounded-md border border-[#E2D5C7]">
                            Tracking: {order.tracking_number}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2D5C7]/80 shadow-xs max-w-2xl">
            <h3 className="font-display text-xl font-bold text-[#2C1D13] mb-2">
              Default Shipping Address
            </h3>
            <p className="text-xs sm:text-sm text-[#6B5744] mb-6">
              Save your address for 1-click Razorpay checkout and seamless doorstep delivery.
            </p>

            {profileMessage && (
              <div
                className={`mb-6 p-3.5 rounded-xl text-xs sm:text-sm ${
                  profileMessage.includes('Error')
                    ? 'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]'
                    : 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                }`}
              >
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">
                  Phone Number (for Courier updates)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">
                  Street Address / Flat / Building
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. Villa 42, Rose Garden Street"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kozhikode"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Kerala"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">
                  Postal PIN Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 673001"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D9C9B8] bg-[#FAF8F5] text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full h-11 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-xs mt-4"
              >
                {savingProfile ? 'Saving Details...' : 'Save Delivery Address'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Security & Payments */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2D5C7]/80 shadow-xs max-w-2xl space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-[#2C1D13] mb-1">
                Payment Security & Gateway
              </h3>
              <p className="text-xs sm:text-sm text-[#6B5744]">
                ZARISH uses bank-grade 256-bit SSL encryption powered by <strong>Razorpay</strong>.
                We do not store your credit/debit card numbers or UPI PINs on our servers.
              </p>
            </div>

            <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E2D5C7] space-y-2 text-xs text-[#6B5744]">
              <div className="font-bold text-[#2C1D13]">Supported Payment Options via Razorpay:</div>
              <ul className="list-disc list-inside space-y-1 text-[#6B5744]">
                <li>UPI (Google Pay, PhonePe, Paytm, BHIM)</li>
                <li>Credit & Debit Cards (Visa, Mastercard, RuPay, Amex)</li>
                <li>Net Banking across 50+ major Indian banks</li>
                <li>Cash on Delivery (on select pin codes)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-[#2C1D13] mb-1">Account Password</h4>
              <p className="text-xs text-[#8C7B6B] mb-3">
                Need to change or update your account password?
              </p>
              <button
                type="button"
                onClick={() => {
                  if (user?.email) {
                    supabase.auth
                      .resetPasswordForEmail(user.email, {
                        redirectTo: `${window.location.origin}/auth/callback?next=/account`,
                      })
                      .then(() => {
                        alert('Password reset link has been dispatched to your email.');
                      });
                  }
                }}
                className="px-5 py-2.5 rounded-full border border-[#7B5B3A] text-[#7B5B3A] text-xs font-semibold hover:bg-[#FAF6F0] transition-all"
              >
                Send Password Reset Email
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer
        footerGroups={[]}
        brandDescription="ZARISH by Nehala Mufeed — High craftsmanship modest fashion."
        socialLinks={{}}
      />
    </div>
  );
}
