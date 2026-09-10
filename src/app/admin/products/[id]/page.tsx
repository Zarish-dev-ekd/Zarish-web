'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import MultiImageUpload, { UploadedImageItem } from '@/components/admin/MultiImageUpload';
import type { Category, Size, Product } from '@/lib/types';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id: productId } = use(params);
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

  // Images state
  const [images, setImages] = useState<UploadedImageItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [
          { data: cats },
          { data: szs },
          { data: prod, error: prodErr }
        ] = await Promise.all([
          supabase.from('categories').select('*').eq('is_active', true).order('name'),
          supabase.from('sizes').select('*').eq('is_active', true).order('display_order'),
          supabase
            .from('products')
            .select(`
              *,
              images:product_images(*),
              variants:product_variants(*)
            `)
            .eq('id', productId)
            .single(),
        ]);

        if (cats) setCategories(cats);
        if (szs) setSizes(szs);

        if (prodErr || !prod) {
          setError('Product not found or failed to load.');
          return;
        }

        const p = prod as Product;
        setName(p.name || '');
        setSlug(p.slug || '');
        setCategoryId(p.category_id || '');
        setPrice(p.price !== undefined ? String(p.price) : '');
        setComparePrice(p.compare_at_price ? String(p.compare_at_price) : '');
        setSku(p.sku || '');
        setStockQuantity(String(p.stock_quantity ?? 10));
        setShortDescription(p.short_description || '');
        setDescription(p.description || '');
        setMaterials(p.materials || '');
        setCareInstructions(p.care_instructions || '');
        setIsActive(Boolean(p.is_active));
        setIsFeatured(Boolean(p.is_featured));
        setIsNewArrival(Boolean(p.is_new_arrival));
        setIsOnSale(Boolean(p.is_on_sale));

        // Populate sizes
        if (p.variants && p.variants.length > 0) {
          setSelectedSizes(p.variants.map((v) => v.size_id));
        }

        // Populate images sorted by primary first, then display_order
        if (p.images && p.images.length > 0) {
          const sorted = [...p.images].sort((a, b) => {
            if (a.role === 'primary') return -1;
            if (b.role === 'primary') return 1;
            return (a.display_order ?? 0) - (b.display_order ?? 0);
          });

          setImages(
            sorted.map((img, index) => ({
              id: img.id,
              secure_url: img.secure_url,
              cloudinary_public_id: img.cloudinary_public_id,
              role: img.role as any,
              display_order: index,
              alt_text: img.alt_text,
              width: img.width,
              height: img.height,
            }))
          );
        }
      } catch (err: any) {
        console.error('Failed to load product details:', err);
        setError(err?.message || 'Failed to load product details');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadData();
  }, [productId, supabase]);

  const handleNameChange = (val: string) => {
    setName(val);
    // Keep slug synced if user hasn't typed custom slug or if empty
    if (!slug || slug === name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
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
      const parsedPrice = parseFloat(price) || 0;
      const parsedComparePrice = comparePrice ? parseFloat(comparePrice) : null;
      const parsedStock = parseInt(stockQuantity, 10) || 0;

      // 1. Update product table
      const { error: updateErr } = await supabase
        .from('products')
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (updateErr) throw updateErr;

      // 2. Sync product images
      // Delete existing images for this product
      const { error: delImgErr } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      if (delImgErr) console.warn('Could not clear old product images:', delImgErr);

      // Insert current list of images
      if (images.length > 0) {
        const imageRows = images.map((img, idx) => ({
          product_id: productId,
          secure_url: img.secure_url,
          cloudinary_public_id: img.cloudinary_public_id || 'zarish_img',
          alt_text: img.alt_text || name.trim(),
          role: img.role || (idx === 0 ? 'primary' : 'gallery'),
          display_order: idx,
          width: img.width || 800,
          height: img.height || 1000,
        }));

        const { error: imgInsertErr } = await supabase.from('product_images').insert(imageRows);
        if (imgInsertErr) console.warn('Could not save product image records:', imgInsertErr);
      }

      // 3. Sync variants for selected sizes
      await supabase.from('product_variants').delete().eq('product_id', productId);

      if (selectedSizes.length > 0) {
        const variantRows = selectedSizes.map((sizeId) => ({
          product_id: productId,
          size_id: sizeId,
          stock_quantity: Math.max(1, Math.floor(parsedStock / selectedSizes.length)),
          is_active: true,
        }));

        const { error: varErr } = await supabase
          .from('product_variants')
          .insert(variantRows);

        if (varErr) console.warn('Could not update product variants:', varErr);
      }

      router.push('/admin/products');
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err?.message || 'Failed to update product in Supabase');
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <span className="admin-spinner" />
        <p style={{ marginTop: '16px', color: 'var(--admin-text-muted)' }}>Loading product details...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Edit Product: {name || 'Garment'}</h2>
          <p className="admin-page-subtitle">
            Update garment imagery, pricing, details, and stock.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/admin/products" className="admin-btn admin-btn--secondary">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="admin-btn admin-btn--primary"
          >
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px', marginBottom: '20px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="admin-label">URL Slug</label>
                  <button
                    type="button"
                    onClick={() => setSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}
                    style={{ fontSize: '11px', color: '#7B5B3A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    ↺ Sync with Name
                  </button>
                </div>
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

            {/* Multiple Photos Upload & Gallery Manager */}
            <div className="admin-card">
              <h3 className="admin-card__title">Product Photography</h3>
              <MultiImageUpload
                images={images}
                onChange={setImages}
                folder="zarish/products"
                label="Product Images (Multiple)"
                helperText="Add multiple high-resolution photos. First or starred image will be the primary cover showcase."
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
                {submitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
