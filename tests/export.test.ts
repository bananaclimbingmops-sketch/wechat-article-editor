import { describe, expect, it } from 'vitest';
import { k11Article } from '../src/examples/k11';
import { chengduBackToSchoolArticle } from '../src/examples/chengduBackToSchool';
import { renderWechatHtml } from '../src/features/export/wechatExporter';
import { validateArticle } from '../src/features/validation/validator';

describe('微信 HTML 导出器', () => {
  it('生成内联样式且不包含应用层结构', () => {
    const html = renderWechatHtml(k11Article);

    expect(html).toContain('<p style=');
    expect(html).toContain('<img src=');
    expect(html).not.toMatch(/<script\b/i);
    expect(html).not.toMatch(/\sclass=/i);
    expect(html).not.toMatch(/display\s*:\s*(flex|grid)/i);
    expect(html).not.toContain('**');
    expect(html).toContain('background-color:rgb(255, 218, 42)');
    expect(html).toContain('box-shadow:7px 9px 0 rgb(137, 84, 33)');
    expect(html).toContain('padding:0 6px 20px');
    expect(html).not.toContain('padding:0 20px 20px');
    expect(html).toContain('background-color:rgb(255, 246, 224)');
    expect(html).toContain('“绿通”指香蕉攀岩内部专为青少年设立的绿色通行证');
    expect(html).not.toMatch(/<h1\b/i);
    expect(html).not.toContain('white-space:nowrap');
  });

  it('K11 初始内容与原文基线一致', () => {
    const report = validateArticle(k11Article);
    const content = report.checks.find((check) => check.id === 'content');
    const html = report.checks.find((check) => check.id === 'html');

    expect(content?.status).toBe('pass');
    expect(html?.status).toBe('pass');
    expect(report.canExportSafely).toBe(true);
  });

  it('成都开学季文章保留全部优惠条件并可安全导出', () => {
    const html = renderWechatHtml(chengduBackToSchoolArticle);
    const report = validateArticle(chengduBackToSchoolArticle);
    const assetCheck = report.checks.find((check) => check.id === 'assets');

    expect(html).toContain('2026年8月29日—9月13日');
    expect(html).toContain('10节 + 1节');
    expect(html).toContain('20节 + 1节');
    expect(html).toContain('8月29日—9月13日 · 限时特惠');
    expect(html).toContain('10节 / 20节，加赠1节');
    expect(html).toContain('font-size:20px');
    expect(html).toContain('✦ 开学季限定加赠');
    expect(html).toContain('◇ 40节 / 60节课包特别说明');
    expect(html).toContain('不与其他优惠同享');
    expect(html).toContain('体验课赠送');
    expect(html).toContain('40节、60节课包不参与本次优惠');
    expect(html.match(/<img src=/g)).toHaveLength(9);
    expect(html).toContain('/assets/k11/camp-friends.jpg');
    expect(html).toContain('/assets/k11/coach-guidance.jpg');
    expect(html).toContain('/assets/k11/class-briefing.jpg');
    expect(html).toContain('/assets/k11/family-support.jpg');
    expect(html).toContain('/assets/chengdu/private-course.png');
    expect(html).toContain('/assets/chengdu/little-banana-package.png');
    expect(html).toContain('/assets/chengdu/stores/icd.png');
    expect(html).toContain('/assets/chengdu/stores/capita-tianfu.png');
    expect(html).toContain('/assets/chengdu/stores/cosmo.png');
    expect(html).toContain('overflow-x:auto');
    expect(html).toContain('white-space:nowrap');
    expect(html).toContain('左右滑动，选择报名门店');
    expect(assetCheck?.status).toBe('warning');
    expect(report.canExportSafely).toBe(true);
  });
});
