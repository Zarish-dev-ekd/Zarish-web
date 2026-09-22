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
  section3: {
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
  section3: {
    heading: '3. Refund Processing Timeline',
    intro: 'Once your unboxing verification is approved by our quality control team:',
    approval_text: 'Approval: Our team reviews your video and notifies you within 24 business hours.',
    bank_credit_text:
      'Bank Credit: The monetary refund is processed back to the original payment method (credit card, debit card, UPI, or net banking) via our payment gateway partner Razorpay. The credit typically reflects in your bank statement within 5 to 7 business days depending on your issuing bank.',
  },
  section4: {
    heading: '4. How to Initiate a Refund Request',
    intro: 'Send your order reference number and unboxing video directly to our support team:',
    whatsapp: '+91 9562292945',
    email: 'zarish2025co@gmail.com',
    hours: 'Monday – Saturday, 9:30 AM – 7:00 PM IST',
  },
};

export default function AdminPoliciesPage() {
  const [activeTab, setActiveTab] = useState<'refund' | 'shipping' | 'terms' | 'privacy'>('refund');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for Refund Policy
  const [eyebrow, setEyebrow] = useState(DEFAULT_REFUND_POLICY.eyebrow);
  const [title, setTitle] = useState(DEFAULT_REFUND_POLICY.title);
  const [lastUpdated, setLastUpdated] = useState(DEFAULT_REFUND_POLICY.last_updated);

  // Highlight Box
  const [highlightTitle, setHighlightTitle] = useState(DEFAULT_REFUND_POLICY.highlight_box.title);
  const [highlightRule, setHighlightRule] = useState(DEFAULT_REFUND_POLICY.highlight_box.main_rule);
  const [highlightDetail, setHighlightDetail] = useState(DEFAULT_REFUND_POLICY.highlight_box.detail);

  // Section 1
  const [s1Heading, setS1Heading] = useState(DEFAULT_REFUND_POLICY.section1.heading);
  const [s1Intro, setS1Intro] = useState(DEFAULT_REFUND_POLICY.section1.intro);
  const [s1PointsText, setS1PointsText] = useState(DEFAULT_REFUND_POLICY.section1.points.join('\n'));

  // Section 2
  const [s2Heading, setS2Heading] = useState(DEFAULT_REFUND_POLICY.section2.heading);
  const [s2Intro, setS2Intro] = useState(DEFAULT_REFUND_POLICY.section2.intro);
  const [s2PointsText, setS2PointsText] = useState(DEFAULT_REFUND_POLICY.section2.points.join('\n'));

  // Section 3 (Timeline)
  const [s3Heading, setS3Heading] = useState(DEFAULT_REFUND_POLICY.section3.heading);
  const [s3Intro, setS3Intro] = useState(DEFAULT_REFUND_POLICY.section3.intro);
  const [s3Approval, setS3Approval] = useState(DEFAULT_REFUND_POLICY.section3.approval_text);
  const [s3BankCredit, setS3BankCredit] = useState(DEFAULT_REFUND_POLICY.section3.bank_credit_text);

  // Section 4 (Contact)
  const [s4Heading, setS4Heading] = useState(DEFAULT_REFUND_POLICY.section4.heading);
  const [s4Intro, setS4Intro] = useState(DEFAULT_REFUND_POLICY.section4.intro);
  const [s4Whatsapp, setS4Whatsapp] = useState(DEFAULT_REFUND_POLICY.section4.whatsapp);
  const [s4Email, setS4Email] = useState(DEFAULT_REFUND_POLICY.section4.email);
  const [s4Hours, setS4Hours] = useState(DEFAULT_REFUND_POLICY.section4.hours);

  useEffect(() => {
    async function loadRefundPolicy() {
      try {
        setLoading(true);
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
            if (p.section1.points && Array.isArray(p.section1.points)) {
              setS1PointsText(p.section1.points.join('\n'));
            }
          }

          if (p.section2) {
            setS2Heading(p.section2.heading || DEFAULT_REFUND_POLICY.section2.heading);
            setS2Intro(p.section2.intro || DEFAULT_REFUND_POLICY.section2.intro);
            if (p.section2.points && Array.isArray(p.section2.points)) {
              setS2PointsText(p.section2.points.join('\n'));
            }
          }

          if (p.section3) {
            setS3Heading(p.section3.heading || DEFAULT_REFUND_POLICY.section3.heading);
            setS3Intro(p.section3.intro || DEFAULT_REFUND_POLICY.section3.intro);
            setS3Approval(p.section3.approval_text || DEFAULT_REFUND_POLICY.section3.approval_text);
            setS3BankCredit(p.section3.bank_credit_text || DEFAULT_REFUND_POLICY.section3.bank_credit_text);
          }

          if (p.section4) {
            setS4Heading(p.section4.heading || DEFAULT_REFUND_POLICY.section4.heading);
            setS4Intro(p.section4.intro || DEFAULT_REFUND_POLICY.section4.intro);
            setS4Whatsapp(p.section4.whatsapp || DEFAULT_REFUND_POLICY.section4.whatsapp);
            setS4Email(p.section4.email || DEFAULT_REFUND_POLICY.section4.email);
            setS4Hours(p.section4.hours || DEFAULT_REFUND_POLICY.section4.hours);
          }
        }
      } catch (err: any) {
        console.error('Failed to load policy:', err);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === 'refund') {
      loadRefundPolicy();
    }
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
          points: s1PointsText
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean),
        },
        section2: {
          heading: s2Heading.trim(),
          intro: s2Intro.trim(),
          points: s2PointsText
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean),
        },
        section3: {
          heading: s3Heading.trim(),
          intro: s3Intro.trim(),
          approval_text: s3Approval.trim(),
          bank_credit_text: s3BankCredit.trim(),
        },
        section4: {
          heading: s4Heading.trim(),
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

      setSuccess('Refund Policy updated successfully! The live storefront is now updated.');
    } catch (err: any) {
      console.error('Error saving policy:', err);
      setError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const previewS1Points = s1PointsText
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const previewS2Points = s2PointsText
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

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
            Edit refund terms, unboxing video requirements, processing timelines, and customer guidelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/refund-policy"
            target="_blank"
            className="px-4 py-2 text-xs font-semibold text-[#7B5B3A] bg-[#FAF4ED] border border-[#E8DFC8] rounded-md hover:bg-[#F2E7DC] transition-colors"
          >
            View Live Refund Page ↗
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
        <Link
          href="/privacy-policy"
          target="_blank"
          className="px-5 py-3 text-sm font-semibold text-[#7A6F66] hover:text-[#2C241E] whitespace-nowrap"
        >
          🛡️ Privacy Policy ↗
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

      {/* Refund Policy Form & Live Preview */}
      <form onSubmit={handleSubmitRefund}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Editing Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header & Meta */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">
                Page Title &amp; Subtitle
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Eyebrow (Small Tag)
                  </label>
                  <input
                    type="text"
                    value={eyebrow}
                    onChange={(e) => setEyebrow(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    placeholder="Customer Assurance & Guidelines"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Page Main Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    placeholder="Refund & Return Policy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Last Updated Notice
                  </label>
                  <input
                    type="text"
                    value={lastUpdated}
                    onChange={(e) => setLastUpdated(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    placeholder="Last updated: September 2026 • Valid for all online purchases on zarish.in"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Unboxing Video Highlight Box */}
            <div className="bg-[#FAF7F2] border-2 border-[#7B5B3A]/30 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📹</span>
                <h2 className="text-base font-bold text-[#2C1D13] m-0">
                  Mandatory Unboxing Video Highlight Box
                </h2>
              </div>
              <p className="text-xs text-[#8C7B6B] mb-4">
                This is the prominent colored banner at the top of the policy page.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Box Title
                  </label>
                  <input
                    type="text"
                    value={highlightTitle}
                    onChange={(e) => setHighlightTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    placeholder="Mandatory Unboxing Video Requirement"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Core Rule (Bold Text)
                  </label>
                  <input
                    type="text"
                    value={highlightRule}
                    onChange={(e) => setHighlightRule(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    placeholder="Refunds are applicable only for damaged or defective products received by the customer."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Full Requirement Details (Timeframe, uncut video conditions)
                  </label>
                  <textarea
                    rows={4}
                    value={highlightDetail}
                    onChange={(e) => setHighlightDetail(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A] leading-relaxed"
                    placeholder="To claim a refund, you must contact our official WhatsApp support..."
                  />
                </div>
              </div>
            </div>

            {/* Section 1: Return & Refund Criteria */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">
                Section 1: Return &amp; Refund Criteria
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={s1Heading}
                    onChange={(e) => setS1Heading(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Introduction Sentence
                  </label>
                  <input
                    type="text"
                    value={s1Intro}
                    onChange={(e) => setS1Intro(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#2C241E]">
                      Criteria Bullet Points
                    </label>
                    <span className="text-[11px] text-[#8C7B6B]">One point per line</span>
                  </div>
                  <textarea
                    rows={4}
                    value={s1PointsText}
                    onChange={(e) => setS1PointsText(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Non-Returnable Items */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">
                Section 2: Non-Returnable Items
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={s2Heading}
                    onChange={(e) => setS2Heading(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Introduction Sentence
                  </label>
                  <input
                    type="text"
                    value={s2Intro}
                    onChange={(e) => setS2Intro(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#2C241E]">
                      Non-Returnable Items Bullet Points
                    </label>
                    <span className="text-[11px] text-[#8C7B6B]">One point per line</span>
                  </div>
                  <textarea
                    rows={4}
                    value={s2PointsText}
                    onChange={(e) => setS2PointsText(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Refund Processing Timeline */}
            <div className="bg-white border-2 border-[#7B5B3A]/40 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">⏱️</span>
                <h2 className="text-base font-bold text-[#2C1D13] m-0">
                  Section 3: Refund Processing Timeline
                </h2>
              </div>
              <p className="text-xs text-[#8C7B6B] mb-4">
                Configure approval hours, Razorpay refund speed, and bank credit estimates.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={s3Heading}
                    onChange={(e) => setS3Heading(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Introduction Sentence
                  </label>
                  <input
                    type="text"
                    value={s3Intro}
                    onChange={(e) => setS3Intro(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Approval Timeline Text
                  </label>
                  <textarea
                    rows={2}
                    value={s3Approval}
                    onChange={(e) => setS3Approval(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    placeholder="Approval: Our team reviews your video and notifies you within 24 business hours."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Bank Credit &amp; Razorpay Timeline Text
                  </label>
                  <textarea
                    rows={3}
                    value={s3BankCredit}
                    onChange={(e) => setS3BankCredit(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A] leading-relaxed"
                    placeholder="Bank Credit: The monetary refund is processed back to the original payment method..."
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Support Contact Details */}
            <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#2C241E] m-0 mb-4">
                Section 4: Support Contact Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={s4Heading}
                    onChange={(e) => setS4Heading(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Instruction Text
                  </label>
                  <input
                    type="text"
                    value={s4Intro}
                    onChange={(e) => setS4Intro(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                      Official WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={s4Whatsapp}
                      onChange={(e) => setS4Whatsapp(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                      placeholder="+91 9562292945"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={s4Email}
                      onChange={(e) => setS4Email(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                      placeholder="zarish2025co@gmail.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Support Hours
                  </label>
                  <input
                    type="text"
                    value={s4Hours}
                    onChange={(e) => setS4Hours(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
                    placeholder="Monday – Saturday, 9:30 AM – 7:00 PM IST"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 bg-[#7B5B3A] text-white text-sm font-semibold rounded-lg hover:bg-[#62462B] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Saving Policy Changes...' : 'Save & Publish Refund Policy'}
              </button>
            </div>
          </div>

          {/* Live Storefront Preview Column */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="bg-[#2B2118] text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E5DACF]">
                  Storefront Live Preview
                </span>
                <span className="text-[10px] text-white/60">Updates in real-time</span>
              </div>

              <div className="bg-white border border-[#E8E0D5] border-t-0 rounded-b-xl p-5 shadow-md max-h-[calc(100vh-140px)] overflow-y-auto">
                <div className="border-b border-[#F2ECE4] pb-4 mb-5">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#7B5B3A] uppercase block mb-1">
                    {eyebrow || 'Customer Assurance & Guidelines'}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#2C1D13]">
                    {title || 'Refund & Return Policy'}
                  </h3>
                  <p className="text-[10px] text-[#8C7B6B] mt-1">{lastUpdated}</p>
                </div>

                <div className="space-y-5 text-xs text-[#5C4A3E] leading-relaxed">
                  {/* Highlight Box Preview */}
                  <div className="p-4 bg-[#FAF7F2] border-l-4 border-[#7B5B3A] border border-[#E8E0D5] rounded-xl">
                    <h4 className="font-display text-xs font-bold text-[#2C1D13] mb-1">
                      {highlightTitle}
                    </h4>
                    <p className="text-[11px] text-[#6B5744] font-semibold mb-2">{highlightRule}</p>
                    <p className="text-[11px] text-[#6B5744] leading-relaxed">{highlightDetail}</p>
                  </div>

                  {/* Section 1 Preview */}
                  <div>
                    <h4 className="font-display text-xs font-bold text-[#2C1D13] mb-1">
                      {s1Heading}
                    </h4>
                    <p className="text-[11px] mb-1">{s1Intro}</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#6B5744]">
                      {previewS1Points.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 2 Preview */}
                  <div>
                    <h4 className="font-display text-xs font-bold text-[#2C1D13] mb-1">
                      {s2Heading}
                    </h4>
                    <p className="text-[11px] mb-1">{s2Intro}</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#6B5744]">
                      {previewS2Points.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 3 Preview */}
                  <div className="bg-[#FFFDF9] p-3 rounded-lg border border-[#E2D5C7]/60">
                    <h4 className="font-display text-xs font-bold text-[#2C1D13] mb-1">
                      {s3Heading}
                    </h4>
                    <p className="text-[11px] mb-1">{s3Intro}</p>
                    <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-[#6B5744]">
                      <li>{s3Approval}</li>
                      <li>{s3BankCredit}</li>
                    </ul>
                  </div>

                  {/* Section 4 Preview */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2D5C7]">
                    <h4 className="font-display text-xs font-bold text-[#2C1D13] mb-1">
                      {s4Heading}
                    </h4>
                    <p className="text-[10px] text-[#6B5744] mb-2">{s4Intro}</p>
                    <div className="space-y-0.5 text-[10px] font-medium text-[#2C1D13]">
                      <p>
                        <strong>WhatsApp:</strong>{' '}
                        <span className="text-[#7B5B3A] underline font-bold">{s4Whatsapp}</span>
                      </p>
                      <p>
                        <strong>Email:</strong> {s4Email}
                      </p>
                      <p>
                        <strong>Hours:</strong> {s4Hours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
