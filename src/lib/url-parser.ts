export interface ParsedUrlData {
  images: string[];
  sizes: string[] | null;
  productRef: string | null;
  price: number | null;
}

export function parseDataFromUrl(urlString: string): ParsedUrlData {
  let params: URLSearchParams;

  if (urlString.startsWith('?')) {
    params = new URLSearchParams(urlString);
  } else if (urlString.includes('?')) {
    try {
      const u = new URL(urlString);
      params = u.searchParams;
    } catch {
      const split = urlString.split('?');
      params = new URLSearchParams(split[1]);
    }
  } else {
    return { images: [], sizes: null, productRef: null, price: null };
  }

  let productRef = null;
  const productParam = params.get('product');
  if (productParam) {
    let clean = productParam.trim();
    if (clean.includes('%3A') || clean.includes('%2F')) {
      try { clean = decodeURIComponent(clean); } catch { /* ignore */ }
    }
    productRef = clean;
  }

  const sizesParam = params.get('sizes');
  let sizes = null;
  if (sizesParam) {
    const parsed = sizesParam.split(',').map(s => s.trim()).filter(Boolean);
    if (parsed.length > 0) sizes = parsed;
  }

  const imagesParam = params.get('images');
  let images: string[] = [];
  if (imagesParam) {
    images = imagesParam.split(',').map(img => {
      let clean = img.trim();
      if (clean.includes('%3A') || clean.includes('%2F')) {
        try { clean = decodeURIComponent(clean); } catch { /* ignore */ }
      }
      if (clean.startsWith('//')) {
        clean = 'https:' + clean;
      }
      return clean;
    }).filter(Boolean);
  }

  const priceParam = params.get('price');
  let price: number | null = null;
  if (priceParam) {
    const parsed = parseFloat(priceParam.replace(',', '.'));
    if (!isNaN(parsed)) price = parsed;
  }

  return { images, sizes, productRef, price };
}
