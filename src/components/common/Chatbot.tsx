'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconMessageCircle, IconX, IconSend, IconWhatsapp } from '@/components/icons';
import { createClient } from '@/utils/supabase/client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  action?: {
    label: string;
    href: string;
    isExternal?: boolean;
    isWhatsApp?: boolean;
  };
  timestamp: string;
}

const OFFICIAL_WHATSAPP_NUMBER = '919562292945';
const OFFICIAL_WHATSAPP_URL = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}`;

const QUICK_QUESTIONS = [
  {
    id: 'refund',
    label: 'What is your refund policy?',
    text: 'What is your refund policy?',
  },
  {
    id: 'track',
    label: 'Track my order',
    text: 'Track my order',
  },
  {
    id: 'shipping',
    label: 'What are your shipping details?',
    text: 'What are your shipping details?',
  },
  {
    id: 'contact',
    label: 'What is your contact info?',
    text: 'What is your contact info?',
  },
  {
    id: 'login',
    label: 'How to login?',
    text: 'How to login?',
  },
];

export default function Chatbot() {
  const pathname = usePathname();
  const isPdpOrCheckout = pathname?.startsWith('/products/') || pathname === '/checkout';

  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [whatsappUrl, setWhatsappUrl] = useState(OFFICIAL_WHATSAPP_URL);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with live database settings if custom valid number configured
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase
        .from('site_settings')
        .select('social_whatsapp, contact_phone')
        .single()
        .then(({ data }) => {
          if (data) {
            const num = data.social_whatsapp || data.contact_phone;
            if (num) {
              const clean = num.replace(/[^0-9]/g, '');
              if (clean && !clean.includes('9876543210')) {
                setWhatsappUrl(num.startsWith('http') ? num : `https://wa.me/${clean}`);
                return;
              }
            }
          }
          setWhatsappUrl(OFFICIAL_WHATSAPP_URL);
        });
    } catch {
      setWhatsappUrl(OFFICIAL_WHATSAPP_URL);
    }
  }, []);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping, scrollToBottom]);

  // Answer matching engine
  const generateBotReply = useCallback(
    (userQuery: string): { text: string; action?: ChatMessage['action'] } => {
      const q = userQuery.toLowerCase().trim();

      // 1. REFUND & RETURN POLICY (Exact match as requested by user)
      if (
        q.includes('refund') ||
        q.includes('return') ||
        q.includes('damaged') ||
        q.includes('defective') ||
        q.includes('broken') ||
        q.includes('unboxing') ||
        q.includes('video') ||
        q.includes('replace') ||
        q.includes('exchange')
      ) {
        const refundWaUrl = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(
          'Hi ZARISH, I received a damaged product and I am sharing my complete unboxing video (start to end, no cuts) for verification.'
        )}`;
        return {
          text: `Refunds are applicable only for damaged or defective products.\n\nPlease contact us on WhatsApp within 24–48 hours of delivery with a complete unboxing video (no cuts, from start to end) for verification.\n\n⚠️ Requests raised after 24–48 hours will not be accepted.`,
          action: {
            label: 'Chat on WhatsApp (9562292945)',
            href: refundWaUrl,
            isExternal: true,
            isWhatsApp: true,
          },
        };
      }

      // 2. ORDER TRACKING
      if (q.includes('track') || q.includes('status') || q.includes('where is') || q.includes('parcel')) {
        return {
          text: `You can track your order status live anytime using your Order Number. If you recently placed an order, tracking updates were also sent to your WhatsApp & email.`,
          action: {
            label: 'Track Order Live',
            href: '/track-order',
            isExternal: false,
          },
        };
      }

      // 3. SHIPPING & DELIVERY
      if (
        q.includes('shipping') ||
        q.includes('deliver') ||
        q.includes('courier') ||
        q.includes('charge') ||
        q.includes('days') ||
        q.includes('time') ||
        q.includes('cod') ||
        q.includes('international')
      ) {
        return {
          text: `We provide express delivery across India & worldwide!\n\n• Delivery Timeline: 3–5 business days across India.\n• Free Shipping: Complimentary on all orders above ₹2,999.\n• International: Worldwide delivery to UAE, GCC, UK, US, etc.`,
          action: {
            label: 'Explore New Collections',
            href: '/collections',
            isExternal: false,
          },
        };
      }

      // 4. CONTACT & WHATSAPP
      if (
        q.includes('contact') ||
        q.includes('whatsapp') ||
        q.includes('phone') ||
        q.includes('call') ||
        q.includes('email') ||
        q.includes('support') ||
        q.includes('number') ||
        q.includes('care')
      ) {
        const contactWaUrl = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(
          'Hi ZARISH, I would like to speak with customer support.'
        )}`;
        return {
          text: `Our client styling & support team is here to assist:\n\n• WhatsApp: +91 9562292945\n• Email: info@zarish.in\n• Support Hours: Mon–Sat, 10:00 AM – 7:00 PM IST`,
          action: {
            label: 'Open WhatsApp Chat (9562292945)',
            href: contactWaUrl,
            isExternal: true,
            isWhatsApp: true,
          },
        };
      }

      // 5. LOGIN & ACCOUNT
      if (q.includes('login') || q.includes('signin') || q.includes('signup') || q.includes('account') || q.includes('register')) {
        return {
          text: `You can sign in to your ZARISH account to view past orders, track live parcels, and access express checkout.`,
          action: {
            label: 'Go to Sign In / Account',
            href: '/account',
            isExternal: false,
          },
        };
      }

      // 6. SIZING & FIT
      if (q.includes('size') || q.includes('fit') || q.includes('measurement') || q.includes('chart') || q.includes('custom')) {
        return {
          text: `We carry standard sizes from S to XXXL. We also accommodate custom sizing requests directly via WhatsApp!`,
          action: {
            label: 'View Shop by Size Guide',
            href: '/shop-by-size',
            isExternal: false,
          },
        };
      }

      // 7. COUPON / OFFERS
      if (q.includes('coupon') || q.includes('code') || q.includes('discount') || q.includes('offer')) {
        return {
          text: `You can find exclusive festive and seasonal coupon codes on our Offers page, and apply them at checkout!`,
          action: {
            label: 'View Offers & Discounts',
            href: '/offers',
            isExternal: false,
          },
        };
      }

      // Default polite luxury fallback
      const defaultWaUrl = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hi ZARISH, I have a question about: "${userQuery}"`
      )}`;
      return {
        text: `Thank you for your question! For bespoke assistance, personal styling advice, or order inquiries, our concierge is available right now on WhatsApp.`,
        action: {
          label: 'Chat with Us on WhatsApp (9562292945)',
          href: defaultWaUrl,
          isExternal: true,
          isWhatsApp: true,
        },
      };
    },
    []
  );

  // Handle sending a message
  const handleSendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Realistic brief typing delay for luxury feel
    setTimeout(() => {
      const reply = generateBotReply(trimmed);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply.text,
        action: reply.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 320);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <>
      {/* ─── 1. FLOATING BUBBLE BUTTON (Only shown when chat is closed) ─── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setHasUnread(false);
          }}
          className={`fixed z-[9999] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#FAF4EE] to-[#FFFFFF] border border-[#E5D7CA] text-[#2C1D13] shadow-[0_8px_24px_rgba(44,29,19,0.16)] hover:shadow-[0_12px_32px_rgba(44,29,19,0.24)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group select-none ${
            isPdpOrCheckout
              ? 'bottom-[calc(4.85rem+env(safe-area-inset-bottom))] right-3 sm:bottom-6 sm:right-6'
              : 'bottom-5 right-4 sm:bottom-6 sm:right-6'
          }`}
          aria-label="Open ZARISH chat assistance"
        >
          <div className="relative flex items-center justify-center">
            <IconMessageCircle size={20} className="text-[#2C1D13] group-hover:scale-110 transition-transform" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#8B4E5A] ring-2 ring-white animate-pulse" />
            )}
          </div>
        </button>
      )}

      {/* ─── 2. MINI CHATBOT POPUP WINDOW ─── */}
      {isOpen && (
        <div
          className={`fixed z-[9999] w-[calc(100vw-24px)] sm:w-[380px] max-h-[580px] sm:max-h-[620px] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#FAF6F0] border border-[#E5D7CA] shadow-[0_20px_50px_rgba(44,29,19,0.22)] flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 right-3 sm:right-6 ${
            isPdpOrCheckout
              ? 'bottom-[calc(4.85rem+env(safe-area-inset-bottom))] sm:bottom-6'
              : 'bottom-5 sm:bottom-6'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="ZARISH Concierge Chat"
        >
          {/* Header */}
          <div className="bg-[#2C1D13] text-[#FAF6F0] px-4 py-3.5 flex items-center justify-between border-b border-[#3D2B1F] select-none">
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-[#EBDCD0] hover:text-white transition-colors cursor-pointer mr-0.5 active:scale-90 text-[11px] font-medium"
                  aria-label="Back to main topics"
                  title="Back to topics"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-[#3D2B1F] border border-[#7B5B3A]/40 flex items-center justify-center font-display text-sm font-bold text-[#EBDCD0]">
                Z
              </div>
              <div className="flex flex-col">
                <span className="font-display text-sm font-bold tracking-wide text-white leading-tight">
                  ZARISH Concierge
                </span>
                <span className="text-[10px] text-[#C4B5A5] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Active now
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#EBDCD0] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <IconX size={15} />
            </button>
          </div>

          {/* Conversation & Quick Action Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-[#E2D5C7]">
            {/* Greeting Hero Message */}
            <div className="bg-white/90 border border-[#EBE0D5] rounded-2xl p-3.5 shadow-xs text-xs text-[#2C1D13] space-y-1.5">
              <p className="font-display text-sm font-bold text-[#2C1D13]">
                Hi! How can I help you?
              </p>
              <p className="text-[#6B5744] leading-relaxed">
                Welcome to <strong className="font-medium text-[#2C1D13]">ZARISH by Nehala Mufeed</strong>. Select any topic below or ask your question:
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSendMessage(q.text)}
                    className="text-left text-[11px] font-medium text-[#2C1D13] bg-white hover:bg-[#F5EDE3] hover:border-[#7B5B3A] border border-[#E2D5C7] rounded-full px-3 py-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {/* Message History */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#2C1D13] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-[#2C1D13] border border-[#E5D7CA] rounded-tl-xs shadow-xs whitespace-pre-line'
                  }`}
                >
                  {msg.text}

                  {/* Action Button inside Bot Message */}
                  {msg.action && (
                    <div className="mt-2.5 pt-2 border-t border-[#EAE1D7]">
                      {msg.action.isExternal ? (
                        <a
                          href={msg.action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7B5B3A] hover:bg-[#2C1D13] text-white text-[11px] font-semibold tracking-wide transition-all shadow-xs"
                        >
                          {msg.action.isWhatsApp && <IconWhatsapp size={13} />}
                          <span>{msg.action.label}</span>
                        </a>
                      ) : (
                        <Link
                          href={msg.action.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-[11px] font-semibold tracking-wide transition-all shadow-xs"
                        >
                          <span>{msg.action.label}</span>
                          <span>→</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[#A08E7E] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Back button chip when viewing responses */}
            {messages.length > 0 && !isTyping && (
              <div className="pt-1 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7B5B3A] hover:text-[#2C1D13] bg-white hover:bg-[#FAF4EE] border border-[#E2D5C7] hover:border-[#7B5B3A] rounded-full px-3.5 py-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                  title="Back to topics"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Topics</span>
                </button>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-[#E5D7CA] rounded-2xl rounded-tl-xs px-3.5 py-2.5 w-fit shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B5B3A] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B5B3A] animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B5B3A] animate-bounce [animation-delay:0.3s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Privacy Disclaimer */}
          <div className="px-4 py-1.5 bg-[#F5EDE3] text-[9.5px] text-[#8C7B6B] border-t border-[#E8DCD2] text-center select-none">
            Your messages are protected by ZARISH Client Care.{' '}
            <Link href="/about" className="underline hover:text-[#2C1D13]">
              Privacy policy
            </Link>
            .
          </div>

          {/* Bottom Input Bar (Clean, no upload button) */}
          <form
            onSubmit={handleFormSubmit}
            className="p-2.5 bg-white border-t border-[#E5D7CA] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-[#FAF6F0] border border-[#E8DCD2] focus:border-[#7B5B3A] rounded-full text-xs text-[#2C1D13] placeholder-[#A08E7E] outline-none py-2 px-3.5 transition-colors"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="w-8 h-8 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 shrink-0"
              aria-label="Send message"
            >
              <IconSend size={13} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
