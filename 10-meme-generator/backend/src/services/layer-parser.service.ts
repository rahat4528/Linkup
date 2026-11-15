import { MemeLayer } from '../types';

export class LayerParserService {
  /**
   * Validates layer array against dimension bounds and cleans text input
   */
  public sanitizeAndValidateLayers(
    layers: any[],
    canvasWidth: number = 600,
    canvasHeight: number = 600
  ): { valid: boolean; layers: MemeLayer[]; error?: string } {
    if (!Array.isArray(layers)) {
      return { valid: false, layers: [], error: 'Layers must be an array' };
    }

    const sanitized: MemeLayer[] = [];

    for (let i = 0; i < layers.length; i++) {
      const l = layers[i];

      if (!l.type || (l.type !== 'text' && l.type !== 'image' && l.type !== 'sticker')) {
        return { valid: false, layers: [], error: `Layer ${i + 1} has invalid type` };
      }

      const x = typeof l.x === 'number' ? Math.max(0, Math.min(l.x, canvasWidth)) : canvasWidth / 2;
      const y = typeof l.y === 'number' ? Math.max(0, Math.min(l.y, canvasHeight)) : 50;
      const fontSize = typeof l.fontSize === 'number' ? Math.max(12, Math.min(l.fontSize, 120)) : 36;
      const strokeWidth = typeof l.strokeWidth === 'number' ? Math.max(0, Math.min(l.strokeWidth, 20)) : 4;

      // Sanitize text
      let text = '';
      if (l.type === 'text') {
        text = String(l.text || '')
          .replace(/<[^>]*>/g, '') // Strip HTML tags
          .slice(0, 300); // Limit length
      }

      sanitized.push({
        id: l.id || `layer-${Date.now()}-${i}`,
        type: l.type,
        text,
        x,
        y,
        fontSize,
        fontFamily: l.fontFamily || 'Impact',
        color: l.color || '#ffffff',
        strokeColor: l.strokeColor || '#000000',
        strokeWidth,
        align: l.align === 'left' || l.align === 'right' ? l.align : 'center',
        uppercase: l.uppercase !== false,
        imageUrl: l.imageUrl
      });
    }

    return { valid: true, layers: sanitized };
  }
}
