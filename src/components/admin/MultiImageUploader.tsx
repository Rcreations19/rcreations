'use client';

import React, { useState, useRef } from 'react';
import { uploadProductImage } from '@/lib/supabase/storage';
import { validateImageFile } from '@/lib/supabase/upload-utils';
import { X, UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function MultiImageUploader({ images, onChange, maxImages = 10 }: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images in total.`);
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateImageFile(file, 'product');
        if (!validation.valid) {
          alert(validation.error);
          continue;
        }
        
        const url = await uploadProductImage(file, 'product');
        newUrls.push(url);
      }
      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
    } catch (err) {
      alert('Failed to upload some images. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  // The first image is always considered the "primary" image
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((url, idx) => {
          const imgSrc = url.startsWith('http') || url.startsWith('/') ? url : `/products/${url}`;
          return (
            <div key={url} className="relative group aspect-square bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden">
              <Image src={imgSrc} alt={`Product view ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
              <button
                type="button"
                onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            {idx === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-[#10164A]/80 text-white text-[10px] uppercase font-bold text-center py-1">
                Primary
              </div>
            )}
          </div>
          );
        })}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex flex-col items-center justify-center gap-2 aspect-square bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 hover:border-[#10164A] hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-neutral-400" />
                <span className="text-xs font-bold text-neutral-500 text-center px-2">Upload Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        multiple
        className="hidden"
      />
      
      <p className="text-[10px] text-neutral-500">
        You can upload up to {maxImages} images. The first image will be used as the primary thumbnail. We automatically compress images before upload to save bandwidth.
      </p>
    </div>
  );
}
