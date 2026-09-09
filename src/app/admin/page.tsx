export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function AdminDashboardPage() {
  let productCount = 0;
  let categoryCount = 0;
  let sizeCount = 0;
  let heroCount = 0;
  let announcementCount = 0;
  let subscriberCount = 0;
  let dbConnected = false;

  try {
    const supabase = await createClient();

    const [
      { count: pCount, error: pErr },
      { count: cCount },
      { count: sCount },
      { count: hCount },
      { count: aCount },
      { count: subCount },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('sizes').select('*', { count: 'exact', head: true }),
      supabase.from('hero_slides').select('*', { count: 'exact', head: true }),
      supabase.from('announcements').select('*', { count: 'exact', head: true }),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }),
    ]);

    if (!pErr) {
      dbConnected = true;
      productCount = pCount ?? 0;
      categoryCount = cCount ?? 0;
      sizeCount = sCount ?? 0;
      heroCount = hCount ?? 0;
      announcementCount = aCount ?? 0;
      subscriberCount = subCount ?? 0;
    }
  } catch {
    dbConnected = false;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Store Overview</h2>
          <p className="admin-page-subtitle">
            Welcome to the ZARISH administrative hub. Monitor inventory and manage site content.
          </p>
        </div>
        <div>
          <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
            + Add New Product
          </Link>
        </div>
      </div>

      {!dbConnected && (
        <div
          className="admin-card"
          style={{
            borderLeft: '4px solid var(--admin-accent)',
            backgroundColor: '#FFF8F6',
          }}
        >
          <h3 style={{ color: 'var(--admin-accent)', margin: '0 0 8px 0', fontSize: '16px' }}>
            Database Setup Note: Supabase Schema Migration Ready
          </h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.6' }}>
            We have generated the complete SQL schema in{' '}
            <code>supabase/schema.sql</code>. To ensure all tables (products, categories, sizes, hero slides, etc.) exist in your Supabase project, open your{' '}
            <strong>Supabase Dashboard → SQL Editor</strong>, paste the content of{' '}
            <code>supabase/schema.sql</code>, and click <strong>Run</strong>.
          </p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-card__title">Total Products</p>
          <p className="admin-stat-card__value">{productCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__title">Active Categories</p>
          <p className="admin-stat-card__value">{categoryCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__title">Available Sizes</p>
          <p className="admin-stat-card__value">{sizeCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__title">Hero Slides</p>
          <p className="admin-stat-card__value">{heroCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__title">Announcements</p>
          <p className="admin-stat-card__value">{announcementCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__title">Subscribers</p>
          <p className="admin-stat-card__value">{subscriberCount}</p>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="admin-card">
        <h3 className="admin-card__title">Quick Management Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Link href="/admin/products/new" className="admin-btn admin-btn--secondary">
            Create Product
          </Link>
          <Link href="/admin/categories" className="admin-btn admin-btn--secondary">
            Manage Categories
          </Link>
          <Link href="/admin/sizes" className="admin-btn admin-btn--secondary">
            Manage Sizes
          </Link>
          <Link href="/admin/hero" className="admin-btn admin-btn--secondary">
            Update Hero Banner
          </Link>
          <Link href="/admin/announcements" className="admin-btn admin-btn--secondary">
            Edit Announcement Bar
          </Link>
          <Link href="/admin/settings" className="admin-btn admin-btn--secondary">
            Store & Social Settings
          </Link>
        </div>
      </div>

      {/* System Integration Status */}
      <div className="admin-card">
        <h3 className="admin-card__title">Production Integrations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#FAF8F5', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>Supabase Backend</h4>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--admin-text-muted)' }}>
              Target: <code>https://lkyeuxtwpqlxucppkjjh.supabase.co</code>
            </p>
            <span className={`admin-badge ${dbConnected ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
              {dbConnected ? 'Connected & Synced' : 'Awaiting Schema Run'}
            </span>
          </div>

          <div style={{ padding: '16px', background: '#FAF8F5', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>Cloudinary Media Delivery</h4>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--admin-text-muted)' }}>
              Cloud: <code>sjo0iipf</code> (High-Performance CDN)
            </p>
            <span className="admin-badge admin-badge--active">Ready for Direct Upload</span>
          </div>
        </div>
      </div>
    </div>
  );
}
