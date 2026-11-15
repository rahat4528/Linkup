import { LayerParserService } from '../../src/services/layer-parser.service';

describe('LayerParserService - Schema Validation & Input Sanitization', () => {
  let parser: LayerParserService;

  beforeEach(() => {
    parser = new LayerParserService();
  });

  it('should validate and clamp coordinates within canvas boundaries', () => {
    const raw = [
      { type: 'text', text: 'Hello', x: 9999, y: -500, fontSize: 300 }
    ];

    const result = parser.sanitizeAndValidateLayers(raw, 600, 600);
    expect(result.valid).toBe(true);
    expect(result.layers[0].x).toBe(600);
    expect(result.layers[0].y).toBe(0);
    expect(result.layers[0].fontSize).toBe(120); // Clamped to max 120
  });

  it('should strip malicious HTML tags from text input', () => {
    const raw = [
      { type: 'text', text: 'Safe <script>malicious()</script> Text', x: 300, y: 100 }
    ];

    const result = parser.sanitizeAndValidateLayers(raw, 600, 600);
    expect(result.valid).toBe(true);
    expect(result.layers[0].text).toBe('Safe malicious() Text');
  });

  it('should reject invalid layer types', () => {
    const raw = [
      { type: 'unsupported-plugin-type', text: 'Boom' }
    ];

    const result = parser.sanitizeAndValidateLayers(raw, 600, 600);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalid type');
  });
});
