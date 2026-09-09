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
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Media Library & Cloudinary Uploader</h2>
          <p className="admin-page-subtitle">
            Upload garment photography, hero banners, and brand media. Automatically delivered in high-speed WebP/AVIF format.
          </p>
        </div>
      </div>

      {/* WebP & Next-Gen Speed Notice */}
      <div
        className="admin-card"
        style={{
          background: '#F5FAF6',
          borderLeft: '4px solid #2E7D32',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ fontSize: '28px' }}>⚡</div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', color: '#1B5E20', fontSize: '15px' }}>
            Automatic WebP / AVIF Acceleration Active
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#2E7D32', lineHeight: '1.5' }}>
            You can upload heavy <strong>PNG</strong> or <strong>JPG</strong> files here. Our website pipeline automatically injects Cloudinary&apos;s <code>f_auto,q_auto</code> transformation, serving them as lightweight <strong>WebP/AVIF</strong> to visitors. This makes pages load 3x to 5x faster while maintaining pristine visual quality!
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px' }}>
          {error}
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="admin-card__title" style={{ margin: 0 }}>Direct Image Uploader</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Destination Folder:</label>
            <select
              className="admin-select"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px' }}
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
          className={`admin-image-dropzone ${uploading ? 'admin-image-dropzone--uploading' : ''}`}
          style={{ padding: '48px 24px', display: 'block' }}
        >
          {uploading ? (
            <div className="admin-image-dropzone__content">
              <span className="admin-spinner" style={{ width: '32px', height: '32px' }} />
              <p className="admin-image-dropzone__text">Uploading to Cloudinary...</p>
              <p className="admin-image-dropzone__subtext">Optimizing and generating WebP CDN delivery URLs</p>
            </div>
          ) : (
            <div className="admin-image-dropzone__content">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="admin-image-dropzone__text" style={{ fontSize: '16px' }}>
                Click to browse or Drag & Drop multiple images here
              </p>
              <p className="admin-image-dropzone__subtext">
                Supports PNG, JPG, JPEG, WEBP. Upload any original photo; it will automatically convert to WebP on the storefront.
              </p>
            </div>
          )}
          <input
            id="file-upload-input"
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Uploaded Gallery */}
      <div className="admin-card">
        <h3 className="admin-card__title">
          Uploaded Media Session ({assets.length})
        </h3>

        {assets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--admin-text-muted)' }}>
            <p>No images uploaded in this session yet.</p>
            <p style={{ fontSize: '13px' }}>Upload garment or banner photos above to view their WebP previews and Cloudinary CDN URLs.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {assets.map((asset, idx) => {
              const webpUrl = optimizeCloudinaryUrl(asset.url, { width: 800 });
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--admin-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ position: 'relative', aspectRatio: '4/5', background: '#F5F5F0' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={webpUrl}
                      alt="Uploaded media preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#FFF',
                        fontSize: '10px',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      {asset.format.toUpperCase()} ➔ WEBP
                    </span>
                  </div>

                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>
                      Dimensions: <strong>{asset.width} × {asset.height}</strong> • {asset.folder}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(webpUrl, idx)}
                        className="admin-btn admin-btn--sm admin-btn--primary"
                        style={{ flex: 1 }}
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
