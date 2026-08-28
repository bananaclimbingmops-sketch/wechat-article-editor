import {
  CalendarDays,
  Mountain,
  ShieldAlert,
} from 'lucide-react';
import type { ArticleBlock, ArticleDocument, BlockTone } from '../../domain/article';

type ArticlePreviewProps = {
  article: ArticleDocument;
};

function Lines({ text }: { text: string }) {
  return text.split(/\r?\n/).map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < text.split(/\r?\n/).length - 1 ? <br /> : null}
    </span>
  ));
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

function PreviewBlock({ block, isOpeningParagraph }: { block: ArticleBlock; isOpeningParagraph: boolean }) {
  switch (block.type) {
    case 'hero':
      return (
        <header className="article-hero">
          <div className="article-hero-card">
            {block.eyebrow ? <p className="article-eyebrow">{block.eyebrow}</p> : null}
            <h1><Lines text={block.title} /></h1>
          </div>
        </header>
      );

    case 'paragraph':
      if (isOpeningParagraph) {
        const [lead, ...closingLines] = block.text.split(/\r?\n/);
        return (
          <section className="article-intro-card">
            <p className="article-intro-lead"><Lines text={block.promotion ? lead : block.text} /></p>
            {block.promotion ? (
              <section className="article-intro-promotion">
                <p className="article-intro-promotion-period">{block.promotion.period}</p>
                <p className="article-intro-promotion-products">{block.promotion.products}</p>
                <p className="article-intro-promotion-offer">{block.promotion.offer}</p>
              </section>
            ) : null}
            {block.promotion && closingLines.length > 0 ? <p className="article-intro-closing"><Lines text={closingLines.join('\n')} /></p> : null}
            {block.note ? <p className="article-intro-note">{block.note}</p> : null}
          </section>
        );
      }
      return <p className="article-paragraph"><Lines text={block.text} /></p>;

    case 'image':
      return (
        <figure className="article-image">
          {block.src ? <img src={block.src} alt={block.alt} /> : <div className="article-image-missing">请关联图片</div>}
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );

    case 'horizontalGallery':
      return (
        <section className="article-horizontal-gallery">
          {block.title ? <h2>{block.title}</h2> : null}
          <div className="article-horizontal-gallery-track" tabIndex={0} aria-label="左右滑动选择报名门店">
            {block.items.map((item, index) => (
              <figure key={`${item.src}-${index}`}>
                {item.src ? <img src={item.src} alt={item.alt} /> : <div className="article-image-missing">请关联图片</div>}
              </figure>
            ))}
          </div>
          {block.hint ? <p>{block.hint}</p> : null}
        </section>
      );

    case 'sectionTitle':
      return (
        <h2 className={`article-section-title tone-${block.tone}`}>
          <span aria-hidden="true" />
          {block.text}
        </h2>
      );

    case 'facts':
      return (
        <dl className="article-facts">
          {block.items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      );

    case 'callout':
      return (
        <aside className={`article-callout tone-${block.tone}`}>
          <div className="article-callout-title">
            <span className="article-callout-title-symbol" aria-hidden="true">{toneSymbol(block.tone)}</span>
            <strong>{block.title}</strong>
          </div>
          <p><Lines text={block.text} /></p>
        </aside>
      );

    case 'schedule':
      return (
        <div className="article-schedule">
          {block.items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <span><CalendarDays aria-hidden="true" />{item.label}</span>
              <strong>{item.date}</strong>
            </div>
          ))}
        </div>
      );

    case 'notice':
      return (
        <aside className="article-notice">
          <div className="article-notice-title"><ShieldAlert aria-hidden="true" />{block.title}</div>
          <ol>
            {block.items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ol>
        </aside>
      );
  }
}

export function ArticlePreview({ article }: ArticlePreviewProps) {
  const openingParagraphId = article.blocks.find((block) => block.type === 'paragraph')?.id;

  return (
    <article className="phone-article">
      <div className="wechat-account-bar">
        <div className="account-avatar"><Mountain aria-hidden="true" /></div>
        <div>
          <strong>{article.metadata.accountName}</strong>
          <span>{article.metadata.publishedLabel} · {article.metadata.category}</span>
        </div>
      </div>
      <div className="phone-article-content">
        {article.blocks.map((block) => <PreviewBlock key={block.id} block={block} isOpeningParagraph={block.id === openingParagraphId} />)}
      </div>
    </article>
  );
}
