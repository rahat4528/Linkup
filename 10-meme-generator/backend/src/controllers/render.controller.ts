import { Request, Response } from 'express';
import { CompositorService } from '../services/compositor.service';
import { LayerParserService } from '../services/layer-parser.service';
import { mockTemplates } from './template.controller';
import { mockMemes } from './meme.controller';

const compositor = new CompositorService();
const layerParser = new LayerParserService();

export class RenderController {
  public async renderMemeSvg(req: Request, res: Response) {
    try {
      const { templateId, width, height, baseImageUrl, layers } = req.body;

      let w = width || 600;
      let h = height || 600;
      let bg = baseImageUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop';

      if (templateId) {
        const tmpl = mockTemplates.get(templateId);
        if (tmpl) {
          w = tmpl.width;
          h = tmpl.height;
          bg = tmpl.imageUrl;
        }
      }

      const validation = layerParser.sanitizeAndValidateLayers(layers || [], w, h);
      const svg = compositor.compositeToSvg(w, h, bg, validation.layers);

      res.setHeader('Content-Type', 'image/svg+xml');
      return res.status(200).send(svg);
    } catch (err: any) {
      return res.status(500).json({ error: 'Server-side rendering failed', details: err.message });
    }
  }

  public async renderSavedMeme(req: Request, res: Response) {
    const { id } = req.params;
    const meme = mockMemes.get(id as string);

    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    const template = mockTemplates.get(meme.templateId);
    const w = template?.width || 600;
    const h = template?.height || 600;
    const bg = template?.imageUrl || meme.imageUrl;

    const svg = compositor.compositeToSvg(w, h, bg, meme.layers);

    res.setHeader('Content-Type', 'image/svg+xml');
    return res.status(200).send(svg);
  }
}
