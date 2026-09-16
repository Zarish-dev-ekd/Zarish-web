'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { IconLogOut } from '@/components/icons';

export default function AdminHeader() {
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-[10px] border-b border-[#E8E0D5] flex items-center justify-between px-8 shadow-[0_1px_4px_rgba(44,29,19,0.04)]">
      <div className="flex items-center gap-4">
        <h1 className="font-serif text-xl font-semibold text-[#2C241E] m-0 -tracking-[0.01em]">
          Store Management
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#7B5B3A] bg-[#FAF6F0] border border-[#E8E0D5] px-2.5 py-1 rounded-full">
            Admin Portal
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-[7px] px-3.5 py-1.5 rounded-full border border-[#E2D5C7] bg-white text-[#5C4A3C] text-xs font-semibold tracking-[0.02em] cursor-pointer transition-all duration-200 shadow-[0_1px_2px_rgba(44,29,19,0.04)] hover:bg-[#FFF5F2] hover:border-[#E2B9B3] hover:text-[#C0392B] hover:shadow-[0_2px_6px_rgba(192,57,43,0.1)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Log Out from Admin Portal"
          title="Sign out of Admin Dashboard"
        >
          {loggingOut ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-[#5C4A3C]/20 border-t-[#5C4A3C] animate-spin inline-block" />
              <span>Signing out...</span>
            </>
          ) : (
            <>
              <IconLogOut size={15} />
              <span>Log Out</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
