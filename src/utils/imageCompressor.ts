/**
 * Compresses an image file on the client-side using HTML5 Canvas.
 * Efficiently converts heavy phone camera photos (5MB - 15MB) into a crisp,
 * lightweight JPEG (~80KB - 160KB) that renders instantly and persists reliably.
 */
export interface CompressionResult {
  dataUrl: string;
  approxSizeKb: number;
  width: number;
  height: number;
}

export const compressImageFile = (
  file: File,
  maxDimension = 1100,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan gambar valid.'));
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const srcResult = event.target?.result as string;
      if (!srcResult) {
        return reject(new Error('Gagal membaca berkas gambar.'));
      }

      const img = new Image();

      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down proportionally if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) {
            resolve(srcResult);
            return;
          }

          // Fill white background in case of transparent PNG/WebP converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image with smooth bilinear scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert to optimized JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // If canvas operations fail (e.g. security origin), fallback to original dataUrl
          resolve(srcResult);
        }
      };

      img.onerror = () => {
        // Fallback to original read result if image decoding fails
        resolve(srcResult);
      };

      img.src = srcResult;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Calculates approximate size in kilobytes of a data URL or image string
 */
export function estimateDataUrlSizeKb(dataUrl?: string): number {
  if (!dataUrl) return 0;
  if (!dataUrl.startsWith('data:')) {
    return 0; // Not a base64 string
  }
  const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
  const sizeInBytes = Math.round((base64Length * 3) / 4);
  return Math.round(sizeInBytes / 1024);
}
