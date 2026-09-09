import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';
import './admin.css';

export const metadata: Metadata = {
  title: 'ZARISH Admin — Management Dashboard',
  description: 'Manage products, inventory, media and storefront content for ZARISH',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar__title">Store Management</h1>
          <div className="admin-topbar__user">
            <span>Admin Portal</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
