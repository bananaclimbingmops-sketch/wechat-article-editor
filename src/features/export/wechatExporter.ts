import type { ArticleBlock, ArticleDocument, BlockTone } from '../../domain/article';

const theme = {
  yellow: 'rgb(255, 218, 42)',
  brown: 'rgb(137, 84, 33)',
  orange: 'rgb(249, 132, 53)',
  cream: 'rgb(255, 246, 224)',
  teal: 'rgb(132, 204, 201)',
  text: 'rgb(45, 36, 28)',
  muted: 'rgb(111, 101, 91)',
  border: 'rgb(229, 223, 213)',
  white: 'rgb(255, 255, 255)',
  blueBg: 'rgb(239, 248, 255)',
  blueText: 'rgb(30, 91, 138)',
  greenBg: 'rgb(238, 249, 242)',
  greenText: 'rgb(36, 110, 75)',
  redBg: 'rgb(255, 243, 243)',
  redText: 'rgb(153, 52, 52)',
  orangeBg: 'rgb(255, 247, 237)',
} as const;

const baseFont = "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif";

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function paragraph(value: string, style: string): string {
  return `<p style="margin:0;${style}">${escapeHtml(value)}</p>`;
}

function paragraphs(value: string, style: string, gap = 8): string {
  return value
    .split(/\r?\n/)
    .map((line, index) => paragraph(line || '　', `${index > 0 ? `margin-top:${gap}px;` : ''}${style}`))
    .join('');
}

function toneColor(tone: BlockTone): string {
  const colors: Record<BlockTone, string> = {
    yellow: theme.yellow,
    orange: theme.orange,
    teal: theme.teal,
    blue: theme.blueText,
    green: theme.greenText,
    red: theme.redText,
    neutral: theme.brown,
  };

  return colors[tone];
}

function toneBackground(tone: BlockTone): string {
  const colors: Record<BlockTone, string> = {
    yellow: theme.cream,
    orange: theme.orangeBg,
    teal: 'rgb(240, 250, 249)',
    blue: theme.blueBg,
    green: theme.greenBg,
    red: theme.redBg,
    neutral: 'rgb(250, 248, 243)',
  };

  return colors[tone];
}

function toneSymbol(tone: BlockTone): string {
  if (tone === 'blue') return '◆';
  if (tone === 'green') return '✓';
  if (tone === 'orange') return '◇';
  if (tone === 'red') return '!';
  if (tone === 'teal') return '●';
  if (tone === 'neutral') return '•';
  return '✦';
}

function renderBlock(block: ArticleBlock, isOpeningParagraph: boolean): string {
  const bodyStyle = `font-family:${baseFont};font-size:15px;line-height:1.8;letter-spacing:0.02em;color:${theme.text};`;

  switch (block.type) {
    case 'hero': {
      const titleLines = block.title
        .split(/\r?\n/)
        .map((line) => paragraph(line, `font-family:${baseFont};font-size:20px;line-height:1.45;font-weight:800;letter-spacing:0.02em;color:${theme.brown};text-align:center;word-break:break-word;overflow-wrap:anywhere;`))
        .join('');

      const eyebrow = block.eyebrow
        ? paragraph(block.eyebrow, `margin-bottom:8px;font-family:${baseFont};font-size:10px;line-height:1.5;font-weight:700;letter-spacing:0.08em;color:${theme.brown};text-align:center;`)
        : '';

      return `<section style="margin:0;padding:32px 20px 42px;text-align:center;"><section style="display:inline-block;width:78%;margin:0 auto;padding:18px 22px;border-radius:22px;background-color:${theme.yellow};box-shadow:7px 9px 0 ${theme.brown};transform:rotate(-1.2deg);-webkit-transform:rotate(-1.2deg);">${eyebrow}${titleLines}</section></section>`;
    }

    case 'paragraph': {
      if (isOpeningParagraph) {
        const note = block.note
          ? paragraph(block.note, `margin-top:10px;font-family:${baseFont};font-size:12px;line-height:1.65;letter-spacing:0.02em;color:${theme.brown};opacity:0.72;text-align:left;`)
          : '';
        if (block.promotion) {
          const [lead, ...closingLines] = block.text.split(/\r?\n/);
          const promotion = `<section style="margin:14px 0;padding:13px 10px 14px;border-radius:12px;background-color:${theme.yellow};box-shadow:4px 5px 0 rgba(137, 84, 33, 0.16);text-align:center;">${paragraph(
            block.promotion.period,
            `font-family:${baseFont};font-size:11px;line-height:1.5;font-weight:700;letter-spacing:0.04em;color:${theme.brown};text-align:center;`,
          )}${paragraph(
            block.promotion.products,
            `margin-top:6px;font-family:${baseFont};font-size:13px;line-height:1.6;font-weight:700;color:${theme.brown};text-align:center;`,
          )}${paragraph(
            block.promotion.offer,
            `margin-top:2px;font-family:${baseFont};font-size:20px;line-height:1.45;font-weight:800;letter-spacing:0.01em;color:${theme.brown};text-align:center;`,
          )}</section>`;
          const closing = closingLines.length > 0
            ? paragraphs(closingLines.join('\n'), `margin-top:12px;font-family:${baseFont};font-size:14px;line-height:1.85;letter-spacing:0.02em;color:${theme.brown};text-align:justify;`, 6)
            : '';
          return `<section style="margin:0 6px 34px;padding:14px;border:1px solid ${theme.yellow};border-radius:16px;background-color:${theme.cream};">${paragraphs(lead, `font-family:${baseFont};font-size:14px;line-height:1.85;letter-spacing:0.02em;color:${theme.brown};text-align:justify;`, 6)}${promotion}${closing}${note}</section>`;
        }
        return `<section style="margin:0 6px 34px;padding:14px;border:1px solid ${theme.yellow};border-radius:16px;background-color:${theme.cream};">${paragraphs(block.text, `font-family:${baseFont};font-size:15px;line-height:1.85;letter-spacing:0.02em;color:${theme.brown};text-align:justify;`, 6)}${note}</section>`;
      }
      return `<section style="margin:0;padding:0 6px 24px;">${paragraphs(block.text, bodyStyle, 6)}${block.note ? paragraph(block.note, `margin-top:8px;font-family:${baseFont};font-size:12px;line-height:1.7;color:${theme.muted};`) : ''}</section>`;
    }

    case 'image': {
      const caption = block.caption
        ? paragraph(block.caption, `margin-top:7px;font-family:${baseFont};font-size:11px;line-height:1.7;font-style:italic;letter-spacing:0.02em;color:${theme.muted};text-align:center;`)
        : '';
      const source = escapeHtml(block.src || '');
      const alt = escapeHtml(block.alt || '文章配图');
      return `<section style="margin:0;padding:0 6px 28px;"><img src="${source}" alt="${alt}" style="display:block;width:100%;max-width:100%;height:auto;border-radius:14px;" />${caption}</section>`;
    }

    case 'horizontalGallery': {
      const cards = block.items.map((item, index) => {
        const source = escapeHtml(item.src || '');
        const alt = escapeHtml(item.alt || `横滑图片 ${index + 1}`);
        const margin = index < block.items.length - 1 ? 'margin-right:12px;' : '';
        return `<section style="display:inline-block;width:84%;${margin}vertical-align:top;white-space:normal;"><img src="${source}" alt="${alt}" style="display:block;width:100%;max-width:100%;height:auto;border-radius:13px;" /></section>`;
      }).join('');
      const title = block.title
        ? `<section style="margin:0 20px 14px 0;padding:0 0 0 10px;border-left:6px solid ${theme.yellow};">${paragraph(block.title, `font-family:${baseFont};font-size:17px;line-height:1.6;font-weight:700;letter-spacing:0.02em;color:${theme.brown};`)}</section>`
        : '';
      const hint = block.hint
        ? paragraph(block.hint, `margin:8px 20px 0 0;font-family:${baseFont};font-size:12px;line-height:1.6;font-weight:700;letter-spacing:0.03em;color:${theme.brown};text-align:center;`)
        : '';
      return `<section style="margin:0;padding:4px 0 34px 6px;overflow:hidden;">${title}<section tabindex="0" aria-label="左右滑动选择报名门店" style="width:100%;margin:0;padding:0 6px 9px 0;overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch;">${cards}</section>${hint}</section>`;
    }

    case 'sectionTitle':
      return `<section style="margin:0;padding:2px 6px 16px;"><section style="margin:0;padding:0 0 0 10px;border-left:6px solid ${toneColor(block.tone)};">${paragraph(
        block.text,
        `font-family:${baseFont};font-size:17px;line-height:1.6;font-weight:700;letter-spacing:0.02em;color:${theme.brown};`,
      )}</section></section>`;

    case 'facts': {
      const rows = block.items
        .map(
          (item, index) =>
            `<tr><td style="width:30%;padding:11px 10px;vertical-align:top;${index < block.items.length - 1 ? `border-bottom:1px solid ${theme.border};` : ''}">${paragraph(
              item.label,
              `font-family:${baseFont};font-size:13px;line-height:1.6;color:${theme.muted};`,
            )}</td><td style="padding:11px 10px;vertical-align:top;${index < block.items.length - 1 ? `border-bottom:1px solid ${theme.border};` : ''}">${paragraph(
              item.value,
              `font-family:${baseFont};font-size:13px;line-height:1.6;font-weight:700;color:${theme.text};text-align:right;`,
            )}</td></tr>`,
        )
        .join('');
      return `<section style="margin:0;padding:0 6px 20px;"><section style="margin:0;padding:5px 8px;border-radius:12px;background-color:${theme.cream};"><table style="width:100%;border-collapse:collapse;border-spacing:0;">${rows}</table></section></section>`;
    }

    case 'callout':
      return `<section style="margin:0;padding:0 6px 20px;"><section style="margin:0;padding:13px;border:1px solid ${toneColor(block.tone)};border-radius:12px;background-color:${toneBackground(block.tone)};">${paragraph(
        `${toneSymbol(block.tone)} ${block.title}`,
        `font-family:${baseFont};font-size:14px;line-height:1.6;font-weight:700;letter-spacing:0.02em;color:${toneColor(block.tone)};`,
      )}${paragraphs(block.text, `margin-top:7px;font-family:${baseFont};font-size:13px;line-height:1.8;letter-spacing:0.02em;color:${theme.text};`, 5)}</section></section>`;

    case 'schedule': {
      const rows = block.items
        .map(
          (item) =>
            `<tr><td style="padding:10px 12px;border-bottom:6px solid ${theme.white};border-radius:8px 0 0 8px;background-color:rgb(250, 248, 243);">${paragraph(
              item.label,
              `font-family:${baseFont};font-size:13px;line-height:1.6;font-weight:700;color:${theme.text};`,
            )}</td><td style="padding:10px 12px;border-bottom:6px solid ${theme.white};border-radius:0 8px 8px 0;background-color:rgb(250, 248, 243);">${paragraph(
              item.date,
              `font-family:${baseFont};font-size:13px;line-height:1.6;color:${theme.muted};text-align:right;`,
            )}</td></tr>`,
        )
        .join('');
      return `<section style="margin:0;padding:0 6px 20px;"><table style="width:100%;border-collapse:collapse;border-spacing:0;">${rows}</table></section>`;
    }

    case 'notice': {
      const items = block.items
        .map((item, index) => paragraph(`${index + 1}. ${item}`, `margin-top:${index === 0 ? 10 : 8}px;font-family:${baseFont};font-size:12px;line-height:1.8;letter-spacing:0.02em;color:${theme.redText};`))
        .join('');
      return `<section style="margin:0;padding:0 6px 36px;"><section style="margin:0;padding:14px;border:1px solid ${theme.redText};border-radius:12px;background-color:${theme.redBg};">${paragraph(
        block.title,
        `font-family:${baseFont};font-size:14px;line-height:1.6;font-weight:700;color:${theme.redText};`,
      )}${items}</section></section>`;
    }
  }
}

export function renderWechatHtml(article: ArticleDocument): string {
  const openingParagraphId = article.blocks.find((block) => block.type === 'paragraph')?.id;
  const content = article.blocks.map((block) => renderBlock(block, block.id === openingParagraphId)).join('');
  return `<section style="margin:0 auto;padding:0;max-width:677px;background-color:${theme.white};word-break:break-word;">${content}</section>`;
}
