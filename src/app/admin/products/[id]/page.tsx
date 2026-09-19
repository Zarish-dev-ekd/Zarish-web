'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import ColorImageUploader from '@/components/admin/ColorImageUploader';
import MultiImageUpload, { type UploadedImageItem } from '@/components/admin/MultiImageUpload';
import type { Category, Size, ProductColor, Product } from '@/lib/types';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id: productId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  // Database Entities
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableColors, setAvailableColors] = useState<ProductColor[]>([]);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core Product Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [sku, setSku] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [careInstructions, setCareInstructions] = useState('');

  // Visibility & Badges
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isOnSale, setIsOnSale] = useState(false);

  // Color & Image Management State
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [cardCoverColorId, setCardCoverColorId] = useState<string>('');
  const [colorImages, setColorImages] = useState<Record<string, UploadedImageItem[]>>({});
  const [generalImages, setGeneralImages] = useState<UploadedImageItem[]>([]);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  // Size & Stock Matrix State (Color-wise and Standard)
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({});
  const [variantEnabled, setVariantEnabled] = useState<Record<string, boolean>>({});
  const [standardVariantStocks, setStandardVariantStocks] = useState<Record<string, number>>({});
  const [standardVariantEnabled, setStandardVariantEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [
          { data: cats },
          { data: clrs },
          { data: szs },
          { data: prod, error: prodErr },
        ] = await Promise.all([
          supabase.from('categories').select('*').eq('is_active', true).order('name'),
          supabase.from('colors').select('*').eq('is_active', true).order('display_order'),
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
        if (clrs) setAvailableColors(clrs);
        if (szs) setAvailableSizes(szs);

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
        setShortDescription(p.short_description || '');
        setDescription(p.description || '');
        setMaterials(p.materials || '');
        setCareInstructions(p.care_instructions || '');
        setIsActive(Boolean(p.is_active));
        setIsFeatured(Boolean(p.is_featured));
        setIsNewArrival(Boolean(p.is_new_arrival));
        setIsOnSale(Boolean(p.is_on_sale));

        // 1. Reconstruct colors & variant stock from product_variants
        const colorsList = clrs || [];
        const sizesList = szs || [];
        const activeColorIdsSet = new Set<string>();
        const stocksMap: Record<string, number> = {};
        const enabledMap: Record<string, boolean> = {};
        const stdStocksMap: Record<string, number> = {};
        const stdEnabledMap: Record<string, boolean> = {};

        // Initialize standard stocks to 0 for all sizes
        sizesList.forEach((s) => {
          stdStocksMap[s.id] = 0;
          stdEnabledMap[s.id] = true;
        });

        if (p.variants && p.variants.length > 0) {
          p.variants.forEach((v) => {
            if (v.color) {
              // Match color by name in available colors
              const matchedColor = colorsList.find(
                (c) => c.name.toLowerCase() === (v.color || '').toLowerCase()
              );
              if (matchedColor) {
                activeColorIdsSet.add(matchedColor.id);
                const key = `${matchedColor.id}_${v.size_id}`;
                stocksMap[key] = v.stock_quantity ?? 0;
                enabledMap[key] = Boolean(v.is_active);
              }
            } else {
              // Standard variant (product without color)
              stdStocksMap[v.size_id] = v.stock_quantity ?? 0;
              stdEnabledMap[v.size_id] = Boolean(v.is_active);
            }
          });
        }

        // DO NOT default to first color! If activeColorIdsSet is empty, the product has NO colors.
        const initialColorIds = Array.from(activeColorIdsSet);
        setSelectedColorIds(initialColorIds);
        setStandardVariantStocks(stdStocksMap);
        setStandardVariantEnabled(stdEnabledMap);

        // 2. Reconstruct images (color-wise or general)
        const genImages: UploadedImageItem[] = [];
        const colorImagesMap: Record<string, UploadedImageItem[]> = {};
        initialColorIds.forEach((cId) => {
          colorImagesMap[cId] = [];
        });

        let detectedCoverColorId = initialColorIds[0] || '';

        if (p.images && p.images.length > 0) {
          p.images.forEach((img) => {
            const colorMatch = img.alt_text?.match(/\[Color:\s*([^\]]+)\]/i);
            const colorNameFromAlt = colorMatch ? colorMatch[1].trim().toLowerCase() : null;

            if (colorNameFromAlt) {
              const matched = colorsList.find((c) => c.name.toLowerCase() === colorNameFromAlt);
              if (matched) {
                if (!colorImagesMap[matched.id]) colorImagesMap[matched.id] = [];
                colorImagesMap[matched.id].push({
                  id: img.id,
                  secure_url: img.secure_url,
                  cloudinary_public_id: img.cloudinary_public_id,
                  alt_text: img.alt_text,
                  role: img.role as any,
                  display_order: img.display_order,
                  width: img.width,
                  height: img.height,
                });
                if (img.role === 'primary') {
                  detectedCoverColorId = matched.id;
                }
                return;
              }
            }

            // If product has no colors, or image is general:
            if (initialColorIds.length === 0) {
              genImages.push({
                id: img.id,
                secure_url: img.secure_url,
                cloudinary_public_id: img.cloudinary_public_id,
                alt_text: img.alt_text,
                role: img.role as any,
                display_order: img.display_order,
                width: img.width,
                height: img.height,
              });
            } else {
              // Image belongs to first color if colors exist
              const targetId = initialColorIds[0];
              if (!colorImagesMap[targetId]) colorImagesMap[targetId] = [];
              colorImagesMap[targetId].push({
                id: img.id,
                secure_url: img.secure_url,
                cloudinary_public_id: img.cloudinary_public_id,
                alt_text: img.alt_text,
                role: img.role as any,
                display_order: img.display_order,
                width: img.width,
                height: img.height,
              });
            }
          });
        }

        setGeneralImages(genImages);
        setColorImages(colorImagesMap);
        setCardCoverColorId(detectedCoverColorId || initialColorIds[0] || '');

        // Make sure all sizes for active colors have initialized stock keys
        initialColorIds.forEach((cId) => {
          sizesList.forEach((s) => {
            const key = `${cId}_${s.id}`;
            if (stocksMap[key] === undefined) stocksMap[key] = 0;
            if (enabledMap[key] === undefined) enabledMap[key] = true;
          });
        });

        setVariantStocks(stocksMap);
        setVariantEnabled(enabledMap);
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
    if (!slug || slug === name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleAddColor = (colorId: string) => {
    if (selectedColorIds.includes(colorId)) {
      setIsColorModalOpen(false);
      return;
    }

    const updated = [...selectedColorIds, colorId];
    setSelectedColorIds(updated);

    if (!cardCoverColorId || !selectedColorIds.includes(cardCoverColorId)) {
      setCardCoverColorId(colorId);
    }

    // If there were general images uploaded before adding colors, move them to this first color
    if (selectedColorIds.length === 0 && generalImages.length > 0) {
      setColorImages((prev) => ({
        ...prev,
        [colorId]: [...generalImages],
      }));
    }

    setVariantStocks((prev) => {
      const next = { ...prev };
      availableSizes.forEach((s) => {
        const k = `${colorId}_${s.id}`;
        if (next[k] === undefined) next[k] = 0;
      });
      return next;
    });

    setVariantEnabled((prev) => {
      const next = { ...prev };
      availableSizes.forEach((s) => {
        const k = `${colorId}_${s.id}`;
        if (next[k] === undefined) next[k] = true;
      });
      return next;
    });

    setIsColorModalOpen(false);
  };

  const handleRemoveColor = (colorId: string) => {
    const updated = selectedColorIds.filter((id) => id !== colorId);
    setSelectedColorIds(updated);

    if (cardCoverColorId === colorId) {
      setCardCoverColorId(updated[0] || '');
    }

    setColorImages((prev) => {
      const next = { ...prev };
      delete next[colorId];
      return next;
    });
  };

  const handleColorImagesChange = (colorId: string, imgs: UploadedImageItem[]) => {
    setColorImages((prev) => ({
      ...prev,
      [colorId]: imgs,
    }));
  };

  const handleStockChange = (colorId: string, sizeId: string, val: string) => {
    const key = `${colorId}_${sizeId}`;
    if (val === '') {
      setVariantStocks((prev) => ({
        ...prev,
        [key]: 0,
      }));
      return;
    }
    const clean = val.replace(/^0+(?=\d)/, '');
    const num = parseInt(clean, 10);
    setVariantStocks((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleToggleVariant = (colorId: string, sizeId: string) => {
    const key = `${colorId}_${sizeId}`;
    setVariantEnabled((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStandardStockChange = (sizeId: string, val: string) => {
    if (val === '') {
      setStandardVariantStocks((prev) => ({
        ...prev,
        [sizeId]: 0,
      }));
      return;
    }
    const clean = val.replace(/^0+(?=\d)/, '');
    const num = parseInt(clean, 10);
    setStandardVariantStocks((prev) => ({
      ...prev,
      [sizeId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleToggleStandardVariant = (sizeId: string) => {
    setStandardVariantEnabled((prev) => ({
      ...prev,
      [sizeId]: !prev[sizeId],
    }));
  };

  const totalStock = useMemo(() => {
    let sum = 0;
    if (selectedColorIds.length === 0) {
      availableSizes.forEach((s) => {
        if (standardVariantEnabled[s.id] !== false) {
          sum += standardVariantStocks[s.id] || 0;
        }
      });
    } else {
      selectedColorIds.forEach((cId) => {
        availableSizes.forEach((s) => {
          const k = `${cId}_${s.id}`;
          if (variantEnabled[k] !== false) {
            sum += variantStocks[k] || 0;
          }
        });
      });
    }
    return sum;
  }, [
    selectedColorIds,
    availableSizes,
    standardVariantStocks,
    standardVariantEnabled,
    variantStocks,
    variantEnabled,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price) {
      setError('Product title and price are required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const totalImagesCount =
      selectedColorIds.length === 0
        ? generalImages.length
        : Object.values(colorImages).reduce((count, arr) => count + (arr?.length || 0), 0);

    if (totalImagesCount === 0) {
      setError('Please upload at least one image for the product.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const parsedPrice = parseFloat(price) || 0;
      const parsedComparePrice = comparePrice ? parseFloat(comparePrice) : null;

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
          stock_quantity: totalStock,
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
      await supabase.from('product_images').delete().eq('product_id', productId);

      const imageRows: any[] = [];
      if (selectedColorIds.length === 0) {
        generalImages.forEach((img, idx) => {
          imageRows.push({
            product_id: productId,
            cloudinary_public_id: img.cloudinary_public_id || 'zarish_img',
            secure_url: img.secure_url,
            alt_text: img.alt_text || name.trim(),
            role: idx === 0 ? 'primary' : 'gallery',
            display_order: idx,
            width: img.width || 800,
            height: img.height || 1000,
          });
        });
      } else {
        const coverColorObj = availableColors.find((c) => c.id === cardCoverColorId);
        const coverImgs = colorImages[cardCoverColorId] || [];

        coverImgs.forEach((img, idx) => {
          imageRows.push({
            product_id: productId,
            cloudinary_public_id: img.cloudinary_public_id || 'zarish_img',
            secure_url: img.secure_url,
            alt_text: `[Color: ${coverColorObj?.name || 'Default'}] ${name.trim()}`,
            role: idx === 0 ? 'primary' : 'gallery',
            display_order: imageRows.length,
            width: img.width || 800,
            height: img.height || 1000,
          });
        });

        selectedColorIds
          .filter((cId) => cId !== cardCoverColorId)
          .forEach((cId) => {
            const cObj = availableColors.find((c) => c.id === cId);
            const otherImgs = colorImages[cId] || [];

            otherImgs.forEach((img) => {
              imageRows.push({
                product_id: productId,
                cloudinary_public_id: img.cloudinary_public_id || 'zarish_img',
                secure_url: img.secure_url,
                alt_text: `[Color: ${cObj?.name || 'Color'}] ${name.trim()}`,
                role: 'gallery',
                display_order: imageRows.length,
                width: img.width || 800,
                height: img.height || 1000,
              });
            });
          });
      }

      if (imageRows.length > 0) {
        const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
        if (imgErr) console.warn('Could not update images:', imgErr);
      }

      // 3. Sync variants
      await supabase.from('product_variants').delete().eq('product_id', productId);

      const variantRows: any[] = [];
      if (selectedColorIds.length === 0) {
        availableSizes.forEach((s) => {
          const isEnabled = standardVariantEnabled[s.id] !== false;
          const qty = standardVariantStocks[s.id] ?? 0;

          if (isEnabled) {
            variantRows.push({
              product_id: productId,
              size_id: s.id,
              color: null,
              stock_quantity: qty,
              sku: sku ? `${sku}-${s.name}` : null,
              price: parsedPrice,
              compare_at_price: parsedComparePrice,
              is_active: true,
            });
          }
        });
      } else {
        selectedColorIds.forEach((cId) => {
          const cObj = availableColors.find((c) => c.id === cId);
          const colorName = cObj?.name || null;

          availableSizes.forEach((s) => {
            const k = `${cId}_${s.id}`;
            const isEnabled = variantEnabled[k] !== false;
            const qty = variantStocks[k] ?? 0;

            if (isEnabled) {
              variantRows.push({
                product_id: productId,
                size_id: s.id,
                color: colorName,
                stock_quantity: qty,
                sku: sku ? `${sku}-${colorName ? colorName.slice(0, 3).toUpperCase() : 'CLR'}-${s.name}` : null,
                price: parsedPrice,
                compare_at_price: parsedComparePrice,
                is_active: true,
              });
            }
          });
        });
      }

      if (variantRows.length > 0) {
        const { error: varErr } = await supabase.from('product_variants').insert(variantRows);
        if (varErr) console.warn('Could not update variants:', varErr);
      }

      router.push('/admin/products');
    } catch (err: any) {
      console.error('Error saving product changes:', err);
      setError(err?.message || 'Failed to save product changes. Please try again.');
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loadingInitial) {
    return (
      <div className="text-center py-20">
        <span className="w-6 h-6 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
        <p className="mt-3 text-sm text-[#7A6F66]">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* ─── Page Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1 font-semibold">
            Edit Product: {name || 'Garment'}
          </h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Update color collections, photography per color, and color-wise size inventory.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50 shadow-sm"
          >
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] p-4 rounded-lg border border-[#FFCDD2] mb-6 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[#D32F2F] font-bold text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          {/* ─── LEFT COLUMN: Basic Info, Colors & Images, Color-wise Sizes ─── */}
          <div className="space-y-6">
            {/* 1. Basic Details Card */}
            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">
                1. Basic Information
              </h3>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="e.g. Classic Embroidered Silk Abaya"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[13px] font-semibold text-[#2C241E]">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSlug(
                        name
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '')
                      )
                    }
                    className="text-xs text-[#7B5B3A] hover:underline"
                  >
                    ↺ Sync with Title
                  </button>
                </div>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="classic-embroidered-silk-abaya"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                  Short Tagline / Excerpt
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="Handcrafted premium crepe with subtle wrist embroidery."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              <div className="mb-0">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                  Full Garment Description
                </label>
                <textarea
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  rows={4}
                  placeholder="Detailed description of the cut, drape, fabric feel, styling suggestions, and modest silhouette..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Color Selection & Photography */}
            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-semibold m-0 text-[#2C241E]">
                    2. Garment Photography & Colors
                  </h3>
                  <p className="text-xs text-[#7A6F66] mt-1 m-0">
                    {selectedColorIds.length === 0
                      ? 'No colors added. You can upload general product photos below, or click "+ Add Color" if this product has color variations.'
                      : 'Upload photography for each color separately and select which color appears on the storefront product card.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsColorModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-[#FAF6F0] border border-[#C8A97E] text-[#7B5B3A] hover:bg-[#F5EFE6] transition-colors"
                >
                  <span>+ Add Color</span>
                </button>
              </div>

              {/* State A: When NO colors have been added */}
              {selectedColorIds.length === 0 && (
                <div>
                  <MultiImageUpload
                    images={generalImages}
                    onChange={setGeneralImages}
                    folder="zarish/products"
                    label="Product Images"
                    helperText="Upload multiple photos for this product. The first photo will be used as the primary card cover."
                  />
                </div>
              )}

              {/* State B: When colors ARE added */}
              {selectedColorIds.length > 0 && (
                <div className="space-y-4">
                  {selectedColorIds.map((colorId) => {
                    const colorObj = availableColors.find((c) => c.id === colorId);
                    if (!colorObj) return null;

                    return (
                      <ColorImageUploader
                        key={colorId}
                        colorId={colorId}
                        colorName={colorObj.name}
                        colorHex={colorObj.hex_code}
                        images={colorImages[colorId] || []}
                        onChange={(imgs) => handleColorImagesChange(colorId, imgs)}
                        isCardCover={cardCoverColorId === colorId}
                        onSetCardCover={() => setCardCoverColorId(colorId)}
                        onRemoveColor={() => handleRemoveColor(colorId)}
                        canRemove={true}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Sizes & Stock Inventory Card */}
            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-semibold m-0 text-[#2C241E]">
                    3. Sizes & Stock Inventory
                  </h3>
                  <p className="text-xs text-[#7A6F66] mt-1 m-0">
                    {selectedColorIds.length === 0
                      ? 'Set stock quantity for each size. Total stock updates automatically.'
                      : 'Set the stock level for each Size under each Color.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#7A6F66]">Total Stock:</span>
                  <span className="ml-1.5 text-base font-bold text-[#2C241E]">
                    {totalStock} units
                  </span>
                </div>
              </div>

              {availableSizes.length === 0 ? (
                <p className="text-xs text-[#7A6F66]">
                  No sizes found. Configure sizes in{' '}
                  <Link href="/admin/sizes" className="text-[#7B5B3A] underline">
                    Size & Color Manager
                  </Link>.
                </p>
              ) : selectedColorIds.length === 0 ? (
                /* Standard (no color) size inventory - Full Width Table */
                <div className="border border-[#E8E0D5] rounded-xl overflow-hidden bg-white shadow-sm w-full">
                  <div className="p-4 bg-[#FAF8F5]/60 border-b border-[#E8E0D5] flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-semibold text-[#2C241E]">
                      Standard Sizes Stock
                    </span>
                    <span className="text-xs text-[#7A6F66]">
                      {availableSizes.filter((s) => standardVariantEnabled[s.id] !== false).length} of {availableSizes.length} sizes active
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-[#FAF8F5]/40 border-b border-[#E8E0D5] text-xs font-semibold text-[#7A6F66]">
                          <th className="py-3 px-5 w-24">Size</th>
                          <th className="py-3 px-5 w-44">Status</th>
                          <th className="py-3 px-5 min-w-[200px]">Stock Quantity</th>
                          <th className="py-3 px-5 text-right w-40">Availability</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE4]">
                        {availableSizes.map((s) => {
                          const isEnabled = standardVariantEnabled[s.id] !== false;
                          const stockVal = standardVariantStocks[s.id] ?? 0;

                          return (
                            <tr
                              key={s.id}
                              className={`transition-colors ${
                                isEnabled ? 'hover:bg-[#FAF8F5]/50 bg-white' : 'bg-[#FAF9F7]/60 opacity-60'
                              }`}
                            >
                              <td className="py-3.5 px-5">
                                <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-2.5 text-xs font-bold text-[#2C241E] bg-[#F5EFE6] rounded-md border border-[#E4D8C8]">
                                  {s.name}
                                </span>
                              </td>

                              <td className="py-3.5 px-5">
                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={() => handleToggleStandardVariant(s.id)}
                                    className="w-4 h-4 accent-[#7B5B3A] rounded cursor-pointer"
                                  />
                                  <span className={`text-xs font-medium ${isEnabled ? 'text-[#2C241E]' : 'text-[#A09383]'}`}>
                                    {isEnabled ? 'Active' : 'Disabled'}
                                  </span>
                                </label>
                              </td>

                              <td className="py-3.5 px-5 min-w-[200px]">
                                <input
                                  type="number"
                                  min="0"
                                  disabled={!isEnabled}
                                  value={stockVal === 0 ? '' : stockVal}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) =>
                                    handleStandardStockChange(s.id, e.target.value)
                                  }
                                  className="w-full min-w-[160px] h-10 px-4 text-sm font-semibold text-center border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 disabled:bg-gray-100 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </td>

                              <td className="py-3.5 px-5 text-right">
                                {!isEnabled ? (
                                  <span className="text-xs font-medium text-[#A09383]">Inactive</span>
                                ) : stockVal > 0 ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                                    in stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D32F2F] bg-[#FFEBEE] px-2.5 py-1 rounded-full">
                                    Out of stock
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Color-wise size inventory - Full Width Tables */
                <div className="space-y-6">
                  {selectedColorIds.map((cId) => {
                    const colorObj = availableColors.find((c) => c.id === cId);
                    if (!colorObj) return null;

                    return (
                      <div
                        key={cId}
                        className="border border-[#E8E0D5] rounded-xl overflow-hidden bg-white shadow-sm w-full"
                      >
                        {/* Subheader per color */}
                        <div className="p-4 bg-[#FAF8F5]/60 border-b border-[#E8E0D5] flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                              style={{ backgroundColor: colorObj.hex_code }}
                            />
                            <strong className="text-sm text-[#2C241E] capitalize">
                              {colorObj.name}
                            </strong>
                            {cardCoverColorId === cId && (
                              <span className="text-[10px] bg-[#7B5B3A] text-white px-1.5 py-0.5 rounded font-medium">
                                Card Cover
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#7A6F66]">
                            {availableSizes.filter((s) => variantEnabled[`${cId}_${s.id}`] !== false).length} of {availableSizes.length} sizes active
                          </span>
                        </div>

                        {/* Size stock inputs full-width table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                              <tr className="bg-[#FAF8F5]/40 border-b border-[#E8E0D5] text-xs font-semibold text-[#7A6F66]">
                                <th className="py-3 px-5 w-24">Size</th>
                                <th className="py-3 px-5 w-44">Status</th>
                                <th className="py-3 px-5 min-w-[200px]">Stock Quantity</th>
                                <th className="py-3 px-5 text-right w-40">Availability</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F2ECE4]">
                              {availableSizes.map((s) => {
                                const key = `${cId}_${s.id}`;
                                const isEnabled = variantEnabled[key] !== false;
                                const stockVal = variantStocks[key] ?? 0;

                                return (
                                  <tr
                                    key={s.id}
                                    className={`transition-colors ${
                                      isEnabled ? 'hover:bg-[#FAF8F5]/50 bg-white' : 'bg-[#FAF9F7]/60 opacity-60'
                                    }`}
                                  >
                                    <td className="py-3.5 px-5">
                                      <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-2.5 text-xs font-bold text-[#2C241E] bg-[#F5EFE6] rounded-md border border-[#E4D8C8]">
                                        {s.name}
                                      </span>
                                    </td>

                                    <td className="py-3.5 px-5">
                                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={isEnabled}
                                          onChange={() => handleToggleVariant(cId, s.id)}
                                          className="w-4 h-4 accent-[#7B5B3A] rounded cursor-pointer"
                                        />
                                        <span className={`text-xs font-medium ${isEnabled ? 'text-[#2C241E]' : 'text-[#A09383]'}`}>
                                          {isEnabled ? 'Active' : 'Disabled'}
                                        </span>
                                      </label>
                                    </td>

                                    <td className="py-3.5 px-5 min-w-[200px]">
                                      <input
                                        type="number"
                                        min="0"
                                        disabled={!isEnabled}
                                        value={stockVal === 0 ? '' : stockVal}
                                        placeholder="0"
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) =>
                                          handleStockChange(cId, s.id, e.target.value)
                                        }
                                        className="w-full min-w-[160px] h-10 px-4 text-sm font-semibold text-center border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 disabled:bg-gray-100 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                    </td>

                                    <td className="py-3.5 px-5 text-right">
                                      {!isEnabled ? (
                                        <span className="text-xs font-medium text-[#A09383]">Inactive</span>
                                      ) : stockVal > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                                          in stock
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D32F2F] bg-[#FFEBEE] px-2.5 py-1 rounded-full">
                                          Out of stock
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Fabric & Specifications */}
            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">
                4. Fabric & Garment Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                    Fabric / Materials
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    placeholder="e.g. 100% Premium Pure Korean Nida"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                    Care Instructions
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                    placeholder="e.g. Dry Clean Only or Delicate Hand Wash"
                    value={careInstructions}
                    onChange={(e) => setCareInstructions(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Pricing, Category, Badges, Save ─── */}
          <div className="space-y-6">
            {/* Pricing & SKU */}
            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">
                Pricing & SKU
              </h3>

              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                  Sale Price (INR ₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="2999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                  Compare at Price (Original / Strikethrough)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="3999"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                />
              </div>

              <div className="mb-0">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                  Base SKU Code
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
                  placeholder="ZR-ABY-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            </div>

            {/* Category Organization */}
            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">
                Category
              </h3>

              <div className="mb-0">
                <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">
                  Collection Category
                </label>
                <select
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none transition-colors duration-200 focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15"
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
            </div>

            {/* Storefront Badges & Visibility */}
            <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">
                Storefront Badges & Status
              </h3>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#2C241E]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#7B5B3A] rounded cursor-pointer"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active (Visible on Storefront)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#2C241E]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#7B5B3A] rounded cursor-pointer"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                  />
                  <span>Show &quot;New Arrival&quot; Badge</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#2C241E]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#7B5B3A] rounded cursor-pointer"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <span>Feature on Homepage Showcase</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#2C241E]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#7B5B3A] rounded cursor-pointer"
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                  />
                  <span>Mark as Sale / Promo Item</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Saving Changes...' : 'Save Product Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ─── COLOR SELECTOR MODAL ─────────────────────────────────── */}
      {isColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E8E0D5] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5] mb-4">
              <h3 className="text-lg font-semibold text-[#2C241E] m-0">
                Choose a Color to Add
              </h3>
              <button
                type="button"
                onClick={() => setIsColorModalOpen(false)}
                className="text-[#7A6F66] hover:text-[#2C241E] text-base p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#7A6F66] mb-4">
              Select any color from your registered brand colors. You can upload dedicated images and set size stock for it.
            </p>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {availableColors.map((c) => {
                const isAlreadySelected = selectedColorIds.includes(c.id);

                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={isAlreadySelected}
                    onClick={() => handleAddColor(c.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isAlreadySelected
                        ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-[#E8E0D5] hover:border-[#7B5B3A] hover:bg-[#FAF7F2] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full border border-black/15 shadow-inner shrink-0"
                        style={{ backgroundColor: c.hex_code }}
                      />
                      <div>
                        <strong className="text-sm text-[#2C241E] capitalize block">
                          {c.name}
                        </strong>
                        <span className="text-[11px] text-[#7A6F66] font-mono">
                          {c.hex_code}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isAlreadySelected ? (
                        <span className="text-xs font-semibold text-[#7A6F66]">
                          ✓ Added
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#7B5B3A]">
                          + Select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#E8E0D5] mt-4 flex justify-between items-center">
              <Link
                href="/admin/sizes"
                className="text-xs text-[#7B5B3A] underline font-medium"
              >
                + Manage or Add New Colors in Settings
              </Link>
              <button
                type="button"
                onClick={() => setIsColorModalOpen(false)}
                className="px-4 py-1.5 text-xs rounded border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#FAF7F2]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
