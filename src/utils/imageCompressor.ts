/**
 * Utility to compress and resize image files to data URLs (Base64)
 * before persisting to local storage or memory DB to prevent storage overflow.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving resize
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created.'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP or JPEG Data URL
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch {
          const dataUrlFallback = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrlFallback);
        }
      };

      img.onerror = () => {
        reject(new Error('Falha ao processar arquivo de imagem.'));
      };

      if (readerEvent.target?.result) {
        img.src = readerEvent.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Falha ao ler o arquivo de imagem do dispositivo.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image and embeds a diagonal semi-transparent watermark text
 * (e.g. "PRÉVIA - APROVAÇÃO • STUDIO") to prevent unauthorized reproduction.
 */
export async function compressImageFileWithWatermark(
  file: File,
  watermarkText = 'PRÉVIA • APROVAÇÃO',
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created.'));
          return;
        }

        // Draw base image
        ctx.drawImage(img, 0, 0, width, height);

        // Add Watermark Overlay Pattern
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 5); // Diagonal 36°

        // Font calculation based on resolution
        const fontSize = Math.max(22, Math.round(width / 18));
        ctx.font = `900 ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw multiple repeated watermark lines
        const stepY = fontSize * 3.2;
        const stepX = fontSize * 7.5;
        const extent = Math.max(width, height) * 1.5;

        for (let y = -extent; y <= extent; y += stepY) {
          for (let x = -extent; x <= extent; x += stepX) {
            // Drop shadow for contrast on both light and dark photos
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
            ctx.fillText(watermarkText, x, y);

            // Subtle border outline
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.strokeText(watermarkText, x, y);
          }
        }

        ctx.restore();

        // Convert to WebP / JPEG
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch {
          const dataUrlFallback = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrlFallback);
        }
      };

      img.onerror = () => {
        reject(new Error('Falha ao processar arquivo de imagem com marca d\'água.'));
      };

      if (readerEvent.target?.result) {
        img.src = readerEvent.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Falha ao ler o arquivo de imagem do dispositivo.'));
    };

    reader.readAsDataURL(file);
  });
}
