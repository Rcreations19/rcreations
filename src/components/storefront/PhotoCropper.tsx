'use client';

import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

interface PhotoCropperProps {
  imageSrc: string;
  onCropComplete: (croppedUrl: string, newAspect: number) => void;
  onCancel: () => void;
}

function defaultCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      mediaWidth / mediaHeight, // default to image aspect
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function PhotoCropper({ imageSrc, onCropComplete, onCancel }: PhotoCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(defaultCrop(width, height));
  };

  const handleSave = async () => {
    if (completedCrop && imgRef.current) {
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          imgRef.current,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY
        );

        const base64Image = canvas.toDataURL('image/jpeg', 0.95);
        const newAspect = completedCrop.width / completedCrop.height;
        onCropComplete(base64Image, newAspect);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0e27] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#050714]">
          <h3 className="text-white font-bold text-sm tracking-wider uppercase font-mono">Adjust Photo</h3>
          <button onClick={onCancel} className="text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 flex items-center justify-center bg-[#0a0e27] min-h-[400px] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-[60vh]"
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imageSrc}
              onLoad={onImageLoad}
              className="max-h-[60vh] w-auto object-contain"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#050714] flex justify-end gap-4">
          <button onClick={onCancel} className="px-6 py-3.5 sm:py-2.5 rounded-full text-sm sm:text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} className="px-8 py-3.5 sm:py-2.5 bg-[#2aabb0] text-[#0a0e27] rounded-full text-sm sm:text-xs font-bold uppercase tracking-wider hover:bg-[#38C8CC] transition-all flex items-center gap-2">
            <Check className="w-4 h-4" /> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
