import { CompositorService } from '../../src/services/compositor.service';
import { MemeLayer } from '../../src/types';

describe('CompositorService - Server-Side Meme SVG Rendering', () => {
  let compositor: CompositorService;

  beforeEach(() => {
    compositor = new CompositorService();
  });

  it('should generate SVG with background image and text layers', () => {
    const layers: MemeLayer[] = [
      {
        id: 'top',
        type: 'text',
        text: 'TOP TEXT HERE',
        x: 300,
        y: 60,
        fontSize: 36,
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 4,
        align: 'center'
      }
    ];

    const svg = compositor.compositeToSvg(600, 600, 'https://example.com/bg.jpg', layers);

    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"');
    expect(svg).toContain('<image href="https://example.com/bg.jpg"');
    expect(svg).toContain('TOP TEXT HERE');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain('stroke="#000000"');
    expect(svg).toContain('paint-order="stroke fill"');
  });

  it('should convert text to uppercase by default', () => {
    const layers: MemeLayer[] = [
      {
        id: 'top',
        type: 'text',
        text: 'lowercase text',
        x: 300,
        y: 60
      }
    ];

    const svg = compositor.compositeToSvg(600, 600, 'https://example.com/bg.jpg', layers);
    expect(svg).toContain('LOWERCASE TEXT');
  });

  it('should escape XML entities to prevent SVG injection', () => {
    const layers: MemeLayer[] = [
      {
        id: 'top',
        type: 'text',
        text: '<script>alert(1)</script> & "quotes"',
        x: 300,
        y: 60
      }
    ];

    const svg = compositor.compositeToSvg(600, 600, 'https://example.com/bg.jpg', layers);
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;SCRIPT&gt;ALERT(1)&lt;/SCRIPT&gt; &amp; &quot;QUOTES&quot;');
  });
});
