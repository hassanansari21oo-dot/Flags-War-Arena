// Cache pre-rendered flag canvases for 60fps mobile performance
const canvasCache = new Map<string, HTMLCanvasElement>();
const imgCache = new Map<string, HTMLImageElement>();

export function getFlagImage(countryCode: string): HTMLImageElement | null {
  const code = countryCode.toLowerCase();
  if (imgCache.has(code)) {
    const img = imgCache.get(code)!;
    return img.complete && img.naturalWidth > 0 ? img : null;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `https://flagcdn.com/w160/${code}.png`;
  imgCache.set(code, img);

  img.onload = () => {
    // Invalidate cached canvas to re-render with the high-res crisp flag photo
    canvasCache.delete(countryCode);
  };

  return null;
}

// Generate or retrieve cached circular flag avatar
export function getCircularFlagCanvas(
  code: string,
  flagEmoji: string,
  diameter: number = 44
): HTMLCanvasElement {
  const cacheKey = `${code}_${diameter}`;
  if (canvasCache.has(cacheKey)) {
    return canvasCache.get(cacheKey)!;
  }

  const offscreen = document.createElement('canvas');
  // 2x supersampling for ultra sharp rendering on retina displays
  const scale = 2;
  offscreen.width = diameter * scale;
  offscreen.height = diameter * scale;
  const ctx = offscreen.getContext('2d');

  if (!ctx) return offscreen;

  ctx.scale(scale, scale);
  const r = diameter / 2;

  // 1. Clip path to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(r, r, r - 1, 0, Math.PI * 2);
  ctx.clip();

  // 2. Try drawing image if loaded
  const img = getFlagImage(code);
  if (img) {
    // Fill background neutral first
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, diameter, diameter);

    // Cover crop the image into the circle
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW = diameter;
    let drawH = diameter;
    let dx = 0;
    let dy = 0;

    if (aspect > 1) {
      drawW = diameter * aspect;
      dx = -(drawW - diameter) / 2;
    } else {
      drawH = diameter / aspect;
      dy = -(drawH - diameter) / 2;
    }

    ctx.drawImage(img, dx, dy, drawW, drawH);
  } else {
    // Fallback: Vibrant stylized circular flag badge with flag emoji + country code
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, diameter, diameter);

    // Soft gradient base
    const grad = ctx.createLinearGradient(0, 0, diameter, diameter);
    grad.addColorStop(0, '#334155');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, diameter, diameter);

    // Draw Flag Emoji centered
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.floor(diameter * 0.58)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.fillText(flagEmoji, r, r);
  }

  // 3. Inner glassy specular highlight (top half sheen)
  const sheenGrad = ctx.createLinearGradient(0, 0, 0, diameter * 0.6);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.ellipse(r, r * 0.42, r * 0.72, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 4. Outer rim outline for high contrast on dark arena
  ctx.save();
  ctx.beginPath();
  ctx.arc(r, r, r - 1.2, 0, Math.PI * 2);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.stroke();

  // Subtle dark edge ring
  ctx.beginPath();
  ctx.arc(r, r, r - 0.2, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.stroke();
  ctx.restore();

  canvasCache.set(cacheKey, offscreen);
  return offscreen;
}
