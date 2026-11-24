/**
 * 静态产物自检（CI 用）：不依赖运行中的服务，直接检查 dist/ 与 data/。
 * 用法： node tools/verify-static.mjs [--dir dist]
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const argv = process.argv.slice(2);
const dirArg = argv.indexOf('--dir');
const DIST = path.resolve(ROOT, dirArg > -1 ? argv[dirArg + 1] : 'dist');

let pass = 0;
let fail = 0;
const ok = (m) => (pass++, console.log(`  ✓ ${m}`));
const bad = (m) => (fail++, console.log(`  ✗ ${m}`));

const readJson = async (p) => JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8'));
const exists = async (p) => {
  try {
    const st = await fs.stat(path.join(ROOT, p));
    return st.size > 0;
  } catch {
    return false;
  }
};

async function main() {
  console.log('静态产物自检');

  for (const f of ['dist/index.html', 'dist/app.css', 'dist/js/app.js', 'dist/api/meta.json', 'dist/api/stats.json', 'dist/api/records.json', 'dist/api/literature.json', 'dist/api/sources.json', 'dist/api/gaps.json', 'dist/404.html']) {
    (await exists(f)) ? ok(f) : bad(`${f} 缺失或为空`);
  }
  // .nojekyll 本来就是空文件，只检查存在
  try {
    await fs.access(path.join(ROOT, 'dist/.nojekyll'));
    ok('dist/.nojekyll');
  } catch {
    bad('dist/.nojekyll 缺失');
  }

  const html = await fs.readFile(path.join(ROOT, 'dist/index.html'), 'utf8');
  html.includes('window.__STATIC__ = true') ? ok('index.html 已注入静态标记') : bad('index.html 缺少 window.__STATIC__');
  !html.includes('href="/app.css"') ? ok('资源为相对路径（支持子目录部署）') : bad('仍有绝对路径 /app.css');

  const records = await readJson('dist/api/records.json');
  const literature = await readJson('dist/api/literature.json');
  const stats = await readJson('dist/api/stats.json');

  records.items.length >= 50 ? ok(`records.json ${records.items.length} 条`) : bad(`records.json 记录过少：${records.items.length}`);
  literature.items.length >= 100 ? ok(`literature.json ${literature.items.length} 条`) : bad(`literature.json 文献过少：${literature.items.length}`);
  stats.totals?.records === records.items.length ? ok('stats 与 records 数量一致') : bad('stats 与 records 数量不一致');

  const noSrc = records.items.filter((r) => !(r.sources || []).some((s) => /^https?:\/\//i.test(s.url || '')));
  noSrc.length === 0 ? ok('每条记录都有来源 URL') : bad(`${noSrc.length} 条记录缺来源`);

  const retired = records.items.filter((r) => ['price', 'sale', 'project'].includes(r.type));
  retired.length === 0 ? ok('无已下线维度残留') : bad(`残留 ${retired.length} 条已下线维度`);

  const noDoi = literature.items.filter((l) => !l.doi);
  noDoi.length === 0 ? ok('每条文献都有 DOI') : bad(`${noDoi.length} 条文献缺 DOI`);

  // 明文密钥扫描（只看 dist 与 data）
  const suspects = [];
  const scan = async (rel) => {
    const txt = await fs.readFile(path.join(ROOT, rel), 'utf8');
    if (/(api[_-]?key|secret|password)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i.test(txt)) suspects.push(rel);
    if (/sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}/.test(txt)) suspects.push(rel);
  };
  for (const f of ['dist/api/meta.json', 'dist/api/records.json', 'dist/api/literature.json', 'dist/js/app.js', 'dist/js/pages.js', 'dist/js/api.js', 'dist/index.html']) {
    await scan(f);
  }
  suspects.length === 0 ? ok('未发现明文密钥') : bad(`疑似密钥：${suspects.join(', ')}`);

  console.log(`\n通过 ${pass} 项，失败 ${fail} 项`);
  if (fail) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
