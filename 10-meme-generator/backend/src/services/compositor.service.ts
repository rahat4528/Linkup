import { MemeLayer } from '../types';

export class CompositorService {
  public escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generates a standalone SVG composite representation of the meme
   */
  public compositeToSvg(
    width: number,
    height: number,
    baseImageUrl: string,
    layers: MemeLayer[]
  ): string {
    const textLayersXml = layers
      .filter((layer) => layer.type === 'text' && layer.text)
      .map((layer) => {
        const textContent = layer.uppercase !== false ? (layer.text || '').toUpperCase() : layer.text || '';
        const escapedText = this.escapeXml(textContent);
        const fontSize = layer.fontSize || 36;
        const fontFamily = layer.fontFamily || 'Impact, Arial, sans-serif';
        const fill = layer.color || '#ffffff';
        const stroke = layer.strokeColor || '#000000';
        const strokeWidth = layer.strokeWidth !== undefined ? layer.strokeWidth : 4;
        const textAnchor = layer.align === 'center' ? 'middle' : layer.align === 'right' ? 'end' : 'start';

        return `    <text
      x="${layer.x}"
      y="${layer.y}"
      font-family="${fontFamily}"
      font-size="${fontSize}px"
      font-weight="bold"
      fill="${fill}"
      stroke="${stroke}"
      stroke-width="${strokeWidth}"
      stroke-linejoin="round"
      text-anchor="${textAnchor}"
      paint-order="stroke fill"
      style="user-select: none;"
    >${escapedText}</text>`;
      })
      .join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      text {
        font-family: Impact, "Arial Black", sans-serif;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      }
    </style>
  </defs>
  <!-- Base Background -->
  <rect width="100%" height="100%" fill="#1a1a24" />
  <image href="${this.escapeXml(baseImageUrl)}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />

  <!-- Rendered Meme Layers -->
${textLayersXml}
</svg>`;
  }
}
