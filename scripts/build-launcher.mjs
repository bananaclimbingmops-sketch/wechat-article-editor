import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const distDirectory = resolve(projectDirectory, 'dist');
const distHtml = await readFile(resolve(distDirectory, 'index.html'), 'utf8');

const scriptSource = distHtml.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)?.[1];
const stylesheetSource = distHtml.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)?.[1];

if (!scriptSource || !stylesheetSource) {
  throw new Error('无法从 dist/index.html 定位构建后的脚本或样式文件。');
}

const fromDist = (source) => resolve(distDirectory, source.replace(/^\.\//, '').replace(/^\//, ''));
const css = await readFile(fromDist(stylesheetSource), 'utf8');
const bundledJavaScript = await readFile(fromDist(scriptSource), 'utf8');

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(resolve(directory, entry.name), relativePath));
    else files.push(relativePath);
  }
  return files;
}

const mimeTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'],
]);

let javascript = bundledJavaScript;
const publicAssetsDirectory = resolve(projectDirectory, 'public/assets');
for (const relativePath of await listFiles(publicAssetsDirectory)) {
  const extension = relativePath.slice(relativePath.lastIndexOf('.')).toLowerCase();
  const mimeType = mimeTypes.get(extension);
  if (!mimeType) continue;
  const data = await readFile(resolve(publicAssetsDirectory, relativePath));
  const dataUri = `data:${mimeType};base64,${data.toString('base64')}`;
  javascript = javascript.replaceAll(`/assets/${relativePath}`, dataUri);
}

javascript = javascript
  .replaceAll('/assets/', './assets/')
  .replaceAll('</script', '<\\/script');

// Fail the build if the inlined application bundle is no longer valid JS.
new Function(javascript);

const launcher = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="双击即可打开的微信公众号文章工作台" />
    <title>微信公众号文章工作台</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${javascript}</script>
  </body>
</html>
`;

const launcherPath = resolve(projectDirectory, '一键打开公众号编辑器.html');
await writeFile(launcherPath, launcher, 'utf8');
console.log(`已生成：${launcherPath}`);
