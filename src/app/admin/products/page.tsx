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
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Products Inventory</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Manage your modest-fashion catalog, pricing, variants, and stock status.
          </p>
        </div>
        <div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] border border-[#FECACA] rounded-lg p-3.5 px-4 mb-5 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] rounded-lg p-3.5 px-4 mb-5 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {loading ? (
          <div className="text-center py-10">
            <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
            <p className="mt-3 text-sm text-[#7A6F66]">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-[#7A6F66]">
            <p className="text-base font-medium text-[#2C241E]">
              No products found in the catalog.
            </p>
            <p className="text-sm mb-5">
              Upload your genuine fashion designs with real photos and pricing.
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center gap-2 px-[18px] py-2.5 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors"
            >
              + Add First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E8E0D5] rounded-lg">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#FAF8F5]">
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Product</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Category</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Price</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Stock</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const primaryImg = p.images?.find((img) => img.role === 'primary') || p.images?.[0];

                  return (
                    <tr key={p.id} className="hover:bg-black/[0.01]">
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/products/${p.id}`} className="relative block no-underline">
                            {primaryImg ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={primaryImg.secure_url}
                                alt={p.name}
                                className="w-12 h-[60px] object-cover rounded border border-[#E8E0D5] bg-[#EEEEEE]"
                              />
                            ) : (
                              <div
                                className="w-12 h-[60px] rounded border border-[#E8E0D5] bg-[#EEEEEE] flex items-center justify-center text-[11px] text-[#999]"
                              >
                                No img
                              </div>
                            )}
                            {p.images && p.images.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] font-bold px-1 py-0.5 rounded leading-none">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </Link>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-semibold text-[#2C241E] no-underline hover:underline"
                            >
                              {p.name}
                            </Link>
                            <div className="text-xs text-[#7A6F66]">
                              SKU: {p.sku || 'N/A'} • {p.images?.length || 0} photo{p.images?.length === 1 ? '' : 's'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">{p.category?.name || 'Uncategorized'}</td>
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-[#2C241E]">
                        <div>{formatPrice(p.price)}</div>
                        {p.compare_at_price && (
                          <div className="text-xs line-through text-[#7A6F66]">
                            {formatPrice(p.compare_at_price)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <span className={`font-semibold ${p.stock_quantity > 0 ? 'text-[#2E7D32]' : 'text-[#D32F2F]'}`}>
                          {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : 'Sold out'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <div className="flex flex-wrap gap-1">
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase ${p.is_active ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'}`}>
                            {p.is_active ? 'Active' : 'Draft'}
                          </span>
                          {p.is_new_arrival && (
                            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase bg-[#E0F2FE] text-[#0369A1]">
                              New
                            </span>
                          )}
                          {p.is_featured && (
                            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase bg-[#FEF3C7] text-[#B45309]">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="px-2.5 py-1 text-xs font-medium rounded border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="px-2.5 py-1 text-xs font-medium rounded bg-[#FEE2E2] border border-[#FECACA] text-[#D32F2F] hover:bg-[#FCA5A5] transition-colors"
                          >
                            Delete
                          </button>
                        </div>
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
