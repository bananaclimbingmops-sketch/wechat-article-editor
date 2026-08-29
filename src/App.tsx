import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignLeft,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clipboard,
  CloudOff,
  Code2,
  Download,
  FileInput,
  FileText,
  Image as ImageIcon,
  LayoutList,
  MapPin,
  Mountain,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Redo2,
  RefreshCcw,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TextQuote,
  Undo2,
  X,
} from 'lucide-react';
import {
  BLOCK_LABELS,
  blockTitle,
  cloneArticle,
  createBlock,
  extractArticleText,
  normalizeVisibleText,
  type ArticleBlock,
  type ArticleDocument,
} from './domain/article';
import {
  chengduBackToSchoolArticle,
  chengduCourseImageInsertionAnchors,
  chengduHeroTitle,
  chengduImageInsertionAnchors,
  chengduIntroPromotion,
  chengduIntroText,
  chengduLegacyHeroTitle,
  chengduLegacyIntroText,
  chengduStoreGalleryInsertion,
} from './examples/chengduBackToSchool';
import { hangzhouReferralArticle } from './examples/hangzhouReferral';
import { k11Article, k11IntroNote } from './examples/k11';
import { EditorCanvas } from './features/editor/EditorCanvas';
import { renderWechatHtml } from './features/export/wechatExporter';
import { commitHistory, createHistory, redoHistory, undoHistory } from './features/history/articleHistory';
import { ArticlePreview } from './features/preview/ArticlePreview';
import { validateArticle, type CheckStatus } from './features/validation/validator';

const STORAGE_KEY = 'wechat-article-workbench:document:v1';
const CHENGDU_IMPORT_MARKER_KEY = 'wechat-article-workbench:chengdu-school-season-imported:v1';
const CHENGDU_IMAGE_IMPORT_MARKER_KEY = 'wechat-article-workbench:chengdu-school-season-images-imported:v1';
const CHENGDU_COURSE_IMAGE_IMPORT_MARKER_KEY = 'wechat-article-workbench:chengdu-course-images-imported:v1';
const CHENGDU_STORE_GALLERY_IMPORT_MARKER_KEY = 'wechat-article-workbench:chengdu-store-gallery-imported:v1';
const HANGZHOU_REFERRAL_IMPORT_MARKER_KEY = 'wechat-article-workbench:hangzhou-referral-imported:v1';

type InspectorTab = 'preview' | 'html' | 'validation';
type PreviewMode = 'react' | 'export';
type MobilePanel = 'outline' | 'editor' | 'preview' | 'validation';
type SaveState = 'saved' | 'saving' | 'error';

type ChengduImageInsertion = Readonly<{ afterBlockId: string; imageBlockId: string }>;

function insertMissingChengduImages(blocks: ArticleBlock[], insertions: readonly ChengduImageInsertion[]): ArticleBlock[] {
  const existingIds = new Set(blocks.map((block) => block.id));
  const imagesByAnchor = new Map<string, ArticleBlock[]>();

  for (const insertion of insertions) {
    if (existingIds.has(insertion.imageBlockId)) continue;
    const image = chengduBackToSchoolArticle.blocks.find((block) => block.id === insertion.imageBlockId);
    if (!image) continue;
    const anchoredImages = imagesByAnchor.get(insertion.afterBlockId) ?? [];
    anchoredImages.push(structuredClone(image));
    imagesByAnchor.set(insertion.afterBlockId, anchoredImages);
  }

  return blocks.flatMap((block) => [block, ...(imagesByAnchor.get(block.id) ?? [])]);
}

function insertMissingChengduStoreGallery(blocks: ArticleBlock[]): ArticleBlock[] {
  if (blocks.some((block) => block.id === chengduStoreGalleryInsertion.blockId)) return blocks;
  const gallery = chengduBackToSchoolArticle.blocks.find((block) => block.id === chengduStoreGalleryInsertion.blockId);
  if (!gallery) return blocks;
  return blocks.flatMap((block) => block.id === chengduStoreGalleryInsertion.afterBlockId
    ? [block, structuredClone(gallery)]
    : [block]);
}

function loadInitialArticle(): ArticleDocument {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      if (!localStorage.getItem(HANGZHOU_REFERRAL_IMPORT_MARKER_KEY)) {
        localStorage.setItem(HANGZHOU_REFERRAL_IMPORT_MARKER_KEY, '1');
        return cloneArticle(hangzhouReferralArticle);
      }
      const parsed = JSON.parse(stored) as ArticleDocument;
      if (parsed.id === chengduBackToSchoolArticle.id) {
        const matchedBeforeMigration = normalizeVisibleText(parsed.sourceText) === normalizeVisibleText(extractArticleText(parsed.blocks));
        let blocks = parsed.blocks.map((block) => {
          if (block.id === 'hero-chengdu-school-season' && block.type === 'hero' && block.title === chengduLegacyHeroTitle) {
            return { ...block, title: chengduHeroTitle };
          }
          if (block.id === 'intro-chengdu-school-season' && block.type === 'paragraph' && !block.promotion && block.text === chengduLegacyIntroText) {
            return {
              ...block,
              text: chengduIntroText,
              promotion: structuredClone(chengduIntroPromotion),
            };
          }
          return block;
        });
        if (!localStorage.getItem(CHENGDU_IMAGE_IMPORT_MARKER_KEY)) {
          blocks = insertMissingChengduImages(blocks, chengduImageInsertionAnchors);
          localStorage.setItem(CHENGDU_IMAGE_IMPORT_MARKER_KEY, '1');
        }
        if (!localStorage.getItem(CHENGDU_COURSE_IMAGE_IMPORT_MARKER_KEY)) {
          blocks = insertMissingChengduImages(blocks, chengduCourseImageInsertionAnchors);
          localStorage.setItem(CHENGDU_COURSE_IMAGE_IMPORT_MARKER_KEY, '1');
        }
        if (!localStorage.getItem(CHENGDU_STORE_GALLERY_IMPORT_MARKER_KEY)) {
          blocks = insertMissingChengduStoreGallery(blocks);
          localStorage.setItem(CHENGDU_STORE_GALLERY_IMPORT_MARKER_KEY, '1');
        }
        return {
          ...parsed,
          blocks,
          sourceText: matchedBeforeMigration ? extractArticleText(blocks) : parsed.sourceText,
        };
      }
      if (parsed.id !== k11Article.id) return parsed;

      const matchedBeforeMigration = normalizeVisibleText(parsed.sourceText) === normalizeVisibleText(extractArticleText(parsed.blocks));
      const blocks = parsed.blocks.map((block) => {
        if (block.id === 'hero-k11' && block.type === 'hero' && block.eyebrow === 'SUMMER CLIMBING CAMP') {
          return { ...block, eyebrow: '' };
        }
        if (block.id === 'intro' && block.type === 'paragraph' && !block.note) {
          return { ...block, note: k11IntroNote };
        }
        return block;
      });

      const migrated = {
        ...parsed,
        blocks,
        sourceText: matchedBeforeMigration ? extractArticleText(blocks) : parsed.sourceText,
      };

      const isPristineK11 = normalizeVisibleText(migrated.sourceText) === normalizeVisibleText(extractArticleText(migrated.blocks));
      if (!localStorage.getItem(CHENGDU_IMPORT_MARKER_KEY) && isPristineK11) {
        localStorage.setItem(CHENGDU_IMPORT_MARKER_KEY, '1');
        return cloneArticle(chengduBackToSchoolArticle);
      }

      return migrated;
    }
  } catch {
    // A malformed local draft should never prevent the workbench from loading.
  }
  try {
    localStorage.setItem(CHENGDU_IMPORT_MARKER_KEY, '1');
    localStorage.setItem(CHENGDU_IMAGE_IMPORT_MARKER_KEY, '1');
    localStorage.setItem(CHENGDU_COURSE_IMAGE_IMPORT_MARKER_KEY, '1');
    localStorage.setItem(CHENGDU_STORE_GALLERY_IMPORT_MARKER_KEY, '1');
    localStorage.setItem(HANGZHOU_REFERRAL_IMPORT_MARKER_KEY, '1');
  } catch {
    // The editor still works when browser storage is unavailable.
  }
  return cloneArticle(hangzhouReferralArticle);
}

function ImportDialog({ open, onClose, onImport }: { open: boolean; onClose: () => void; onImport: (text: string) => void }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!open) setText('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="import-title">
        <header>
          <div>
            <span className="eyebrow-label">IMPORT SOURCE</span>
            <h2 id="import-title">粘贴文章原文</h2>
          </div>
          <button className="icon-button" aria-label="关闭导入面板" onClick={onClose}><X aria-hidden="true" /></button>
        </header>
        <p className="dialog-description">第一段会作为标题，其余内容按空行拆成正文段落。导入文本将保存为不可变的原文校验基线。</p>
        <label className="editor-field">
          <span>原始内容</span>
          <textarea autoFocus rows={15} value={text} placeholder={'文章标题\n\n第一段正文……\n\n第二段正文……'} onChange={(event) => setText(event.target.value)} />
        </label>
        <footer>
          <button className="button secondary" onClick={onClose}>取消</button>
          <button className="button primary" disabled={!text.trim()} onClick={() => onImport(text)}><FileInput aria-hidden="true" />生成文章结构</button>
        </footer>
      </section>
    </div>
  );
}

function StatusMark({ status }: { status: CheckStatus }) {
  if (status === 'pass') return <CircleCheck aria-hidden="true" />;
  return <CircleAlert aria-hidden="true" />;
}

export default function App() {
  const [articleHistory, setArticleHistory] = useState(() => createHistory(loadInitialArticle()));
  const article = articleHistory.present;
  const [selectedBlockId, setSelectedBlockId] = useState(article.blocks[0]?.id ?? '');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('preview');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('react');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [toast, setToast] = useState('');
  const saveTimer = useRef<number | null>(null);

  const exportedHtml = useMemo(() => renderWechatHtml(article), [article]);
  const report = useMemo(() => validateArticle(article), [article]);
  const canUndo = articleHistory.past.length > 0;
  const canRedo = articleHistory.future.length > 0;

  const commitArticle = useCallback((updater: ArticleDocument | ((current: ArticleDocument) => ArticleDocument), historyKey?: string) => {
    setArticleHistory((current) => {
      const next = typeof updater === 'function' ? updater(current.present) : updater;
      return commitHistory(current, next, { key: historyKey });
    });
  }, []);

  const undoArticle = useCallback(() => {
    if (!canUndo) return;
    setArticleHistory((current) => undoHistory(current));
    setToast('已撤回上一步');
  }, [canUndo]);

  const redoArticle = useCallback(() => {
    if (!canRedo) return;
    setArticleHistory((current) => redoHistory(current));
    setToast('已重做下一步');
  }, [canRedo]);

  useEffect(() => {
    setSaveState('saving');
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(article));
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, 320);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [article]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (article.blocks.some((block) => block.id === selectedBlockId)) return;
    setSelectedBlockId(article.blocks[0]?.id ?? '');
  }, [article.blocks, selectedBlockId]);

  useEffect(() => {
    const handleHistoryShortcut = (event: KeyboardEvent) => {
      if (importOpen || event.altKey || (!event.metaKey && !event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redoArticle();
        else undoArticle();
      } else if (key === 'y' && event.ctrlKey) {
        event.preventDefault();
        redoArticle();
      }
    };
    window.addEventListener('keydown', handleHistoryShortcut);
    return () => window.removeEventListener('keydown', handleHistoryShortcut);
  }, [importOpen, redoArticle, undoArticle]);

  const updateBlock = (id: string, next: ArticleBlock) => {
    commitArticle((current) => ({
      ...current,
      blocks: current.blocks.map((block) => block.id === id ? next : block),
    }), `block:${id}`);
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    commitArticle((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.blocks.length) return current;
      const blocks = [...current.blocks];
      [blocks[index], blocks[nextIndex]] = [blocks[nextIndex], blocks[index]];
      return { ...current, blocks };
    });
  };

  const duplicateBlock = (id: string) => {
    commitArticle((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      if (index < 0) return current;
      const duplicate = { ...structuredClone(current.blocks[index]), id: `${current.blocks[index].type}-${crypto.randomUUID()}` } as ArticleBlock;
      const blocks = [...current.blocks];
      blocks.splice(index + 1, 0, duplicate);
      setSelectedBlockId(duplicate.id);
      return { ...current, blocks };
    });
  };

  const deleteBlock = (id: string) => {
    if (!window.confirm('确认删除这个内容块吗？删除后仍可重新载入 K11 示例恢复。')) return;
    commitArticle((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      const blocks = current.blocks.filter((block) => block.id !== id);
      setSelectedBlockId(blocks[Math.max(0, index - 1)]?.id ?? blocks[0]?.id ?? '');
      return { ...current, blocks };
    });
  };

  const addBlockAfter = (id: string, type: ArticleBlock['type']) => {
    const block = createBlock(type);
    commitArticle((current) => {
      const index = current.blocks.findIndex((item) => item.id === id);
      const blocks = [...current.blocks];
      blocks.splice(index + 1, 0, block);
      return { ...current, blocks };
    });
    setSelectedBlockId(block.id);
    window.setTimeout(() => document.getElementById(`editor-${block.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const addBlockAtEnd = (type: ArticleBlock['type']) => {
    const block = createBlock(type);
    commitArticle((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedBlockId(block.id);
    setMobilePanel('editor');
    window.setTimeout(() => document.getElementById(`editor-${block.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const selectFromOutline = (id: string) => {
    setSelectedBlockId(id);
    setMobilePanel('editor');
    document.getElementById(`editor-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleImageFile = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const block = article.blocks.find((item) => item.id === id);
      if (!block || block.type !== 'image' || typeof reader.result !== 'string') return;
      const src = reader.result;
      commitArticle((current) => ({
        ...current,
        blocks: current.blocks.map((item) => item.id === id && item.type === 'image'
          ? { ...item, src, alt: item.alt || file.name }
          : item),
      }));
      setToast(file.size > 1_500_000 ? '图片较大，浏览器可能无法自动保存草稿' : '本地图片已关联');
    };
    reader.readAsDataURL(file);
  };

  const importText = (rawText: string) => {
    const chunks = rawText
      .replace(/\r\n/g, '\n')
      .split(/\n\s*\n/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
    if (chunks.length === 0) return;

    const blocks: ArticleBlock[] = [
      { id: `hero-${crypto.randomUUID()}`, type: 'hero', eyebrow: '', title: chunks[0] },
      ...chunks.slice(1).map((text, index) => ({ id: `paragraph-${crypto.randomUUID()}`, type: 'paragraph' as const, text, ...(index === 0 ? { note: '' } : {}) })),
    ];
    const next: ArticleDocument = {
      id: `article-${crypto.randomUUID()}`,
      title: chunks[0].replace(/\n/g, ' '),
      sourceText: extractArticleText(blocks),
      blocks,
      metadata: {
        accountName: article.metadata.accountName,
        publishedLabel: '草稿',
        category: '新文章',
      },
    };
    commitArticle(next);
    setSelectedBlockId(blocks[0].id);
    setImportOpen(false);
    setMobilePanel('editor');
    setToast(`已导入 ${chunks.length} 个内容段落`);
  };

  const loadExample = (example: ArticleDocument, label: string) => {
    if (article.id === example.id) {
      setToast(`${label}已在编辑器中`);
      return;
    }
    if (!window.confirm(`载入${label}会覆盖当前草稿，确认继续吗？`)) return;
    const next = cloneArticle(example);
    commitArticle(next);
    setSelectedBlockId(next.blocks[0].id);
    setInspectorTab('preview');
    setMobilePanel('editor');
    setToast(`${label}已载入`);
  };

  const updateSourceBaseline = () => {
    if (!window.confirm('确认把当前可见文字设为模板吗？之后将以当前内容检查增删和调序。')) return;
    commitArticle((current) => ({ ...current, sourceText: extractArticleText(current.blocks) }));
    setToast('模板已更新');
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(exportedHtml);
      setToast('微信 HTML 已复制');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = exportedHtml;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      setToast('微信 HTML 已复制');
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${exportedHtml}</body></html>`], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${article.title.replace(/[\\/:*?"<>|]/g, '-') || 'wechat-article'}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast('HTML 文件已下载');
  };

  const saveLabel = saveState === 'saving' ? '正在保存' : saveState === 'error' ? '存储空间不足' : '已保存到本机';

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} data-mobile-panel={mobilePanel}>
      <header className="app-topbar">
        <div className="brand-lockup">
          <span className="brand-mark"><Mountain aria-hidden="true" /></span>
          <div>
            <strong>公众号文章工作台</strong>
            <span>原文无损 · 微信兼容</span>
          </div>
        </div>
        <div className="document-title-wrap">
          <span className={`save-status ${saveState}`}>
            {saveState === 'error' ? <CloudOff aria-hidden="true" /> : saveState === 'saved' ? <Check aria-hidden="true" /> : <Save aria-hidden="true" />}
            {saveLabel}
          </span>
          <input aria-label="文章名称" value={article.title} onChange={(event) => commitArticle((current) => ({ ...current, title: event.target.value }), 'article-title')} />
        </div>
        <div className="topbar-actions">
          <button className="button secondary compact history-button" aria-label={`撤回，当前可撤回 ${articleHistory.past.length} 步`} title="撤回（⌘/Ctrl+Z）" onClick={undoArticle} disabled={!canUndo}><Undo2 aria-hidden="true" /><span>撤回</span><b>{articleHistory.past.length}</b></button>
          <button className="button secondary compact history-button" aria-label={`重做，当前可重做 ${articleHistory.future.length} 步`} title="重做（⌘/Ctrl+Shift+Z 或 Ctrl+Y）" onClick={redoArticle} disabled={!canRedo}><Redo2 aria-hidden="true" /><span>重做</span><b>{articleHistory.future.length}</b></button>
          <button className="button secondary" aria-label="导入原文" title="导入原文" onClick={() => setImportOpen(true)}><FileInput aria-hidden="true" /><span>导入原文</span></button>
          <button className="button secondary hide-mid" aria-label="载入成都开学季文章" title="载入成都开学季文章" onClick={() => loadExample(chengduBackToSchoolArticle, '成都开学季文章')}><RefreshCcw aria-hidden="true" /><span>载入成都</span></button>
          <button className="button secondary status-button" aria-label={`运行校验，当前 ${report.issueCount} 项提醒`} title="运行校验" onClick={() => { setInspectorTab('validation'); setMobilePanel('validation'); }}>
            <ShieldCheck aria-hidden="true" /><span>校验</span><b>{report.issueCount}</b>
          </button>
          <button className="button primary" aria-label="复制微信 HTML" title="复制微信 HTML" onClick={copyHtml} disabled={!report.canExportSafely}><Clipboard aria-hidden="true" /><span>复制微信 HTML</span></button>
        </div>
      </header>

      <aside className="left-sidebar">
        <div className="sidebar-heading">
          <div><span className="eyebrow-label">ARTICLE MAP</span><h2>文章结构</h2></div>
          <button className="icon-button" aria-label={sidebarCollapsed ? '展开侧栏' : '折叠侧栏'} onClick={() => setSidebarCollapsed((value) => !value)}>
            {sidebarCollapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          </button>
        </div>

        <div className="sidebar-content">
          <nav className="outline-list" aria-label="文章内容大纲">
            {article.blocks.map((block, index) => (
              <button className={block.id === selectedBlockId ? 'active' : ''} key={block.id} onClick={() => selectFromOutline(block.id)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{BLOCK_LABELS[block.type]}</strong><small>{blockTitle(block)}</small></div>
                <ChevronRight aria-hidden="true" />
              </button>
            ))}
          </nav>

          <section className="example-switcher">
            <div className="section-label"><span>内置文章</span><small>切换会覆盖当前草稿</small></div>
            <button className={article.id === chengduBackToSchoolArticle.id ? 'active' : ''} onClick={() => loadExample(chengduBackToSchoolArticle, '成都开学季文章')}>
              <MapPin aria-hidden="true" />
              <div><strong>成都开学季</strong><small>课包特惠 · 待补门店信息</small></div>
              {article.id === chengduBackToSchoolArticle.id ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            </button>
            <button className={article.id === k11Article.id ? 'active' : ''} onClick={() => loadExample(k11Article, 'K11 暑期集训示例')}>
              <Mountain aria-hidden="true" />
              <div><strong>K11 暑期集训</strong><small>原始视觉参考文章</small></div>
              {article.id === k11Article.id ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            </button>
          </section>

          <section className="component-library">
            <div className="section-label"><span>组件库</span><small>点击添加到文末</small></div>
            <div className="component-grid">
              <button onClick={() => addBlockAtEnd('paragraph')}><AlignLeft aria-hidden="true" /><span>正文</span></button>
              <button onClick={() => addBlockAtEnd('sectionTitle')}><Sparkles aria-hidden="true" /><span>章节</span></button>
              <button onClick={() => addBlockAtEnd('image')}><ImageIcon aria-hidden="true" /><span>图片</span></button>
              <button onClick={() => addBlockAtEnd('callout')}><TextQuote aria-hidden="true" /><span>提示</span></button>
              <button onClick={() => addBlockAtEnd('facts')}><LayoutList aria-hidden="true" /><span>信息表</span></button>
              <button onClick={() => addBlockAtEnd('notice')}><CircleAlert aria-hidden="true" /><span>须知</span></button>
            </div>
          </section>
        </div>
      </aside>

      <main className="editor-workspace">
        <div className="workspace-heading">
          <div>
            <span className="eyebrow-label">STRUCTURED EDITOR</span>
            <h1>结构化编辑</h1>
            <p>{article.blocks.length} 个内容块 · 改动会实时同步到右侧预览</p>
          </div>
          <div className="workspace-heading-actions">
            <button className="button secondary tablet-preview-trigger" onClick={() => { setInspectorTab('preview'); setMobilePanel('preview'); }}><Smartphone aria-hidden="true" />打开预览</button>
            <button className="button secondary baseline-button" onClick={updateSourceBaseline}>设为模板</button>
          </div>
        </div>
        <EditorCanvas
          article={article}
          selectedBlockId={selectedBlockId}
          onSelect={setSelectedBlockId}
          onUpdate={updateBlock}
          onMove={moveBlock}
          onDuplicate={duplicateBlock}
          onDelete={deleteBlock}
          onAddAfter={addBlockAfter}
          onImageFile={handleImageFile}
        />
      </main>

      <aside className="inspector-panel">
        <div className="inspector-tabs" role="tablist" aria-label="检查器视图">
          <button role="tab" aria-selected={inspectorTab === 'preview'} className={inspectorTab === 'preview' ? 'active' : ''} onClick={() => setInspectorTab('preview')}><Smartphone aria-hidden="true" />手机预览</button>
          <button role="tab" aria-selected={inspectorTab === 'html'} className={inspectorTab === 'html' ? 'active' : ''} onClick={() => setInspectorTab('html')}><Code2 aria-hidden="true" />微信 HTML</button>
          <button role="tab" aria-selected={inspectorTab === 'validation'} className={inspectorTab === 'validation' ? 'active' : ''} onClick={() => setInspectorTab('validation')}><ShieldCheck aria-hidden="true" />校验 <b>{report.issueCount}</b></button>
        </div>

        {inspectorTab === 'preview' ? (
          <div className="preview-panel">
            <div className="preview-toolbar">
              <div className="segmented-control" aria-label="预览模式">
                <button className={previewMode === 'react' ? 'active' : ''} onClick={() => setPreviewMode('react')}>编辑预览</button>
                <button className={previewMode === 'export' ? 'active' : ''} onClick={() => setPreviewMode('export')}>导出预览</button>
              </div>
              <span>390px</span>
            </div>
            <div className="phone-stage">
              <div className="phone-frame">
                <div className="phone-status"><span>10:00</span><i /><i /></div>
                {previewMode === 'react' ? <ArticlePreview article={article} /> : <div className="export-preview" dangerouslySetInnerHTML={{ __html: exportedHtml }} />}
              </div>
            </div>
          </div>
        ) : null}

        {inspectorTab === 'html' ? (
          <div className="html-panel">
            <div className="panel-intro">
              <div><span className="eyebrow-label">INLINE HTML</span><h2>微信兼容代码</h2></div>
              <div className="panel-actions">
                <button className="button secondary compact" onClick={downloadHtml}><Download aria-hidden="true" />下载</button>
                <button className="button primary compact" onClick={copyHtml}><Clipboard aria-hidden="true" />复制</button>
              </div>
            </div>
            <div className="compatibility-note"><CircleAlert aria-hidden="true" /><p>本地图片需要在微信后台重新上传。代码已移除 class、脚本、外部样式和复杂布局。</p></div>
            <pre className="html-code"><code>{exportedHtml}</code></pre>
          </div>
        ) : null}

        {inspectorTab === 'validation' ? (
          <div className="validation-panel">
            <div className="panel-intro">
              <div><span className="eyebrow-label">PRE-FLIGHT</span><h2>导出前检查</h2></div>
              <span className={`readiness-badge ${report.canExportSafely ? 'ready' : 'blocked'}`}>{report.canExportSafely ? '可以导出' : '需要修复'}</span>
            </div>
            <div className="validation-summary">
              <strong>{report.issueCount === 0 ? '全部检查通过' : `${report.issueCount} 项需要留意`}</strong>
              <p>校验只报告差异，不会自动修改或删除文章内容。</p>
            </div>
            <div className="validation-list">
              {report.checks.map((check) => (
                <article className={`validation-item ${check.status}`} key={check.id}>
                  <StatusMark status={check.status} />
                  <div><strong>{check.label}</strong><p>{check.detail}</p></div>
                </article>
              ))}
            </div>
            <div className="validation-actions">
              <button className="button secondary" onClick={updateSourceBaseline}>更新模板</button>
              <button className="button primary" onClick={copyHtml} disabled={!report.canExportSafely}><Clipboard aria-hidden="true" />复制微信 HTML</button>
            </div>
          </div>
        ) : null}
      </aside>

      <nav className="mobile-nav" aria-label="移动端工作区">
        <button className={mobilePanel === 'outline' ? 'active' : ''} onClick={() => setMobilePanel('outline')}><LayoutList aria-hidden="true" /><span>大纲</span></button>
        <button className={mobilePanel === 'editor' ? 'active' : ''} onClick={() => setMobilePanel('editor')}><FileText aria-hidden="true" /><span>编辑</span></button>
        <button className={mobilePanel === 'preview' ? 'active' : ''} onClick={() => { setMobilePanel('preview'); setInspectorTab('preview'); }}><Smartphone aria-hidden="true" /><span>预览</span></button>
        <button className={mobilePanel === 'validation' ? 'active' : ''} onClick={() => { setMobilePanel('validation'); setInspectorTab('validation'); }}><ShieldCheck aria-hidden="true" /><span>校验</span></button>
      </nav>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={importText} />
      {toast ? <div className="toast" role="status"><CircleCheck aria-hidden="true" />{toast}</div> : null}
    </div>
  );
}
