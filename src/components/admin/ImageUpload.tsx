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
    <div className="admin-image-upload">
      {label && <label className="admin-label">{label}</label>}

      {value ? (
        <div className="admin-image-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="admin-image-preview__img" />
          <div className="admin-image-preview__overlay">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="admin-btn admin-btn--sm admin-btn--secondary"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="admin-btn admin-btn--sm admin-btn--danger"
              disabled={uploading}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`admin-image-dropzone ${uploading ? 'admin-image-dropzone--uploading' : ''}`}
        >
          {uploading ? (
            <div className="admin-image-dropzone__loading">
              <span className="admin-spinner" />
              <span>Uploading to Cloudinary...</span>
            </div>
          ) : (
            <div className="admin-image-dropzone__content">
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
              <p className="admin-image-dropzone__text">Click to choose image or drag & drop</p>
              {helperText && <p className="admin-image-dropzone__subtext">{helperText}</p>}
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

      {error && <p className="admin-error-text">{error}</p>}
    </div>
  );
}
