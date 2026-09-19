'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
  label?: string;
  helperText?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'zarish',
  label = 'Upload Image',
  helperText = 'Recommended: JPG/PNG/WEBP, under 5MB',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url, data.public_id);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', '');
  };

  return (
    <div>
      {label && <label className="block text-[13px] font-semibold text-[#2C241E] mb-1.5">{label}</label>}

      {value ? (
        <div className="relative max-w-[240px] rounded-lg overflow-hidden border border-[#E8E0D5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-auto block" />
          <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium rounded bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 text-xs font-medium rounded bg-[#FEE2E2] text-[#D32F2F] hover:bg-[#FCA5A5] transition-colors"
              disabled={uploading}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-[#E8E0D5] rounded-lg p-6 text-center cursor-pointer bg-[#FAFAF8] transition-all duration-200 hover:border-[#7B5B3A] hover:bg-[#F5EFE6] ${
            uploading ? 'cursor-wait bg-[#F5EFE6]' : ''
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-[#7A6F66] text-sm">
              <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
              <span>Uploading &amp; optimizing image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#7A6F66]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm font-medium text-[#2C241E] m-0">Click to choose image or drag & drop</p>
              {helperText && <p className="text-xs text-[#7A6F66] m-0">{helperText}</p>}
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && <p className="text-xs text-[#D32F2F] mt-1">{error}</p>}
    </div>
  );
}
