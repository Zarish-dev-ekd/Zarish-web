'use client';

import { useState } from 'react';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface UploadedAsset {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  folder: string;
  timestamp: string;
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState('zarish/products');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    const newAssets: UploadedAsset[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Upload failed');
        }

        newAssets.push({
          url: data.url,
          public_id: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
          folder,
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (err: any) {
        console.error('File upload error:', err);
        setError(err?.message || 'Error uploading file');
      }
    }

    if (newAssets.length > 0) {
      setAssets((prev) => [...newAssets, ...prev]);
    }
    setUploading(false);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Media Library & Cloudinary Uploader</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Upload garment photography, hero banners, and brand media. Automatically delivered in high-speed WebP/AVIF format.
          </p>
        </div>
      </div>

      {/* WebP & Next-Gen Speed Notice */}
      <div className="bg-[#F5FAF6] border-l-4 border-[#2E7D32] rounded-lg p-5 mb-6 flex items-center gap-4">
        <div className="text-3xl">⚡</div>
        <div>
          <h4 className="m-0 mb-1 text-[#1B5E20] text-[15px] font-semibold">
            Automatic WebP / AVIF Acceleration Active
          </h4>
          <p className="m-0 text-[13px] text-[#2E7D32] leading-relaxed">
            You can upload heavy <strong>PNG</strong> or <strong>JPG</strong> files here. Our website pipeline automatically injects Cloudinary&apos;s <code>f_auto,q_auto</code> transformation, serving them as lightweight <strong>WebP/AVIF</strong> to visitors. This makes pages load 3x to 5x faster while maintaining pristine visual quality!
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] p-4 rounded-lg border border-[#FFCDD2] mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex justify-between items-center mb-4 max-sm:flex-col max-sm:items-start max-sm:gap-2">
          <h3 className="text-lg font-semibold m-0 text-[#2C241E]">Direct Image Uploader</h3>
          <div className="flex items-center gap-2">
            <label className="text-[13px] font-semibold text-[#2C241E]">Destination Folder:</label>
            <select
              className="px-3 py-1.5 text-sm border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] outline-none focus:border-[#7B5B3A]"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            >
              <option value="zarish/products">Products (zarish/products)</option>
              <option value="zarish/hero">Hero Banners (zarish/hero)</option>
              <option value="zarish/categories">Categories (zarish/categories)</option>
              <option value="zarish/brand">Brand & Story (zarish/brand)</option>
            </select>
          </div>
        </div>

        <label
          htmlFor="file-upload-input"
          className={`border-2 border-dashed border-[#E8E0D5] rounded-lg p-12 text-center cursor-pointer hover:border-[#7B5B3A] hover:bg-[#FAF7F2] transition-colors block text-[#7A6F66] ${
            uploading ? 'pointer-events-none opacity-60 bg-[#FAF7F2]' : ''
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <span className="w-8 h-8 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
              <p className="text-base font-medium text-[#2C241E]">Uploading to Cloudinary...</p>
              <p className="text-xs text-[#7A6F66]">Optimizing and generating WebP CDN delivery URLs</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-base font-medium text-[#2C241E]">
                Click to browse or Drag & Drop multiple images here
              </p>
              <p className="text-xs text-[#7A6F66]">
                Supports PNG, JPG, JPEG, WEBP. Upload any original photo; it will automatically convert to WebP on the storefront.
              </p>
            </div>
          )}
          <input
            id="file-upload-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Uploaded Gallery */}
      <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <h3 className="text-lg font-semibold m-0 mb-4 text-[#2C241E]">
          Uploaded Media Session ({assets.length})
        </h3>

        {assets.length === 0 ? (
          <div className="text-center py-12 text-[#7A6F66]">
            <p>No images uploaded in this session yet.</p>
            <p className="text-xs mt-1">Upload garment or banner photos above to view their WebP previews and Cloudinary CDN URLs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {assets.map((asset, idx) => {
              const webpUrl = optimizeCloudinaryUrl(asset.url, { width: 800 });
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={idx}
                  className="border border-[#E8E0D5] rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/5] bg-[#F5F5F0]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={webpUrl}
                      alt="Uploaded media preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                      {asset.format.toUpperCase()} ➔ WEBP
                    </span>
                  </div>

                  <div className="p-3">
                    <div className="text-[11px] text-[#7A6F66] mb-2">
                      Dimensions: <strong>{asset.width} × {asset.height}</strong> • {asset.folder}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(webpUrl, idx)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors flex-1"
                      >
                        {isCopied ? '✓ Copied URL!' : 'Copy WebP URL'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
