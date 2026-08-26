'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface DownloadPhotoButtonProps {
  signedUrl: string;
  filename?: string;
}

export function DownloadPhotoButton({ signedUrl, filename = 'customer-photo.jpg' }: DownloadPhotoButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download photo. The link may have expired — please refresh the page.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0070f3] hover:text-[#0051a8] bg-[#0070f3]/5 hover:bg-[#0070f3]/10 px-2 py-1 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {downloading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {downloading ? 'Downloading...' : 'Download Customer Photo'}
    </button>
  );
}
