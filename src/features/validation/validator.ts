import {
  extractArticleText,
  normalizeVisibleText,
  type ArticleDocument,
} from '../../domain/article';
import { renderWechatHtml } from '../export/wechatExporter';

export type CheckStatus = 'pass' | 'warning' | 'error';

export type ValidationCheck = {
  id: 'content' | 'assets' | 'html';
  label: string;
  status: CheckStatus;
  detail: string;
};

export type ValidationReport = {
  checks: ValidationCheck[];
  issueCount: number;
  canExportSafely: boolean;
};

function contentCheck(article: ArticleDocument): ValidationCheck {
  const source = normalizeVisibleText(article.sourceText);
  const current = normalizeVisibleText(extractArticleText(article.blocks));

  if (source === current) {
    return {
      id: 'content',
      label: '原文一致',
      status: 'pass',
      detail: `当前可见文字与导入基线一致，共 ${current.length} 个规范化字符。`,
    };
  }

  const max = Math.min(source.length, current.length);
  let firstDifference = 0;
  while (firstDifference < max && source[firstDifference] === current[firstDifference]) {
    firstDifference += 1;
  }

  return {
    id: 'content',
    label: '原文发生变化',
    status: 'warning',
    detail: `基线 ${source.length} 字，当前 ${current.length} 字；首次差异约在第 ${firstDifference + 1} 个字符。请确认这是有意编辑。`,
  };
}

function assetCheck(article: ArticleDocument): ValidationCheck {
  const images = article.blocks.flatMap((block) => {
    if (block.type === 'image') return [{ src: block.src }];
    if (block.type === 'horizontalGallery') return block.items.map((item) => ({ src: item.src }));
    return [];
  });
  const missing = images.filter((block) => !block.src.trim());
  const local = images.filter((block) => block.src.startsWith('/') || block.src.startsWith('data:'));

  if (missing.length > 0) {
    return {
      id: 'assets',
      label: '图片缺失',
      status: 'error',
      detail: `${missing.length} 张图片没有来源地址，请补充后再导出。`,
    };
  }

  if (local.length > 0) {
    return {
      id: 'assets',
      label: '图片待微信上传',
      status: 'warning',
      detail: `${local.length} 张图片使用本地地址。粘贴排版后，请在微信编辑器中重新上传或替换这些图片。`,
    };
  }

  return {
    id: 'assets',
    label: '图片地址完整',
    status: 'pass',
    detail: `${images.length} 张图片均有可用的远程地址和替代文本。`,
  };
}

function htmlCheck(article: ArticleDocument): ValidationCheck {
  const html = renderWechatHtml(article);
  const forbiddenPatterns = [
    /<script\b/i,
    /<link\b/i,
    /\sclass=/i,
    /\son[a-z]+=/i,
    /javascript:/i,
    /display\s*:\s*(flex|grid)/i,
    /position\s*:\s*(fixed|sticky)/i,
  ];
  const hits = forbiddenPatterns.filter((pattern) => pattern.test(html));

  if (hits.length > 0) {
    return {
      id: 'html',
      label: '发现兼容风险',
      status: 'error',
      detail: `导出结果命中 ${hits.length} 项禁用规则，请检查 HTML 生成器。`,
    };
  }

  const paragraphs = html.match(/<p style=/g)?.length ?? 0;
  return {
    id: 'html',
    label: '微信结构安全',
    status: 'pass',
    detail: `未发现脚本、外部样式、class 或不稳定布局；共生成 ${paragraphs} 个可编辑段落。`,
  };
}

export function validateArticle(article: ArticleDocument): ValidationReport {
  const checks = [contentCheck(article), assetCheck(article), htmlCheck(article)];
  const issueCount = checks.filter((check) => check.status !== 'pass').length;

  return {
    checks,
    issueCount,
    canExportSafely: checks.every((check) => check.status !== 'error'),
  };
}
