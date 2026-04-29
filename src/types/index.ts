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
  | 'Indie Flower';

export interface HandwritingOptions {
  pagesText: string[]; // Text content for each page
  currentPage: number;
  style: HandwritingStyle;
  inkColor: InkColor;
  pageType: PageType;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  jitter: number;
}
