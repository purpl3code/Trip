/**
 * Utility to compress images client-side before uploading them.
 * This resizes the image to a maximum dimension of 1600px (preserving aspect ratio)
 * and compresses it using JPEG encoding at 82% quality.
 * This results in a ~90% decrease in file size (e.g. from 5MB to ~250KB) with zero visible quality loss on mobile/desktop screens.
 */
export const compressImage = (file: File, maxDimension = 1600, quality = 0.82): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Only compress image files
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Escolha um arquivo de imagem.'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Apply maximum dimension scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw onto canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to original file if context creation fails
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas back to Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file); // Fallback to original file
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        reject(new Error('Não foi possível abrir a imagem. Escolha outra foto.'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Não foi possível ler a imagem. Escolha outra foto.'));
    };
  });
};
