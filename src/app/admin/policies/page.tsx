'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RefundPolicyForm {
  eyebrow: string;
  title: string;
  last_updated: string;
  highlight_box: {
    title: string;
    main_rule: string;
    detail: string;
  };
  section1: {
    heading: string;
    intro: string;
    points: string[];
  };
  section2: {
    heading: string;
    intro: string;
    points: string[];
  };
  section3?: {
    heading: string;
    intro: string;
    approval_text: string;
    bank_credit_text: string;
  };
  section4: {
    heading: string;
    intro: string;
    whatsapp: string;
    email: string;
    hours: string;
  };
}

const DEFAULT_REFUND_POLICY: RefundPolicyForm = {
  eyebrow: 'Customer Assurance & Guidelines',
  title: 'Refund & Return Policy',
  last_updated: 'Last updated: September 2026 • Valid for all online purchases on zarish.in',
  highlight_box: {
    title: 'Mandatory Unboxing Video Requirement',
    main_rule: 'Refunds are applicable only for damaged or defective products received by the customer.',
    detail:
      'To claim a refund, you must contact our official WhatsApp support (+91 9562292945) within 24 to 48 hours of delivery with a complete, uncut unboxing video (recorded continuously from start to end without pauses or cuts, showing the sealed courier package being opened and the defect clearly inspected). Requests raised after 48 hours of delivery cannot be entertained.',
  },
  section1: {
    heading: '1. Return & Refund Criteria',
    intro: 'A return or refund is accepted strictly under the following conditions:',
    points: [
      'The item received has physical transit damage, tears, or factory manufacturing defects.',
      'An incorrect product, size, or color was delivered compared to your confirmed order details.',
      'The garment must remain unwashed, unworn, unironed, with all original brand tags, embroidery guards, and packaging intact.',
    ],
  },
  section2: {
    heading: '2. Non-Returnable Items',
    intro: 'In accordance with modest fashion hygiene standards and custom artistry:',
    points: [
      'Custom-tailored, bespoke altered, or personalized garments made to custom measurements.',
      'Hijabs, under-caps, and inner slips once removed from sealed packaging.',
      'Items bought during clearance sales or archive warehouse discount events.',
      'Products without an authentic, continuous unboxing video.',
    ],
  },
  section4: {
    heading: '3. How to Initiate a Refund Request',
    intro: 'Send your order reference number and unboxing video directly to our support team:',
    whatsapp: '+91 9562292945',
    email: 'zarish2025co@gmail.com',
    hours: 'Monday – Saturday, 9:30 AM – 7:00 PM IST',
  },
};

const DEFAULT_PRIVACY_POLICY = {
  eyebrow: 'Legal & Transparency',
  title: 'Privacy Policy',
  last_updated: 'Last updated: September 2026 • Effective Date: Immediate',
  intro:
    'Welcome to ZARISH by Nehala Mufeed ("we", "our", or "us"). We respect your privacy and are committed to protecting your personal data in full compliance with the Information Technology Act, 2000 and applicable consumer protection regulations in India. This Privacy Policy details how we collect, utilize, and safeguard your details when you visit our website or purchase our modest luxury garments.',
  collect_intro: 'We collect only necessary information required to process and dispatch your orders:',
  collect_points: [
    'Identity & Contact: Full name, email address, phone number, and delivery address.',
    'Order & Transaction Details: Products purchased, size, color preferences, order totals, and generated order reference numbers.',
    'Payment Information: All online card, UPI, and net banking transactions are processed securely via our certified payment partner, Razorpay. ZARISH does NOT store or have access to your credit/debit card numbers, CVV, or UPI PINs.',
    'Technical Data: IP address, device type, browser settings, and page navigation metrics to ensure a seamless checkout experience.',
  ],
  use_points: [
    'To confirm, fulfill, pack, and ship your luxury apparel orders.',
    'To dispatch real-time order tracking numbers, delivery updates, and digital tax receipts.',
    'To provide dedicated customer support regarding custom sizing, unboxing verification, and queries via WhatsApp or email.',
    'To prevent fraudulent transactions and maintain store security.',
  ],
  payment_security:
    'We use Razorpay as our authoritative payment gateway. Razorpay is certified with PCI-DSS (Payment Card Industry Data Security Standard) Level 1 compliance — the highest standard of online payment security. All transmissions are protected with end-to-end 256-bit SSL encryption.',
  sharing_intro:
    'We never sell, rent, or trade your personal data to third parties. We share information strictly with verified partners essential for delivering your order:',
  sharing_points: [
    'Authorized delivery courier networks (to deliver packages to your doorstep).',
    'Razorpay payment infrastructure (to securely process payment verifications).',
    'Legal or government authorities only when strictly required by Indian law.',
  ],
  data_retention:
    'We retain your order details for legitimate accounting and tax audit purposes under Indian commercial laws. You have the right to request access to your stored personal information, correct any inaccuracies, or request account closure by contacting us.',
  contact_email: 'zarish2025co@gmail.com',
  contact_whatsapp: '+91 9562292945',
  contact_location: 'Kerala, India',
};

export default function AdminPoliciesPage() {
  const [activeTab, setActiveTab] = useState<'refund' | 'privacy'>('refund');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for Refund Policy
  const [eyebrow, setEyebrow] = useState(DEFAULT_REFUND_POLICY.eyebrow);
  const [title, setTitle] = useState(DEFAULT_REFUND_POLICY.title);
  const [lastUpdated, setLastUpdated] = useState(DEFAULT_REFUND_POLICY.last_updated);
  const [highlightTitle, setHighlightTitle] = useState(DEFAULT_REFUND_POLICY.highlight_box.title);
  const [highlightRule, setHighlightRule] = useState(DEFAULT_REFUND_POLICY.highlight_box.main_rule);
  const [highlightDetail, setHighlightDetail] = useState(DEFAULT_REFUND_POLICY.highlight_box.detail);
  const [s1Heading, setS1Heading] = useState(DEFAULT_REFUND_POLICY.section1.heading);
  const [s1Intro, setS1Intro] = useState(DEFAULT_REFUND_POLICY.section1.intro);
  const [s1PointsText, setS1PointsText] = useState(DEFAULT_REFUND_POLICY.section1.points.join('\n'));
  const [s2Heading, setS2Heading] = useState(DEFAULT_REFUND_POLICY.section2.heading);
  const [s2Intro, setS2Intro] = useState(DEFAULT_REFUND_POLICY.section2.intro);
  const [s2PointsText, setS2PointsText] = useState(DEFAULT_REFUND_POLICY.section2.points.join('\n'));
  const [s4Heading, setS4Heading] = useState(DEFAULT_REFUND_POLICY.section4.heading);
  const [s4Intro, setS4Intro] = useState(DEFAULT_REFUND_POLICY.section4.intro);
  const [s4Whatsapp, setS4Whatsapp] = useState(DEFAULT_REFUND_POLICY.section4.whatsapp);
  const [s4Email, setS4Email] = useState(DEFAULT_REFUND_POLICY.section4.email);
  const [s4Hours, setS4Hours] = useState(DEFAULT_REFUND_POLICY.section4.hours);

  // Form states for Privacy Policy
  const [privEyebrow, setPrivEyebrow] = useState(DEFAULT_PRIVACY_POLICY.eyebrow);
  const [privTitle, setPrivTitle] = useState(DEFAULT_PRIVACY_POLICY.title);
  const [privLastUpdated, setPrivLastUpdated] = useState(DEFAULT_PRIVACY_POLICY.last_updated);
  const [privIntro, setPrivIntro] = useState(DEFAULT_PRIVACY_POLICY.intro);
  const [privCollectIntro, setPrivCollectIntro] = useState(DEFAULT_PRIVACY_POLICY.collect_intro);
  const [privCollectPointsText, setPrivCollectPointsText] = useState(DEFAULT_PRIVACY_POLICY.collect_points.join('\n'));
  const [privUsePointsText, setPrivUsePointsText] = useState(DEFAULT_PRIVACY_POLICY.use_points.join('\n'));
  const [privSecurity, setPrivSecurity] = useState(DEFAULT_PRIVACY_POLICY.payment_security);
  const [privSharingIntro, setPrivSharingIntro] = useState(DEFAULT_PRIVACY_POLICY.sharing_intro);
  const [privSharingPointsText, setPrivSharingPointsText] = useState(DEFAULT_PRIVACY_POLICY.sharing_points.join('\n'));
  const [privRetention, setPrivRetention] = useState(DEFAULT_PRIVACY_POLICY.data_retention);
  const [privEmail, setPrivEmail] = useState(DEFAULT_PRIVACY_POLICY.contact_email);
  const [privWhatsapp, setPrivWhatsapp] = useState(DEFAULT_PRIVACY_POLICY.contact_whatsapp);
  const [privLocation, setPrivLocation] = useState(DEFAULT_PRIVACY_POLICY.contact_location);

  useEffect(() => {
    async function loadPolicy() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (activeTab === 'refund') {
          const res = await fetch('/api/policies/refund-policy');
          const json = await res.json();
          if (json?.policy) {
            const p = json.policy;
            setEyebrow(p.eyebrow || DEFAULT_REFUND_POLICY.eyebrow);
            setTitle(p.title || DEFAULT_REFUND_POLICY.title);
            setLastUpdated(p.last_updated || DEFAULT_REFUND_POLICY.last_updated);
            if (p.highlight_box) {
              setHighlightTitle(p.highlight_box.title || DEFAULT_REFUND_POLICY.highlight_box.title);
              setHighlightRule(p.highlight_box.main_rule || DEFAULT_REFUND_POLICY.highlight_box.main_rule);
              setHighlightDetail(p.highlight_box.detail || DEFAULT_REFUND_POLICY.highlight_box.detail);
            }
            if (p.section1) {
              setS1Heading(p.section1.heading || DEFAULT_REFUND_POLICY.section1.heading);
              setS1Intro(p.section1.intro || DEFAULT_REFUND_POLICY.section1.intro);
              if (Array.isArray(p.section1.points)) setS1PointsText(p.section1.points.join('\n'));
            }
            if (p.section2) {
              setS2Heading(p.section2.heading || DEFAULT_REFUND_POLICY.section2.heading);
              setS2Intro(p.section2.intro || DEFAULT_REFUND_POLICY.section2.intro);
              if (Array.isArray(p.section2.points)) setS2PointsText(p.section2.points.join('\n'));
            }
            if (p.section4) {
              setS4Heading((p.section4.heading || DEFAULT_REFUND_POLICY.section4.heading).replace(/^4\./, '3.'));
              setS4Intro(p.section4.intro || DEFAULT_REFUND_POLICY.section4.intro);
              setS4Whatsapp(p.section4.whatsapp || DEFAULT_REFUND_POLICY.section4.whatsapp);
              setS4Email(p.section4.email || DEFAULT_REFUND_POLICY.section4.email);
              setS4Hours(p.section4.hours || DEFAULT_REFUND_POLICY.section4.hours);
            }
          }
        } else if (activeTab === 'privacy') {
          const res = await fetch('/api/policies/privacy-policy');
          const json = await res.json();
          if (json?.policy) {
            const p = json.policy;
            setPrivEyebrow(p.eyebrow || DEFAULT_PRIVACY_POLICY.eyebrow);
            setPrivTitle(p.title || DEFAULT_PRIVACY_POLICY.title);
            setPrivLastUpdated(p.last_updated || DEFAULT_PRIVACY_POLICY.last_updated);
            setPrivIntro(p.intro || DEFAULT_PRIVACY_POLICY.intro);
            setPrivCollectIntro(p.collect_intro || DEFAULT_PRIVACY_POLICY.collect_intro);
            if (Array.isArray(p.collect_points)) setPrivCollectPointsText(p.collect_points.join('\n'));
            if (Array.isArray(p.use_points)) setPrivUsePointsText(p.use_points.join('\n'));
            setPrivSecurity(p.payment_security || DEFAULT_PRIVACY_POLICY.payment_security);
            setPrivSharingIntro(p.sharing_intro || DEFAULT_PRIVACY_POLICY.sharing_intro);
            if (Array.isArray(p.sharing_points)) setPrivSharingPointsText(p.sharing_points.join('\n'));
            setPrivRetention(p.data_retention || DEFAULT_PRIVACY_POLICY.data_retention);
            setPrivEmail(p.contact_email || DEFAULT_PRIVACY_POLICY.contact_email);
            setPrivWhatsapp(p.contact_whatsapp || DEFAULT_PRIVACY_POLICY.contact_whatsapp);
            setPrivLocation(p.contact_location || DEFAULT_PRIVACY_POLICY.contact_location);
          }
        }
      } catch (err: any) {
        console.error('Failed to load policy:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPolicy();
  }, [activeTab]);

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        eyebrow: eyebrow.trim(),
        title: title.trim(),
        last_updated: lastUpdated.trim(),
        highlight_box: {
          title: highlightTitle.trim(),
          main_rule: highlightRule.trim(),
          detail: highlightDetail.trim(),
        },
        section1: {
          heading: s1Heading.trim(),
          intro: s1Intro.trim(),
          points: s1PointsText.split('\n').map((p) => p.trim()).filter(Boolean),
        },
        section2: {
          heading: s2Heading.trim(),
          intro: s2Intro.trim(),
          points: s2PointsText.split('\n').map((p) => p.trim()).filter(Boolean),
        },
        section4: {
          heading: s4Heading.trim().replace(/^4\./, '3.'),
          intro: s4Intro.trim(),
          whatsapp: s4Whatsapp.trim(),
          email: s4Email.trim(),
          hours: s4Hours.trim(),
        },
      };

      const res = await fetch('/api/policies/refund-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save refund policy');
      }

      setSuccess('Refund Policy updated successfully! Changes are now live.');
    } catch (err: any) {
      console.error('Error saving policy:', err);
      setError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        eyebrow: privEyebrow.trim(),
        title: privTitle.trim(),
        last_updated: privLastUpdated.trim(),
        intro: privIntro.trim(),
        collect_intro: privCollectIntro.trim(),
        collect_points: privCollectPointsText.split('\n').map((p) => p.trim()).filter(Boolean),
        use_points: privUsePointsText.split('\n').map((p) => p.trim()).filter(Boolean),
        payment_security: privSecurity.trim(),
        sharing_intro: privSharingIntro.trim(),
        sharing_points: privSharingPointsText.split('\n').map((p) => p.trim()).filter(Boolean),
        data_retention: privRetention.trim(),
        contact_email: privEmail.trim(),
        contact_whatsapp: privWhatsapp.trim(),
        contact_location: privLocation.trim(),
      };

      const res = await fetch('/api/policies/privacy-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save privacy policy');
      }

      setSuccess('Privacy Policy updated successfully! Changes are now live on /privacy-policy.');
    } catch (err: any) {
      console.error('Error saving privacy policy:', err);
      setError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const previewS1Points = s1PointsText.split('\n').map((p) => p.trim()).filter(Boolean);
  const previewS2Points = s2PointsText.split('\n').map((p) => p.trim()).filter(Boolean);
  const previewPrivCollect = privCollectPointsText.split('\n').map((p) => p.trim()).filter(Boolean);
  const previewPrivUse = privUsePointsText.split('\n').map((p) => p.trim()).filter(Boolean);
  const previewPrivSharing = privSharingPointsText.split('\n').map((p) => p.trim()).filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#7B5B3A]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h1 className="font-serif text-[28px] text-[#2C241E] m-0 font-bold">
            Store Policies Management
          </h1>
          <p className="text-sm text-[#7A6F66] mt-1.5 mb-0">
            Edit refund terms, privacy policy, contact details, and guidelines live from the database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={activeTab === 'refund' ? '/refund-policy' : '/privacy-policy'}
            target="_blank"
            className="px-4 py-2 text-xs font-semibold text-[#7B5B3A] bg-[#FAF4ED] border border-[#E8DFC8] rounded-md hover:bg-[#F2E7DC] transition-colors"
          >
            View Live {activeTab === 'refund' ? 'Refund' : 'Privacy'} Page ↗
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E0D5] mb-8 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('refund')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'refund'
              ? 'border-[#7B5B3A] text-[#7B5B3A]'
              : 'border-transparent text-[#7A6F66] hover:text-[#2C241E]'
          }`}
        >
          🔄 Refund &amp; Return Policy
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'privacy'
              ? 'border-[#7B5B3A] text-[#7B5B3A]'
              : 'border-transparent text-[#7A6F66] hover:text-[#2C241E]'
          }`}
        >
          🛡️ Privacy Policy
        </button>
        <Link
          href="/shipping-policy"
          target="_blank"
          className="px-5 py-3 text-sm font-semibold text-[#7A6F66] hover:text-[#2C241E] whitespace-nowrap"
        >
          🚚 Shipping Policy ↗
        </Link>
        <Link
          href="/terms-and-conditions"
          target="_blank"
          className="px-5 py-3 text-sm font-semibold text-[#7A6F66] hover:text-[#2C241E] whitespace-nowrap"
        >
          📜 Terms &amp; Conditions ↗
        </Link>
      </div>

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

      {/* ─── TAB 1: REFUND POLICY ───────────────────────────────────────── */}
      {activeTab === 'refund' && (
        <form onSubmit={handleSubmitRefund}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">Page Title &amp; Subtitle</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Eyebrow</label>
                    <input
                      type="text"
                      value={eyebrow}
                      onChange={(e) => setEyebrow(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Page Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Last Updated Notice</label>
                    <input
                      type="text"
                      value={lastUpdated}
                      onChange={(e) => setLastUpdated(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    />
                  </div>
                </div>
              </div>

              {/* Highlight Box */}
              <div className="bg-[#FAF7F2] border-2 border-[#7B5B3A]/30 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#2C1D13] m-0 mb-3">📹 Unboxing Video Highlight Box</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Box Title</label>
                    <input
                      type="text"
                      value={highlightTitle}
                      onChange={(e) => setHighlightTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Core Rule</label>
                    <input
                      type="text"
                      value={highlightRule}
                      onChange={(e) => setHighlightRule(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Details</label>
                    <textarea
                      rows={4}
                      value={highlightDetail}
                      onChange={(e) => setHighlightDetail(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 1 */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">Section 1: Criteria</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={s1Heading}
                    onChange={(e) => setS1Heading(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                  <input
                    type="text"
                    value={s1Intro}
                    onChange={(e) => setS1Intro(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                  <textarea
                    rows={4}
                    value={s1PointsText}
                    onChange={(e) => setS1PointsText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
              </div>

              {/* Section 2 */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">Section 2: Non-Returnable Items</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={s2Heading}
                    onChange={(e) => setS2Heading(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                  <input
                    type="text"
                    value={s2Intro}
                    onChange={(e) => setS2Intro(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                  <textarea
                    rows={4}
                    value={s2PointsText}
                    onChange={(e) => setS2PointsText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
              </div>

              {/* Section 3 (formerly Section 4) */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">Section 3: How to Initiate a Refund Request</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Section Heading</label>
                    <input
                      type="text"
                      value={s4Heading}
                      onChange={(e) => setS4Heading(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Intro Text</label>
                    <input
                      type="text"
                      value={s4Intro}
                      onChange={(e) => setS4Intro(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2C241E] mb-1">WhatsApp Number</label>
                      <input
                        type="text"
                        value={s4Whatsapp}
                        onChange={(e) => setS4Whatsapp(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                        placeholder="WhatsApp"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2C241E] mb-1">Support Email</label>
                      <input
                        type="email"
                        value={s4Email}
                        onChange={(e) => setS4Email(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Support Hours</label>
                    <input
                      type="text"
                      value={s4Hours}
                      onChange={(e) => setS4Hours(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                      placeholder="Support Hours"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-[#7B5B3A] text-white text-sm font-semibold rounded-lg hover:bg-[#62462B] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving Policy...' : 'Save & Publish Refund Policy'}
                </button>
              </div>
            </div>

            {/* Live Storefront Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-6">
                <div className="bg-[#2B2118] text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E5DACF]">Refund Preview</span>
                  <span className="text-[10px] text-white/60">Live preview</span>
                </div>
                <div className="bg-white border border-[#E8E0D5] border-t-0 rounded-b-xl p-5 shadow-md max-h-[calc(100vh-140px)] overflow-y-auto space-y-4 text-xs text-[#5C4A3E]">
                  <div>
                    <span className="text-[10px] font-bold text-[#7B5B3A] uppercase block">{eyebrow}</span>
                    <h3 className="font-display text-lg font-bold text-[#2C1D13]">{title}</h3>
                    <p className="text-[10px] text-[#8C7B6B] mt-0.5">{lastUpdated}</p>
                  </div>
                  <div className="p-3 bg-[#FAF7F2] border-l-4 border-[#7B5B3A] rounded">
                    <p className="font-bold text-[#2C1D13] text-[11px]">{highlightTitle}</p>
                    <p className="text-[10px] mt-1">{highlightDetail}</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#2C1D13]">{s1Heading}</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      {previewS1Points.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-[#2C1D13]">{s2Heading}</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      {previewS2Points.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] border border-[#E2D5C7] rounded">
                    <p className="font-bold text-[#2C1D13]">{s4Heading}</p>
                    <p className="text-[10px] text-[#6B5744] mt-0.5">{s4Intro}</p>
                    <p className="text-[10px] mt-1"><strong>WhatsApp:</strong> {s4Whatsapp}</p>
                    <p className="text-[10px]"><strong>Email:</strong> {s4Email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 2: PRIVACY POLICY ───────────────────────────────────────── */}
      {activeTab === 'privacy' && (
        <form onSubmit={handleSubmitPrivacy}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {/* Header */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">Privacy Page Header</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Eyebrow</label>
                    <input
                      type="text"
                      value={privEyebrow}
                      onChange={(e) => setPrivEyebrow(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Page Title</label>
                    <input
                      type="text"
                      value={privTitle}
                      onChange={(e) => setPrivTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Last Updated Notice</label>
                    <input
                      type="text"
                      value={privLastUpdated}
                      onChange={(e) => setPrivLastUpdated(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    />
                  </div>
                </div>
              </div>

              {/* 1. Intro */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-2">1. Introduction</h2>
                <textarea
                  rows={4}
                  value={privIntro}
                  onChange={(e) => setPrivIntro(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A] leading-relaxed"
                />
              </div>

              {/* 2. Collect */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-3">2. Information We Collect</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Intro text</label>
                    <input
                      type="text"
                      value={privCollectIntro}
                      onChange={(e) => setPrivCollectIntro(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">Bullet points (one per line)</label>
                    <textarea
                      rows={5}
                      value={privCollectPointsText}
                      onChange={(e) => setPrivCollectPointsText(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Use of Data */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-2">3. How We Use Your Data (one point per line)</h2>
                <textarea
                  rows={5}
                  value={privUsePointsText}
                  onChange={(e) => setPrivUsePointsText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                />
              </div>

              {/* 4. Payment Security */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-2">4. Payment Security &amp; Razorpay</h2>
                <textarea
                  rows={3}
                  value={privSecurity}
                  onChange={(e) => setPrivSecurity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                />
              </div>

              {/* 5. Sharing */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-2">5. Sharing of Information</h2>
                <textarea
                  rows={4}
                  value={privSharingPointsText}
                  onChange={(e) => setPrivSharingPointsText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                />
              </div>

              {/* 6. Contact details */}
              <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-3">6. Privacy Support Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="email"
                    value={privEmail}
                    onChange={(e) => setPrivEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={privWhatsapp}
                    onChange={(e) => setPrivWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                    placeholder="WhatsApp"
                  />
                  <input
                    type="text"
                    value={privLocation}
                    onChange={(e) => setPrivLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E]"
                    placeholder="Location"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-[#7B5B3A] text-white text-sm font-semibold rounded-lg hover:bg-[#62462B] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving Policy...' : 'Save & Publish Privacy Policy'}
                </button>
              </div>
            </div>

            {/* Privacy Storefront Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-6">
                <div className="bg-[#2B2118] text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E5DACF]">Privacy Live Preview</span>
                  <span className="text-[10px] text-white/60">Updates live</span>
                </div>
                <div className="bg-white border border-[#E8E0D5] border-t-0 rounded-b-xl p-5 shadow-md max-h-[calc(100vh-140px)] overflow-y-auto space-y-4 text-xs text-[#5C4A3E]">
                  <div>
                    <span className="text-[10px] font-bold text-[#7B5B3A] uppercase block">{privEyebrow}</span>
                    <h3 className="font-display text-lg font-bold text-[#2C1D13]">{privTitle}</h3>
                    <p className="text-[10px] text-[#8C7B6B] mt-0.5">{privLastUpdated}</p>
                  </div>
                  <div>
                    <h4 className="font-display text-xs font-bold text-[#2C1D13] mb-1">1. Introduction</h4>
                    <p className="text-[11px] leading-relaxed">{privIntro}</p>
                  </div>
                  <div>
                    <h4 className="font-display text-xs font-bold text-[#2C1D13] mb-1">2. Information Collected</h4>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      {previewPrivCollect.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-display text-xs font-bold text-[#2C1D13] mb-1">3. How We Use Data</h4>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      {previewPrivUse.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                  <div className="bg-[#FAF8F5] p-3 rounded border border-[#E2D5C7]">
                    <h4 className="font-display text-xs font-bold text-[#2C1D13] mb-1">Contact Officer</h4>
                    <p className="text-[10px]">Email: {privEmail}</p>
                    <p className="text-[10px]">WhatsApp: {privWhatsapp}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
