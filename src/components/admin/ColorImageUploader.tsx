'use client';

import { useState, useRef } from 'react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import type { UploadedImageItem } from './MultiImageUpload';

interface ColorImageUploaderProps {
  colorId: string;
  colorName: string;
  colorHex: string;
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  isCardCover: boolean;
  onSetCardCover: () => void;
  onRemoveColor: () => void;
  canRemove: boolean;
}

export default function ColorImageUploader({
  colorName,
  colorHex,
  images,
  onChange,
  isCardCover,
  onSetCardCover,
  onRemoveColor,
  canRemove,
}: ColorImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    const uploadedList: UploadedImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'zarish/products');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Upload failed');
        }

        uploadedList.push({
          secure_url: data.url,
          cloudinary_public_id: data.public_id,
          alt_text: `${colorName}`,
          role: images.length === 0 && uploadedList.length === 1 ? 'primary' : 'gallery',
          width: data.width,
          height: data.height,
          display_order: images.length + uploadedList.length,
        });
      } catch (err: any) {
        console.error('Upload error for image:', err);
        setError(err?.message || 'Error uploading some images');
      }
    }

    if (uploadedList.length > 0) {
      onChange([...images, ...uploadedList]);
    }

    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.role === 'primary')) {
      updated[0].role = 'primary';
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      role: (i === index ? 'primary' : 'gallery') as 'primary' | 'gallery',
    }));
    // Move to front
    const selected = updated.splice(index, 1)[0];
    updated.unshift(selected);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  return (
    <div className={`rounded-xl border p-5 mb-5 transition-all ${
      isCardCover ? 'border-[#7B5B3A] bg-[#FAF8F5]/60 shadow-sm' : 'border-[#E8E0D5] bg-white'
    }`}>
      {/* Header bar of Color Section */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 mb-4 border-b border-[#E8E0D5]">
        <div className="flex items-center gap-3">
          <span
            className="w-7 h-7 rounded-full border border-black/15 shadow-inner shrink-0"
            style={{ backgroundColor: colorHex || '#ccc' }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="m-0 font-semibold text-base text-[#2C241E] capitalize">
                {colorName}
              </h4>
          
            </div>
            <span className="text-[11px] text-[#7A6F66]">
              {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Radio option for Product Card display */}
          <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${
            isCardCover
              ? 'bg-[#7B5B3A] border-[#7B5B3A] text-white'
              : 'border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#FAF7F2]'
          }`}>
            <input
              type="radio"
              name="cardCoverColor"
              checked={isCardCover}
              onChange={onSetCardCover}
              className="sr-only"
            />
            <span>{isCardCover ? '★ Showing on Product Card' : 'Select for Product Card'}</span>
          </label>

          {canRemove && (
            <button
              type="button"
              onClick={onRemoveColor}
              className="text-xs px-2.5 py-1.5 rounded-md border border-[#FECACA] bg-[#FEE2E2] text-[#D32F2F] hover:bg-[#FCA5A5] transition-colors"
            >
              Remove Color
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] p-3 rounded-md text-xs mb-3 border border-[#FFCDD2]">
          {error}
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-3.5">
          {images.map((img, idx) => {
            const isPrimaryThisColor = img.role === 'primary' || idx === 0;

            return (
              <div
                key={img.id || img.secure_url || idx}
                className={`relative rounded-lg overflow-hidden bg-[#FAF8F5] flex flex-col border transition-all ${
                  isPrimaryThisColor
                    ? 'border-[#7B5B3A] shadow-md ring-1 ring-[#7B5B3A]/30'
                    : 'border-[#E8E0D5] shadow-xs'
                }`}
              >
                {/* Badge */}
                <div className="absolute top-1.5 left-1.5 z-10">
                  {isPrimaryThisColor ? (
                    <span className="bg-[#7B5B3A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      ★ Cover
                    </span>
                  ) : (
                    <span className="bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  title="Remove image"
                  className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-white/90 hover:bg-white text-[#D32F2F] flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  ✕
                </button>

                {/* Thumbnail */}
                <div className="w-full aspect-[3/4] overflow-hidden bg-[#F5EDE4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={optimizeCloudinaryUrl(img.secure_url, { width: 300 })}
                    alt={`${colorName} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card footer */}
                <div className="p-2 bg-white flex flex-col gap-1.5 border-t border-[#E8E0D5]">
                  {!isPrimaryThisColor ? (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="w-full text-center text-[10px] font-semibold py-1 px-1.5 rounded bg-[#FAF6F0] border border-[#C8A97E] text-[#7B5B3A] hover:bg-[#F5EFE6]"
                    >
                      Set as Cover
                    </button>
                  ) : (
                    <span className="w-full text-center text-[10px] font-semibold py-1 px-1.5 rounded bg-[#FAF6F0] text-[#7B5B3A]">
                      Main Cover
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add more tile */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="aspect-[3/4] border-2 border-dashed border-[#E8E0D5] hover:border-[#7B5B3A] hover:bg-[#FAF7F2] rounded-lg flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-white"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-1.5 text-xs text-[#7A6F66]">
                <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
                <span className="text-[10px]">{uploadProgress}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">📷</span>
                <span className="text-xs font-semibold text-[#7B5B3A]">+ Upload More</span>
                <span className="text-[10px] text-[#7A6F66]">for {colorName}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty state dropzone */
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#E8E0D5] hover:border-[#7B5B3A] hover:bg-[#FAF7F2] rounded-lg p-6 text-center cursor-pointer transition-colors bg-white mb-2"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-[#7A6F66] text-xs">
              <span className="w-6 h-6 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
              <span>{uploadProgress || 'Uploading & optimizing images...'}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7B5B3A" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-xs font-semibold text-[#2C241E] m-0">
                Click to upload photos for {colorName}
              </p>
              <p className="text-[11px] text-[#7A6F66] m-0">
                Upload 1 or more photos. Supports JPG, PNG, WEBP.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
