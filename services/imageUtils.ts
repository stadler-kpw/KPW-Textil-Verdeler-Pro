/**
 * Simulates removing a white background using Canvas pixel manipulation.
 * Real-world apps might use a server-side AI model or WebGL.
 */
export const removeWhiteBackground = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No context');

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Threshold for "white"
      const threshold = 240;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // If pixel is near white, make it transparent
        if (r > threshold && g > threshold && b > threshold) {
          data[i + 3] = 0; // Alpha
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(e);
  });
};

/**
 * Extrahiert Bilder DIREKT aus den URL-Parametern, 
 * anstatt die Seite erneut zu scrapen (verhindert CORS/530 Errors).
 */
export const extractShopifyImage = async (currentBrowserUrl: string): Promise<string[]> => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const imagesParam = urlParams.get('images');

    if (!imagesParam) {
      console.warn("Keine Bilder im URL-Parameter gefunden.");
      return [];
    }

    // Trenne den kommagetrennten String wieder in ein Array auf
    const images = imagesParam.split(',').map(img => {
        let clean = img.trim();
         // Safety decode if still encoded
        if (clean.includes('%3A') || clean.includes('%2F')) {
             try { clean = decodeURIComponent(clean); } catch(e) {}
        }
        // Protocol fix
        if (clean.startsWith('//')) {
          clean = 'https:' + clean;
        }
        return clean;
    }).filter(Boolean);

    console.log("Erfolgreich extrahierte Bilder aus Parametern:", images);
    return images;
  } catch (error) {
    console.error("Fehler beim Lesen der URL-Parameter:", error);
    return [];
  }
};