'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error: delErr } = await supabase.from('products').delete().eq('id', id);
      if (delErr) throw delErr;
      setProducts(products.filter((p) => p.id !== id));
      setSuccess('Product deleted successfully');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete product');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Products Inventory</h2>
          <p className="admin-page-subtitle">
            Manage your modest-fashion catalog, pricing, variants, and stock status.
          </p>
        </div>
        <div>
          <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
            + Add New Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="admin-card" style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px' }}>
          {success}
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span className="admin-spinner" />
            <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)' }}>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-muted)' }}>
            <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--admin-text-main)' }}>
              No products found in the catalog.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
              Upload your genuine fashion designs with real photos and pricing.
            </p>
            <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
              + Add First Product
            </Link>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const primaryImg = p.images?.find((img) => img.role === 'primary') || p.images?.[0];

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {primaryImg ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={primaryImg.secure_url}
                              alt={p.name}
                              className="admin-thumbnail"
                            />
                          ) : (
                            <div
                              className="admin-thumbnail"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#999' }}
                            >
                              No img
                            </div>
                          )}
                          <div>
                            <strong>{p.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                              SKU: {p.sku || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{p.category?.name || 'Uncategorized'}</td>
                      <td>
                        <div>{formatPrice(p.price)}</div>
                        {p.compare_at_price && (
                          <div style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--admin-text-muted)' }}>
                            {formatPrice(p.compare_at_price)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ color: p.stock_quantity > 0 ? 'var(--admin-success)' : 'var(--admin-danger)', fontWeight: 600 }}>
                          {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : 'Sold out'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          <span className={`admin-badge ${p.is_active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
                            {p.is_active ? 'Active' : 'Draft'}
                          </span>
                          {p.is_new_arrival && (
                            <span className="admin-badge" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                              New
                            </span>
                          )}
                          {p.is_featured && (
                            <span className="admin-badge" style={{ background: '#FEF3C7', color: '#B45309' }}>
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="admin-btn admin-btn--danger admin-btn--sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
