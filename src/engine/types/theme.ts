export type PageSize = 'letter' | 'a4' | 'custom';
export type Orientation = 'portrait' | 'landscape';
export type Alignment = 'left' | 'center' | 'right';
export type TextTransform = 'none' | 'uppercase' | 'capitalize';
export type HrStyle = 'solid' | 'dashed' | 'dotted' | 'decorative';
export type TableBorderStyle = 'bordered' | 'striped' | 'minimal';
export type TableLayout = 'auto' | 'fixed';
export type OrderedListStyle = 'decimal' | 'hierarchical' | 'alpha' | 'roman';
export type UnorderedListStyle = 'disc' | 'circle' | 'square' | 'dash' | 'custom';
export type ImageShadow = 'none' | 'sm' | 'md' | 'lg';
export type CaptionPosition = 'above' | 'below';
export type CaptionFontStyle = 'normal' | 'italic';
export type TocStyle = 'dotted-leaders' | 'simple' | 'indented';
export type HeadingNumbering = 'none' | 'decimal' | 'legal' | 'roman';
export type PageNumberPosition = 'bottom-center' | 'bottom-right' | 'top-right';
export type PageNumberFormat = '1' | 'i' | 'Page 1 of N';
export type CoverPageLayout = 'centered' | 'left-aligned' | 'full-image';
export type HeadingDecoration = 'underline' | 'background' | 'left-bar' | 'pill' | 'plain' | 'overline';
export type QuoteDecoration = 'border-left' | 'background' | 'quote-marks' | 'indented';
export type ContentDensity = 'compact' | 'normal' | 'airy';
export type LinkDecoration = 'underline' | 'dotted' | 'none' | 'hover-only';
export type ParagraphAlign = 'left' | 'justify';
export type BackgroundMode = 'solid' | 'gradient' | 'texture';
export type GradientDirection = 'to bottom' | 'to top' | 'to right' | 'to left'
  | 'to bottom right' | 'to bottom left' | 'to top right' | 'to top left';
export type TexturePreset = 'paper' | 'dots' | 'grid' | 'linen' | 'noise' | 'lines';

export interface PageConfig {
  size: PageSize;
  orientation: Orientation;
  margins: { top: string; right: string; bottom: string; left: string };
  background: string;
  maxWidth: string;
  backgroundMode?: BackgroundMode;
  gradientColor2?: string;
  gradientDirection?: GradientDirection;
  texturePreset?: TexturePreset;
  textureOpacity?: number;
}

export interface TypographyConfig {
  baseFontFamily: string;
  baseFontSize: string;
  baseLineHeight: string;
  baseColor: string;
  contentDensity?: ContentDensity;
}

export interface HeadingStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  alignment: Alignment;
  marginTop: string;
  marginBottom: string;
  borderBottom: string;
  paddingBottom: string;
  pageBreakBefore: boolean;
  textTransform: TextTransform;
  headingStyle?: HeadingDecoration;
  letterSpacing?: string;
  headingBorderColor?: string;
}

export interface ParagraphStyle {
  fontSize: string;
  lineHeight: string;
  marginBottom: string;
  firstLineIndent: string;
  color: string;
  dropCap?: boolean;
  textAlign?: ParagraphAlign;
}

export interface BlockquoteStyle {
  borderLeft: string;
  background: string;
  padding: string;
  fontStyle: string;
  marginBottom: string;
  quoteStyle?: QuoteDecoration;
}

export interface CodeInlineStyle {
  fontFamily: string;
  fontSize: string;
  background: string;
  padding: string;
  borderRadius: string;
  color: string;
}

export interface CodeBlockStyle {
  fontFamily: string;
  fontSize: string;
  background: string;
  color: string;
  padding: string;
  borderRadius: string;
  lineNumbers: boolean;
  accentBar?: boolean;
  accentBarColor?: string;
  border?: string;
}

export interface ImageStyle {
  maxWidth: string;
  alignment: Alignment;
  borderRadius: string;
  shadow: ImageShadow;
  captionFontSize: string;
  captionColor: string;
  captionAlign?: Alignment;
  captionPosition?: CaptionPosition;
  captionFontStyle?: CaptionFontStyle;
}

export interface TableStyle {
  borderStyle: TableBorderStyle;
  headerBackground: string;
  headerFontWeight: string;
  cellPadding: string;
  fontSize: string;
  tableLayout?: TableLayout;
}

export interface LinkStyle {
  color: string;
  underline: boolean;
  hoverColor: string;
  linkStyle?: LinkDecoration;
}

export interface HrStyleConfig {
  style: HrStyle;
  color: string;
  width: string;
  thickness: string;
  margin: string;
}

export interface OrderedListStyleConfig {
  style: OrderedListStyle;
  indentPerLevel: string;
  itemSpacing: string;
  listMarkerColor?: string;
}

export interface UnorderedListStyleConfig {
  style: UnorderedListStyle;
  customBullet: string;
  indentPerLevel: string;
  itemSpacing: string;
  listMarkerColor?: string;
}

export interface MermaidStyle {
  background: string;
  fontSize: string;
  fontFamily?: string;
  lineColor: string;
  nodeColor: string;
  secondaryColor?: string;
  primaryBorderColor?: string;
  textColor: string;
  edgeLabelBackground?: string;
  noteBkgColor?: string;
  noteTextColor?: string;
  borderRadius: string;
}

export interface ElementStyles {
  h1: HeadingStyle;
  h2: HeadingStyle;
  h3: HeadingStyle;
  h4: HeadingStyle;
  h5: HeadingStyle;
  h6: HeadingStyle;
  paragraph: ParagraphStyle;
  blockquote: BlockquoteStyle;
  code_inline: CodeInlineStyle;
  code_block: CodeBlockStyle;
  image: ImageStyle;
  table: TableStyle;
  link: LinkStyle;
  hr: HrStyleConfig;
  list_ordered: OrderedListStyleConfig;
  list_unordered: UnorderedListStyleConfig;
  mermaid?: MermaidStyle;
}

export interface TocConfig {
  enabled: boolean;
  depth: number;
  title: string;
  style: TocStyle;
  numbering?: HeadingNumbering;
  indentSize?: number;
}

export interface PageNumberConfig {
  enabled: boolean;
  position: PageNumberPosition;
  format: PageNumberFormat;
  startFrom: number;
}

export interface HeaderFooterConfig {
  enabled: boolean;
  content: string;
  fontSize: string;
  color: string;
}

export interface CoverPageConfig {
  enabled: boolean;
  layout: CoverPageLayout;
}

export interface DocumentConfig {
  tableOfContents: TocConfig;
  headingNumbering?: HeadingNumbering;
  pageNumbers: PageNumberConfig;
  header: HeaderFooterConfig;
  footer: HeaderFooterConfig;
  coverPage: CoverPageConfig;
}

export interface Theme {
  name: string;
  version: string;
  page: PageConfig;
  typography: TypographyConfig;
  elements: ElementStyles;
  document: DocumentConfig;
}
