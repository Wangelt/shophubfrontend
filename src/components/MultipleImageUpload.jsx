'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadMultipleImages } from '@/services/adminservices';

const MultipleImageUpload = ({ onUploadSuccess, folder = 'ecommerce', currentImages = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState(currentImages || []);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert('Please select only valid image files (JPG, PNG, GIF, WebP, SVG, BMP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Each image should be less than 5MB');
        return;
      }
    }

    // Show previews
    const newPreviews = [];
    for (const file of files) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    // Upload to server
    try {
      setUploading(true);
      const response = await uploadMultipleImages(files, folder);
      
      if (response.success && response.data.images) {
        const uploadedUrls = response.data.images.map(img => img.url);
        const allImages = [...previews, ...uploadedUrls];
        setPreviews(allImages);
        onUploadSuccess(allImages);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onUploadSuccess(newPreviews);
  };

  const handleRemoveAll = () => {
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadSuccess([]);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Add More Images'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveAll}
              disabled={uploading}
            >
              Remove All
            </Button>
          </div>
        </div>
      )}

      {previews.length === 0 && (
        <div
          onClick={handleButtonClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="space-y-2">
            <div className="text-4xl">📷</div>
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload images'}
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG, GIF, WebP, SVG up to 5MB each (Multiple files supported)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;

