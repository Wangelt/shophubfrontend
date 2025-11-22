'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadSingleImage } from '@/services/adminservices';

const ImageUpload = ({ onUploadSuccess, folder = 'ecommerce', currentImage = null }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP, SVG, BMP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploading(true);
      console.log('Starting upload:', file.name, file.type, file.size);
      const response = await uploadSingleImage(file, folder);
      console.log('Upload response:', response);
      
      if (response.success && response.data.image) {
        console.log('Image uploaded successfully:', response.data.image);
        onUploadSuccess(response.data.image);
        alert('Image uploaded successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error details:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      alert(`Upload failed: ${errorMessage}`);
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadSuccess(null);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
          />
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Change Image'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleButtonClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="space-y-2">
            <div className="text-4xl">📷</div>
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload an image'}
            </p>
            <p className="text-xs text-gray-400">JPG, PNG, GIF, WebP, SVG up to 5MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

