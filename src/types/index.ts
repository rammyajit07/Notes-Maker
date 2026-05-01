export type InkColor = 'blue' | 'black';
export type PageType = 'ruled' | 'plain';
export type HandwritingStyle = 
  | 'Homemade Apple' 
  | 'Caveat' 
  | 'Shadows Into Light' 
  | 'Dancing Script' 
  | 'Pacifico' 
  | 'Reenie Beanie' 
  | 'Nothing You Could Do' 
  | 'Just Me Again Down Here' 
  | 'Gochi Hand' 
  | 'Gloria Hallelujah' 
  | 'Indie Flower'
  | 'Kalam'
  | 'Zeyada'
  | 'Patrick Hand'
  | 'Architects Daughter'
  | 'Neucha'
  | 'Times New Roman'
  | 'Arial';

export interface ImageItem {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  jitter?: number;
}

export interface HandwritingOptions {
  pagesText: string[]; // Text content for each page
  pageBlocks?: Record<number, TextBlock[]>; // Additional text blocks
  pageImages: Record<number, ImageItem[]>; // Images for each page
  currentPage: number;
  style: HandwritingStyle;
  inkColor: InkColor;
  pageType: PageType;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  jitter: number;
  showBorder: boolean;
  borderWidth: number;
  startX: number;
  startY: number;
}
