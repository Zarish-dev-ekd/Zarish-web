'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/admin/ImageUpload';
import type { Category, Size } from '@/lib/types';

export default function AdminNewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Toggles
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isOnSale, setIsOnSale] = useState(false);

  // Cloudinary image
  const [imageUrl, setImageUrl] = useState('');
  const [publicId, setPublicId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [{ data: cats }, { data: szs }] = await Promise.all([
          supabase.from('categories').select('*').eq('is_active', true).order('name'),
          supabase.from('sizes').select('*').eq('is_active', true).order('display_order'),
        ]);

        if (cats) setCategories(cats);
        if (szs) setSizes(szs);
      } catch (err: any) {
        console.error('Failed to load categories/sizes:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const toggleSize = (sizeId: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      setError('Product title and price are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Insert product record
      const parsedPrice = parseFloat(price) || 0;
      const parsedComparePrice = comparePrice ? parseFloat(comparePrice) : null;
      const parsedStock = parseInt(stockQuantity, 10) || 0;

      const { data: product, error: prodErr } = await supabase
        .from('products')
        .insert([
          {
            name: name.trim(),
            slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category_id: categoryId || null,
            price: parsedPrice,
            compare_at_price: parsedComparePrice,
            sku: sku.trim() || null,
            stock_quantity: parsedStock,
            short_description: shortDescription.trim() || null,
            description: description.trim() || null,
            materials: materials.trim() || null,
            care_instructions: careInstructions.trim() || null,
            is_active: isActive,
            is_featured: isFeatured,
            is_new_arrival: isNewArrival,
            is_on_sale: isOnSale,
          },
        ])
        .select()
        .single();

      if (prodErr) throw prodErr;

      // 2. Insert primary image if uploaded
      if (imageUrl && product) {
        const { error: imgErr } = await supabase.from('product_images').insert([
          {
            product_id: product.id,
            secure_url: imageUrl,
            cloudinary_public_id: publicId || 'zarish_img',
            alt_text: name.trim(),
            role: 'primary',
            display_order: 0,
          },
        ]);
        if (imgErr) console.warn('Could not save product image record:', imgErr);
      }

      // 3. Insert variants for selected sizes
      if (selectedSizes.length > 0 && product) {
        const variantRows = selectedSizes.map((sizeId) => ({
          product_id: product.id,
          size_id: sizeId,
          stock_quantity: Math.max(1, Math.floor(parsedStock / selectedSizes.length)),
          is_active: true,
        }));

        const { error: varErr } = await supabase
          .from('product_variants')
          .insert(variantRows);

        if (varErr) console.warn('Could not save product variants:', varErr);
      }

      router.push('/admin/products');
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err?.message || 'Failed to save product to Supabase');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Add New Product</h2>
          <p className="admin-page-subtitle">
            Enter garment details, pricing, upload editorial photography, and set sizing.
          </p>
        </div>
        <div>
          <Link href="/admin/products" className="admin-btn admin-btn--secondary">
            Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Main Column */}
          <div>
            <div className="admin-card">
              <h3 className="admin-card__title">Basic Details</h3>
              <div className="admin-form-group">
                <label className="admin-label">Product Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Classic Embroidered Abaya"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">URL Slug</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="classic-embroidered-abaya"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Short Tagline / Excerpt</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Handcrafted premium crepe with subtle wrist embroidery."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Full Description</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  placeholder="Detailed description of the cut, drape, styling recommendations, and craftsmanship..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Media Upload */}
            <div className="admin-card">
              <h3 className="admin-card__title">Product Photography</h3>
              <ImageUpload
                label="Primary Showcase Image (Cloudinary) *"
                value={imageUrl}
                onChange={(url, pId) => {
                  setImageUrl(url);
                  if (pId) setPublicId(pId);
                }}
                folder="zarish/products"
                helperText="Upload real high-resolution fashion imagery (vertical 4:5 aspect ratio recommended)."
              />
            </div>

            {/* Fabric & Care */}
            <div className="admin-card">
              <h3 className="admin-card__title">Fabric & Specifications</h3>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Fabric / Materials</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. 100% Premium Nida Fabric"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Care Instructions</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Dry Clean Only or Gentle Hand Wash"
                    value={careInstructions}
                    onChange={(e) => setCareInstructions(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Category, Sizes, Toggles */}
          <div>
            <div className="admin-card">
              <h3 className="admin-card__title">Pricing & Inventory</h3>
              <div className="admin-form-group">
                <label className="admin-label">Price (INR ₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="admin-input"
                  placeholder="2999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Compare at Price (Strikethrough)</label>
                <input
                  type="number"
                  step="0.01"
                  className="admin-input"
                  placeholder="3999"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">SKU</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="ZR-ABY-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Total Stock Quantity</label>
                <input
                  type="number"
                  className="admin-input"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card__title">Organization</h3>
              <div className="admin-form-group">
                <label className="admin-label">Category</label>
                <select
                  className="admin-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Available Sizes</label>
                {loadingInitial ? (
                  <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>Loading sizes...</p>
                ) : sizes.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>
                    No sizes created yet. Go to <Link href="/admin/sizes">Sizes Manager</Link>.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {sizes.map((s) => {
                      const isSelected = selectedSizes.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSize(s.id)}
                          className={`admin-btn admin-btn--sm ${
                            isSelected ? 'admin-btn--primary' : 'admin-btn--secondary'
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card__title">Visibility & Badges</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active (Live on Store)</span>
                </label>

                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                  />
                  <span>Show &quot;New Arrival&quot; Badge</span>
                </label>

                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                  />
                  <span>Mark as Sale Item</span>
                </label>
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={submitting}
                style={{ width: '100%', marginTop: '20px' }}
              >
                {submitting ? 'Saving to Supabase...' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
