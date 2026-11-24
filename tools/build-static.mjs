/**
 * 静态构建：把站点导出为纯静态文件（dist/），可直接放到 GitHub Pages / Cloudflare Pages /
 * Netlify / Vercel / 对象存储 / 任意静态服务器。
 *
 * 做法：复用 server/store.mjs 的聚合逻辑，把只读接口的结果预先落成 dist/api/*.json，
 * 前端在 window.__STATIC__ === true 时改用「一次加载 + 本地筛选」，因此不需要任何后端。
 *
 * 用法： node tools/build-static.mjs [--out dist]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { Store } from '../server/store.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const outArg = process.argv.indexOf('--out');
const OUT = path.resolve(ROOT, outArg > -1 ? process.argv[outArg + 1] : 'dist');
const WEB = path.join(ROOT, 'web');

const copyDir = async (src, dest) => {
  await fs.mkdir(dest, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
};

const writeJson = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data), 'utf8');
};

async function main() {
  const store = await new Store(ROOT).init();
  await fs.rm(OUT, { recursive: true, force: true });
  await copyDir(WEB, OUT);

  const apiDir = path.join(OUT, 'api');
  const meta = {
    catalog: store.taxonomy,
    counts: { records: store.allRecords.length, literature: store.allLiterature.length },
    recordsUpdatedAt: store.records.meta?.updatedAt || null,
    literature: store.literature.meta || {}
  };

  await writeJson(path.join(apiDir, 'meta.json'), meta);
  await writeJson(path.join(apiDir, 'stats.json'), store.stats());
  await writeJson(path.join(apiDir, 'gaps.json'), { gaps: store.gaps() });
  await writeJson(path.join(apiDir, 'records.json'), { total: store.allRecords.length, items: store.allRecords });
  await writeJson(path.join(apiDir, 'literature.json'), {
    total: store.allLiterature.length,
    items: store.allLiterature,
    meta: store.literature.meta
  });

  // 来源登记表（与 /api/sources 同构）
  const map = new Map();
  for (const r of store.allRecords) {
    for (const s of r.sources || []) {
      if (!s.url) continue;
      const prev = map.get(s.url) || { url: s.url, title: s.title || '', kind: s.kind || '', usedBy: [] };
      prev.usedBy.push({ id: r.id, name: r.name || r.org || '', type: r.type, accessed: s.accessed || '' });
      map.set(s.url, prev);
    }
  }
  await writeJson(path.join(apiDir, 'sources.json'), {
    sources: [...map.values()].sort((a, b) => b.usedBy.length - a.usedBy.length),
    literatureProvider: store.literature.meta || {}
  });

  const buildTime = new Date().toISOString();
  await writeJson(path.join(apiDir, 'build.json'), {
    buildTime,
    records: store.allRecords.length,
    literature: store.allLiterature.length,
    mode: 'static'
  });

  // 注入静态标记 + 构建时间，并把资源路径改为相对路径（支持 GitHub Pages 子目录部署）
  const indexPath = path.join(OUT, 'index.html');
  let html = await fs.readFile(indexPath, 'utf8');
  html = html
    .replace('href="/app.css"', 'href="app.css"')
    .replace('src="/js/app.js"', 'src="js/app.js"')
    .replace(
      '<body>',
      `<body>\n  <script>window.__STATIC__ = true; window.__BUILD__ = ${JSON.stringify(buildTime)};</script>`
    );
  await fs.writeFile(indexPath, html, 'utf8');

  // GitHub Pages 的 SPA 兜底与 Jekyll 关闭
  await fs.copyFile(indexPath, path.join(OUT, '404.html'));
  await fs.writeFile(path.join(OUT, '.nojekyll'), '', 'utf8');

  const size = (await totalSize(OUT)) / 1024 / 1024;
  console.log(`✓ 静态站点已生成：${path.relative(ROOT, OUT)}/`);
  console.log(`  记录 ${store.allRecords.length} 条 · 文献 ${store.allLiterature.length} 条 · 体积 ${size.toFixed(2)} MB`);
  console.log(`  入口：${path.relative(ROOT, indexPath)}`);
}

async function totalSize(dir) {
  let sum = 0;
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sum += await totalSize(p);
    else sum += (await fs.stat(p)).size;
  }
  return sum;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
