import { Request, Response } from 'express';
import { TemplateModel } from '../types';

export const mockTemplates = new Map<string, TemplateModel>();

// Seed default templates
const tmpl1: TemplateModel = {
  id: 'tmpl-diverging-paths',
  name: 'Two Diverging Paths',
  slug: 'two-diverging-paths',
  imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop',
  width: 600,
  height: 600,
  category: 'Decisions',
  defaultBoxCount: 2,
  usageCount: 1540,
  createdAt: new Date().toISOString()
};

const tmpl2: TemplateModel = {
  id: 'tmpl-eureka-moment',
  name: 'Eureka Breakthrough',
  slug: 'eureka-breakthrough',
  imageUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=600&fit=crop',
  width: 600,
  height: 600,
  category: 'Reactions',
  defaultBoxCount: 2,
  usageCount: 2310,
  createdAt: new Date().toISOString()
};

const tmpl3: TemplateModel = {
  id: 'tmpl-unshakable-optimism',
  name: 'Unshakable Optimism',
  slug: 'unshakable-optimism',
  imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&fit=crop',
  width: 600,
  height: 600,
  category: 'Classic',
  defaultBoxCount: 2,
  usageCount: 980,
  createdAt: new Date().toISOString()
};

mockTemplates.set(tmpl1.id, tmpl1);
mockTemplates.set(tmpl2.id, tmpl2);
mockTemplates.set(tmpl3.id, tmpl3);

export class TemplateController {
  public async getTemplates(req: Request, res: Response) {
    const { category, search } = req.query;
    let list = Array.from(mockTemplates.values());

    if (category && typeof category === 'string') {
      list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }

    return res.status(200).json({ templates: list, total: list.length });
  }

  public async getTemplateById(req: Request, res: Response) {
    const { id } = req.params;
    let template = mockTemplates.get(id as string);

    if (!template) {
      for (const t of mockTemplates.values()) {
        if (t.slug === id) {
          template = t;
          break;
        }
      }
    }

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.status(200).json({ template });
  }
}
