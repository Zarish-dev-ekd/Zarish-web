import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isAdminUser } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: 'ZARISH Admin — Management Dashboard',
  description: 'Manage products, inventory, media and storefront content for ZARISH',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  if (!isAdminUser(user)) {
    redirect('/login?error=access-denied');
  }

  return (
    <div className="flex min-h-screen bg-[#F8F5F0] text-[#2C241E] font-sans max-md:flex-col">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AdminHeader />
        <main className="p-8 flex-1 max-w-[1280px] w-full max-md:p-4">{children}</main>
      </div>
    </div>
  );
}
