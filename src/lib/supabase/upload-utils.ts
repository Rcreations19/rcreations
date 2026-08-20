const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

const SIZE_LIMITS = {
  product: 5 * 1024 * 1024,   // 5 MB
  blog: 5 * 1024 * 1024,      // 5 MB
  avatar: 2 * 1024 * 1024,    // 2 MB
} as const;

export type UploadContext = keyof typeof SIZE_LIMITS;

export function validateImageFile(file: File, context: UploadContext = 'product'): { valid: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { valid: false, error: 'No file provided.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Invalid file type ".${ext}". Allowed: JPG, PNG, WebP, AVIF.` };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file format "${file.type}". Allowed: JPG, PNG, WebP, AVIF.` };
  }

  const maxSize = SIZE_LIMITS[context];
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `File too large (${fileMB} MB). Maximum is ${maxMB} MB.` };
  }

  return { valid: true };
}

export function generateUploadPath(context: UploadContext, fileExt: string): string {
  const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const dir = context === 'blog' ? 'blogs' : context === 'avatar' ? 'avatars' : 'products';
  return `${dir}/${uuid}.${fileExt}`;
}

const MAX_DIMENSION = 2400;

export async function resizeImageIfNecessary(file: File): Promise<File> {
  if (typeof Image === 'undefined') return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ratio = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);

      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
        },
        file.type,
        0.85
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
