'use client';

import { useState, useRef } from 'react';
import { optimizeCloudinaryUrl } from '@/lib/utils';

export interface UploadedImageItem {
  id?: string;
  secure_url: string;
  cloudinary_public_id: string;
  role: 'primary' | 'secondary' | 'gallery' | 'thumbnail';
  display_order: number;
  alt_text?: string;
  width?: number;
  height?: number;
}

interface MultiImageUploadProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  folder?: string;
  label?: string;
  helperText?: string;
}

export default function MultiImageUpload({
  images = [],
  onChange,
  folder = 'zarish/products',
  label = 'Product Photography (Multiple Images)',
  helperText = 'Upload multiple high-resolution photos. First or starred image is the primary cover showcase.',
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);
    setUploading(true);

    const newUploadedItems: UploadedImageItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        const isFirst = images.length === 0 && newUploadedItems.length === 0;

        newUploadedItems.push({
          secure_url: data.url,
          cloudinary_public_id: data.public_id || 'zarish_img',
          role: isFirst ? 'primary' : 'gallery',
          display_order: images.length + newUploadedItems.length,
          width: data.width || 800,
          height: data.height || 1000,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
        });
      }

      const updated = [...images, ...newUploadedItems];
      // Ensure at least one is primary
      if (!updated.some((img) => img.role === 'primary') && updated.length > 0) {
        updated[0].role = 'primary';
      }
      onChange(updated);
    } catch (err: any) {
      console.error('Multi-upload error:', err);
      setError(err?.message || 'Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      role: (i === index ? 'primary' : 'gallery') as 'primary' | 'gallery',
      display_order: i === index ? 0 : img.display_order,
    }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const remaining = images.filter((_, i) => i !== index);
    // If we removed the primary, make the first one primary
    if (remaining.length > 0 && !remaining.some((img) => img.role === 'primary')) {
      remaining[0].role = 'primary';
    }
    const reordered = remaining.map((img, i) => ({
      ...img,
      display_order: i,
    }));
    onChange(reordered);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Update display_order
    const reordered = copy.map((img, i) => ({
      ...img,
      display_order: i,
    }));
    onChange(reordered);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label className="block text-[13px] font-semibold text-[#2C241E] m-0">
          {label} ({images.length})
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors disabled:opacity-50"
        >
          <span>+ Add Images</span>
        </button>
      </div>

      {helperText && (
        <p className="text-xs text-[#7A6F66] mb-3.5">
          {helperText}
        </p>
      )}

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] p-3 rounded-md text-[13px] mb-3.5 border border-[#FFCDD2]">
          {error}
        </div>
      )}

      {/* Grid of Uploaded Images */}
      {images.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '14px',
            marginBottom: '16px',
          }}
        >
          {images.map((img, index) => {
            const isPrimary = img.role === 'primary' || index === 0;

            return (
              <div
                key={img.id || img.secure_url || index}
                style={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#FAF8F5',
                  border: isPrimary ? '2px solid #8B4E5A' : '1px solid #E8E0D5',
                  boxShadow: isPrimary ? '0 2px 8px rgba(139,78,90,0.18)' : '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Badge for Primary Cover */}
                <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 10 }}>
                  {isPrimary ? (
                    <span
                      style={{
                        background: '#8B4E5A',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      ★ Primary Cover
                    </span>
                  ) : (
                    <span
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  title="Remove image"
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    zIndex: 10,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    color: '#C62828',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  ✕
                </button>

                {/* Image Thumbnail Preview */}
                <div style={{ width: '100%', height: '160px', overflow: 'hidden', background: '#F0EBE5' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={optimizeCloudinaryUrl(img.secure_url, { width: 300 })}
                    alt={img.alt_text || `Product image ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Card Controls Footer */}
                <div
                  style={{
                    padding: '8px',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    borderTop: '1px solid #E8E0D5',
                  }}
                >
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      style={{
                        background: '#FAF6F0',
                        border: '1px solid #C8A97E',
                        color: '#7B5B3A',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        fontSize: '10px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'center',
                      }}
                    >
                      Set as Primary
                    </button>
                  )}

                  {isPrimary && (
                    <span style={{ fontSize: '10px', textAlign: 'center', color: '#7B5B3A', fontWeight: 600 }}>
                      Primary Cover
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* "+ Add More" Dropzone Tile */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              height: '220px',
              border: '2px dashed #E8E0D5',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FAF8F5',
              cursor: uploading ? 'wait' : 'pointer',
              padding: '16px',
              textAlign: 'center',
              transition: 'border-color 0.2s ease',
            }}
          >
            {uploading ? (
              <div>
                <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block mx-auto mb-2" />
                <span style={{ fontSize: '11px', color: '#7A6F66', display: 'block' }}>
                  {uploadProgress || 'Uploading...'}
                </span>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>📷</div>
                <strong style={{ fontSize: '12px', color: '#7B5B3A', display: 'block' }}>
                  + Upload More
                </strong>
                <span style={{ fontSize: '10px', color: '#7A6F66' }}>
                  Select multiple files
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State Dropzone */
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-[#E8E0D5] rounded-lg text-center cursor-pointer bg-[#FAFAF8] transition-all duration-200 hover:border-[#7B5B3A] hover:bg-[#F5EFE6] ${
            uploading ? 'cursor-wait bg-[#F5EFE6]' : ''
          }`}
          style={{ padding: '36px 20px' }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-[#7A6F66] text-sm">
              <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
              <span>{uploadProgress || 'Uploading images to Cloudinary...'}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#7A6F66]">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm font-medium text-[#2C241E] mt-2.5 m-0">
                Click to upload multiple product photos or drag & drop
              </p>
              <p className="text-xs text-[#7A6F66] m-0">
                Select 1 to 10 photos. You can easily pick the primary cover and reorder them.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden Multiple File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesSelected}
        style={{ display: 'none' }}
      />
    </div>
  );
}
