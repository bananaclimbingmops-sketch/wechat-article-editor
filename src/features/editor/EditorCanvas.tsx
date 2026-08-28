import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  ImagePlus,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  BLOCK_LABELS,
  type ArticleBlock,
  type ArticleDocument,
  type BlockTone,
} from '../../domain/article';

type EditorCanvasProps = {
  article: ArticleDocument;
  selectedBlockId: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, next: ArticleBlock) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAddAfter: (id: string, type: ArticleBlock['type']) => void;
  onImageFile: (id: string, file: File) => void;
};

const tones: Array<{ value: BlockTone; label: string }> = [
  { value: 'yellow', label: '香蕉黄' },
  { value: 'orange', label: '活力橙' },
  { value: 'teal', label: '辅助青' },
  { value: 'blue', label: '信息蓝' },
  { value: 'green', label: '成功绿' },
  { value: 'red', label: '警示红' },
  { value: 'neutral', label: '中性色' },
];

function Field({ label, value, multiline = false, onChange }: { label: string; value: string; multiline?: boolean; onChange: (value: string) => void }) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} rows={Math.max(3, Math.min(10, value.split('\n').length + 2))} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ToneField({ value, onChange }: { value: BlockTone; onChange: (value: BlockTone) => void }) {
  return (
    <label className="editor-field editor-field-small">
      <span>强调色</span>
      <select value={value} onChange={(event) => onChange(event.target.value as BlockTone)}>
        {tones.map((tone) => <option key={tone.value} value={tone.value}>{tone.label}</option>)}
      </select>
    </label>
  );
}

function BlockFields({ block, onChange, onImageFile }: { block: ArticleBlock; onChange: (next: ArticleBlock) => void; onImageFile: (file: File) => void }) {
  switch (block.type) {
    case 'hero':
      return (
        <>
          <Field label="眉题" value={block.eyebrow} onChange={(eyebrow) => onChange({ ...block, eyebrow })} />
          <Field label="主标题" value={block.title} multiline onChange={(title) => onChange({ ...block, title })} />
        </>
      );

    case 'paragraph':
      return (
        <>
          <Field label="正文" value={block.text} multiline onChange={(text) => onChange({ ...block, text })} />
          {block.promotion ? (
            <div className="paragraph-promotion-fields">
              <span className="field-group-label">促销焦点</span>
              <Field label="活动时间" value={block.promotion.period} onChange={(period) => onChange({ ...block, promotion: { ...block.promotion!, period } })} />
              <Field label="适用课包" value={block.promotion.products} onChange={(products) => onChange({ ...block, promotion: { ...block.promotion!, products } })} />
              <Field label="核心优惠" value={block.promotion.offer} onChange={(offer) => onChange({ ...block, promotion: { ...block.promotion!, offer } })} />
            </div>
          ) : null}
          {block.note !== undefined ? <Field label="开头脚注（可选）" value={block.note} multiline onChange={(note) => onChange({ ...block, note })} /> : null}
        </>
      );

    case 'image':
      return (
        <>
          <div className="image-source-row">
            <Field label="图片地址" value={block.src} onChange={(src) => onChange({ ...block, src })} />
            <label className="button secondary compact file-button">
              <ImagePlus aria-hidden="true" />本地图片
              <input type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImageFile(file);
                event.currentTarget.value = '';
              }} />
            </label>
          </div>
          <Field label="替代文本" value={block.alt} onChange={(alt) => onChange({ ...block, alt })} />
          <Field label="图片说明" value={block.caption} onChange={(caption) => onChange({ ...block, caption })} />
        </>
      );

    case 'horizontalGallery':
      return (
        <>
          <div className="field-grid-two">
            <Field label="横滑区标题" value={block.title} onChange={(title) => onChange({ ...block, title })} />
            <Field label="滑动提示" value={block.hint} onChange={(hint) => onChange({ ...block, hint })} />
          </div>
          <div className="repeat-fields">
            {block.items.map((item, index) => (
              <div className="repeat-row" key={`${block.id}-${index}`}>
                <input aria-label={`第 ${index + 1} 张图片地址`} value={item.src} onChange={(event) => {
                  const items = block.items.map((current, itemIndex) => itemIndex === index ? { ...current, src: event.target.value } : current);
                  onChange({ ...block, items });
                }} />
                <input aria-label={`第 ${index + 1} 张替代文本`} value={item.alt} onChange={(event) => {
                  const items = block.items.map((current, itemIndex) => itemIndex === index ? { ...current, alt: event.target.value } : current);
                  onChange({ ...block, items });
                }} />
                <button className="icon-button subtle" aria-label={`删除第 ${index + 1} 张图片`} disabled={block.items.length === 1} onClick={() => onChange({ ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 aria-hidden="true" /></button>
              </div>
            ))}
            <button className="inline-add" onClick={() => onChange({ ...block, items: [...block.items, { src: '', alt: '横滑图片' }] })}><Plus aria-hidden="true" />添加横滑图片</button>
          </div>
        </>
      );

    case 'sectionTitle':
      return (
        <div className="field-grid-two">
          <Field label="章节标题" value={block.text} onChange={(text) => onChange({ ...block, text })} />
          <ToneField value={block.tone} onChange={(tone) => onChange({ ...block, tone })} />
        </div>
      );

    case 'facts':
      return (
        <div className="repeat-fields">
          {block.items.map((item, index) => (
            <div className="repeat-row" key={`${block.id}-${index}`}>
              <input aria-label={`第 ${index + 1} 项名称`} value={item.label} onChange={(event) => {
                const items = block.items.map((current, itemIndex) => itemIndex === index ? { ...current, label: event.target.value } : current);
                onChange({ ...block, items });
              }} />
              <input aria-label={`第 ${index + 1} 项内容`} value={item.value} onChange={(event) => {
                const items = block.items.map((current, itemIndex) => itemIndex === index ? { ...current, value: event.target.value } : current);
                onChange({ ...block, items });
              }} />
              <button className="icon-button subtle" aria-label={`删除第 ${index + 1} 项`} disabled={block.items.length === 1} onClick={() => onChange({ ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 aria-hidden="true" /></button>
            </div>
          ))}
          <button className="inline-add" onClick={() => onChange({ ...block, items: [...block.items, { label: '项目', value: '内容' }] })}><Plus aria-hidden="true" />添加信息行</button>
        </div>
      );

    case 'callout':
      return (
        <>
          <div className="field-grid-two">
            <Field label="提示标题" value={block.title} onChange={(title) => onChange({ ...block, title })} />
            <ToneField value={block.tone} onChange={(tone) => onChange({ ...block, tone })} />
          </div>
          <Field label="提示正文" value={block.text} multiline onChange={(text) => onChange({ ...block, text })} />
        </>
      );

    case 'schedule':
      return (
        <div className="repeat-fields">
          {block.items.map((item, index) => (
            <div className="repeat-row" key={`${block.id}-${index}`}>
              <input aria-label={`第 ${index + 1} 个班次`} value={item.label} onChange={(event) => {
                const items = block.items.map((current, itemIndex) => itemIndex === index ? { ...current, label: event.target.value } : current);
                onChange({ ...block, items });
              }} />
              <input aria-label={`第 ${index + 1} 个班次日期`} value={item.date} onChange={(event) => {
                const items = block.items.map((current, itemIndex) => itemIndex === index ? { ...current, date: event.target.value } : current);
                onChange({ ...block, items });
              }} />
              <button className="icon-button subtle" aria-label={`删除第 ${index + 1} 个班次`} disabled={block.items.length === 1} onClick={() => onChange({ ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 aria-hidden="true" /></button>
            </div>
          ))}
          <button className="inline-add" onClick={() => onChange({ ...block, items: [...block.items, { label: '新班次', date: '日期待定' }] })}><Plus aria-hidden="true" />添加班次</button>
        </div>
      );

    case 'notice':
      return (
        <>
          <Field label="须知标题" value={block.title} onChange={(title) => onChange({ ...block, title })} />
          <div className="repeat-fields">
            {block.items.map((item, index) => (
              <div className="repeat-row notice-row" key={`${block.id}-${index}`}>
                <textarea aria-label={`第 ${index + 1} 条须知`} rows={2} value={item} onChange={(event) => {
                  const items = block.items.map((current, itemIndex) => itemIndex === index ? event.target.value : current);
                  onChange({ ...block, items });
                }} />
                <button className="icon-button subtle" aria-label={`删除第 ${index + 1} 条须知`} disabled={block.items.length === 1} onClick={() => onChange({ ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 aria-hidden="true" /></button>
              </div>
            ))}
            <button className="inline-add" onClick={() => onChange({ ...block, items: [...block.items, '新的注意事项。'] })}><Plus aria-hidden="true" />添加须知</button>
          </div>
        </>
      );
  }
}

export function EditorCanvas({ article, selectedBlockId, onSelect, onUpdate, onMove, onDuplicate, onDelete, onAddAfter, onImageFile }: EditorCanvasProps) {
  return (
    <div className="editor-block-list">
      {article.blocks.map((block, index) => {
        const selected = block.id === selectedBlockId;
        return (
          <section
            id={`editor-${block.id}`}
            className={`editor-block ${selected ? 'selected' : ''}`}
            key={block.id}
            onClick={() => onSelect(block.id)}
          >
            <header className="editor-block-header">
              <div className="editor-block-label">
                <GripVertical aria-hidden="true" />
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{BLOCK_LABELS[block.type]}</strong>
              </div>
              <div className="editor-block-actions">
                <button className="icon-button subtle" aria-label="上移内容块" disabled={index === 0} onClick={(event) => { event.stopPropagation(); onMove(block.id, -1); }}><ChevronUp aria-hidden="true" /></button>
                <button className="icon-button subtle" aria-label="下移内容块" disabled={index === article.blocks.length - 1} onClick={(event) => { event.stopPropagation(); onMove(block.id, 1); }}><ChevronDown aria-hidden="true" /></button>
                <button className="icon-button subtle" aria-label="复制内容块" onClick={(event) => { event.stopPropagation(); onDuplicate(block.id); }}><Copy aria-hidden="true" /></button>
                <button className="icon-button danger-ghost" aria-label="删除内容块" disabled={article.blocks.length === 1} onClick={(event) => { event.stopPropagation(); onDelete(block.id); }}><Trash2 aria-hidden="true" /></button>
              </div>
            </header>
            <div className="editor-block-body">
              <BlockFields block={block} onChange={(next) => onUpdate(block.id, next)} onImageFile={(file) => onImageFile(block.id, file)} />
            </div>
            {selected ? (
              <div className="insert-after">
                <span>在下方插入</span>
                <button onClick={() => onAddAfter(block.id, 'paragraph')}>正文</button>
                <button onClick={() => onAddAfter(block.id, 'sectionTitle')}>章节</button>
                <button onClick={() => onAddAfter(block.id, 'image')}>图片</button>
                <button onClick={() => onAddAfter(block.id, 'callout')}>提示</button>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
