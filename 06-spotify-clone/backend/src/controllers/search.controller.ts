import { Request, Response } from 'express';
import { CatalogService } from '../services/catalog.service';

export class SearchController {
  public static async search(req: Request, res: Response): Promise<void> {
    try {
      const query = ((req.query.q as string) || '').trim();
      const results = CatalogService.search(query);
      res.status(200).json({ query, results });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({ categories: CatalogService.CATEGORIES });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
