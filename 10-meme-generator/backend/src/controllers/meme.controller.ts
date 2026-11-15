import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { MemeModel } from '../types';
import { LayerParserService } from '../services/layer-parser.service';
import { mockTemplates } from './template.controller';

export const mockMemes = new Map<string, MemeModel>();
const layerParser = new LayerParserService();

// Seed initial meme
const initialMeme: MemeModel = {
  id: 'meme-friday-deploy',
  title: 'Deploying on Friday Evening',
  templateId: 'tmpl-diverging-paths',
  creatorId: 'user-memelord',
  imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop',
  layers: [
    {
      id: 'text-top',
      type: 'text',
      text: 'WRITE TESTS BEFORE DEPLOYING',
      x: 300,
      y: 60,
      fontSize: 32,
      fontFamily: 'Impact',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      align: 'center'
    },
    {
      id: 'text-bottom',
      type: 'text',
      text: 'PUSH DIRECTLY TO PRODUCTION',
      x: 300,
      y: 520,
      fontSize: 32,
      fontFamily: 'Impact',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      align: 'center'
    }
  ],
  isPublic: true,
  upvotes: 84,
  createdAt: new Date().toISOString()
};
mockMemes.set(initialMeme.id, initialMeme);

export class MemeController {
  public async getMemes(req: Request, res: Response) {
    const list = Array.from(mockMemes.values()).filter((m) => m.isPublic);
    return res.status(200).json({ memes: list, total: list.length });
  }

  public async getMemeById(req: Request, res: Response) {
    const { id } = req.params;
    const meme = mockMemes.get(id as string);

    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    return res.status(200).json({ meme });
  }

  public async createMeme(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, templateId, layers, isPublic } = req.body;

      if (!title || !templateId || !layers) {
        return res.status(400).json({ error: 'title, templateId, and layers are required' });
      }

      const template = mockTemplates.get(templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const validation = layerParser.sanitizeAndValidateLayers(layers, template.width, template.height);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const id = `meme-${Date.now()}`;
      const newMeme: MemeModel = {
        id,
        title,
        templateId,
        creatorId: req.user?.id || 'anonymous',
        imageUrl: template.imageUrl,
        layers: validation.layers,
        isPublic: isPublic !== false,
        upvotes: 0,
        createdAt: new Date().toISOString()
      };

      mockMemes.set(id, newMeme);
      template.usageCount += 1;

      return res.status(201).json({ meme: newMeme });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to create meme', details: err.message });
    }
  }

  public async upvoteMeme(req: Request, res: Response) {
    const { id } = req.params;
    const meme = mockMemes.get(id as string);

    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    meme.upvotes += 1;
    return res.status(200).json({ id: meme.id, upvotes: meme.upvotes });
  }
}
