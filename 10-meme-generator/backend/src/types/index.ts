export type LayerType = 'text' | 'image' | 'sticker';

export interface MemeLayer {
  id: string;
  type: LayerType;
  text?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
  rotation?: number;
  imageUrl?: string;
}

export interface TemplateModel {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  width: number;
  height: number;
  category: string;
  defaultBoxCount: number;
  usageCount: number;
  createdAt: string;
}

export interface MemeModel {
  id: string;
  title: string;
  templateId: string;
  creatorId?: string;
  imageUrl: string;
  layers: MemeLayer[];
  isPublic: boolean;
  upvotes: number;
  createdAt: string;
}
