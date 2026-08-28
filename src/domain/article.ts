export type BlockTone = 'yellow' | 'orange' | 'teal' | 'blue' | 'green' | 'red' | 'neutral';

export type HeroBlock = {
  id: string;
  type: 'hero';
  eyebrow: string;
  title: string;
};

export type ParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string;
  note?: string;
  promotion?: {
    period: string;
    products: string;
    offer: string;
  };
};

export type ImageBlock = {
  id: string;
  type: 'image';
  src: string;
  alt: string;
  caption: string;
};

export type HorizontalGalleryBlock = {
  id: string;
  type: 'horizontalGallery';
  title: string;
  hint: string;
  items: Array<{ src: string; alt: string }>;
};

export type SectionTitleBlock = {
  id: string;
  type: 'sectionTitle';
  text: string;
  tone: BlockTone;
};

export type FactsBlock = {
  id: string;
  type: 'facts';
  items: Array<{ label: string; value: string }>;
};

export type CalloutBlock = {
  id: string;
  type: 'callout';
  title: string;
  text: string;
  tone: BlockTone;
};

export type ScheduleBlock = {
  id: string;
  type: 'schedule';
  items: Array<{ label: string; date: string }>;
};

export type NoticeBlock = {
  id: string;
  type: 'notice';
  title: string;
  items: string[];
};

export type ArticleBlock =
  | HeroBlock
  | ParagraphBlock
  | ImageBlock
  | HorizontalGalleryBlock
  | SectionTitleBlock
  | FactsBlock
  | CalloutBlock
  | ScheduleBlock
  | NoticeBlock;

export type ArticleDocument = {
  id: string;
  title: string;
  sourceText: string;
  blocks: ArticleBlock[];
  metadata: {
    accountName: string;
    publishedLabel: string;
    category: string;
  };
};

export const BLOCK_LABELS: Record<ArticleBlock['type'], string> = {
  hero: '文章标题',
  paragraph: '正文段落',
  image: '图片',
  horizontalGallery: '横滑图片',
  sectionTitle: '章节标题',
  facts: '信息表',
  callout: '重点提示',
  schedule: '排期表',
  notice: '须知列表',
};

export function blockTitle(block: ArticleBlock): string {
  switch (block.type) {
    case 'hero':
      return block.title.replace(/\n/g, ' ');
    case 'paragraph':
      return block.text;
    case 'image':
      return block.caption || block.alt;
    case 'horizontalGallery':
      return block.title || `${block.items.length} 张横滑图片`;
    case 'sectionTitle':
      return block.text;
    case 'facts':
      return block.items[0]?.value ?? '信息表';
    case 'callout':
      return block.title;
    case 'schedule':
      return `${block.items.length} 个班次`;
    case 'notice':
      return block.title;
  }
}

export function extractBlockText(block: ArticleBlock): string[] {
  switch (block.type) {
    case 'hero':
      return [block.eyebrow, block.title];
    case 'paragraph':
      if (block.promotion) {
        const [lead, ...closingLines] = block.text.split(/\r?\n/);
        return [
          lead,
          block.promotion.period,
          block.promotion.products,
          block.promotion.offer,
          closingLines.join('\n'),
          block.note ?? '',
        ].filter(Boolean);
      }
      return block.note ? [block.text, block.note] : [block.text];
    case 'image':
      return block.caption ? [block.caption] : [];
    case 'horizontalGallery':
      return [block.title, block.hint].filter(Boolean);
    case 'sectionTitle':
      return [block.text];
    case 'facts':
      return block.items.flatMap((item) => [item.label, item.value]);
    case 'callout':
      return [block.title, block.text];
    case 'schedule':
      return block.items.flatMap((item) => [item.label, item.date]);
    case 'notice':
      return [block.title, ...block.items];
  }
}

export function extractArticleText(blocks: ArticleBlock[]): string {
  return blocks.flatMap(extractBlockText).filter(Boolean).join('\n');
}

export function normalizeVisibleText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u00a0\u2000-\u200b\u2028\u2029\u3000\s]+/g, '');
}

export function createBlock(type: ArticleBlock['type']): ArticleBlock {
  const id = `${type}-${crypto.randomUUID()}`;

  switch (type) {
    case 'hero':
      return { id, type, eyebrow: 'NEW ARTICLE', title: '在这里输入文章标题' };
    case 'paragraph':
      return { id, type, text: '在这里输入正文。' };
    case 'image':
      return { id, type, src: '', alt: '文章配图', caption: '输入图片说明' };
    case 'horizontalGallery':
      return {
        id,
        type,
        title: '横向滑动查看更多',
        hint: '← 左右滑动查看更多 →',
        items: [{ src: '', alt: '横滑图片' }],
      };
    case 'sectionTitle':
      return { id, type, text: '新的章节', tone: 'yellow' };
    case 'facts':
      return { id, type, items: [{ label: '项目', value: '内容' }] };
    case 'callout':
      return { id, type, title: '重点提示', text: '在这里输入重点内容。', tone: 'yellow' };
    case 'schedule':
      return { id, type, items: [{ label: 'A 班', date: '日期待定' }] };
    case 'notice':
      return { id, type, title: '报名须知', items: ['在这里输入注意事项。'] };
  }
}

export function cloneArticle(article: ArticleDocument): ArticleDocument {
  return structuredClone(article);
}
