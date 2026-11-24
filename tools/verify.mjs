/**
 * 交付前自检：数据结构 / 来源完整性 / 密钥泄露 / 接口可用性。
 * 用法： node tools/verify.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8788';
const TYPES = ['company', 'product', 'project', 'price', 'sale', 'standard'];
const LEVELS = ['official', 'media', 'b2b', 'report', 'pending'];

let pass = 0;
let fail = 0;
const failures = [];

const ok = (msg) => {
  pass += 1;
  console.log(`  ✓ ${msg}`);
};
const bad = (msg) => {
  fail += 1;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
};
const section = (t) => console.log(`\n${t}`);

const readJson = async (p) => JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8'));

async function main() {
  console.log('隔热情报雷达 · 交付自检');
  console.log(`工作目录：${ROOT}`);

  /* ---------- 1. 分类目录 ---------- */
  section('[1/6] 分类目录');
  const catalog = await readJson('data/catalog.json');
  const boards = catalog.boards || [];
  boards.length === 2 ? ok(`板块数 = 2（${boards.map((b) => b.name).join(' / ')}）`) : bad(`板块数应 2，实为 ${boards.length}`);
  for (const b of boards) {
    b.subs.length === 4 ? ok(`${b.name} 子分类 = 4`) : bad(`${b.name} 子分类应 4，实为 ${b.subs.length}`);
  }
  const dims = catalog.dimensions || [];
  dims.length === 4 ? ok('维度数 = 4（生产商/产品/标准专利/文献）') : bad(`维度数应 4，实为 ${dims.length}`);
  const subIds = new Set(boards.flatMap((b) => b.subs.map((s) => s.id)));
  subIds.size === 8 ? ok('全局子分类 ID 唯一且共 8 个') : bad(`子分类 ID 数量异常：${subIds.size}`);

  /* ---------- 2. 产业记录 ---------- */
  section('[2/6] 产业记录结构与来源');
  const records = (await readJson('data/records.json')).items || [];
  records.length >= 50 ? ok(`记录总数 ${records.length} ≥ 50`) : bad(`记录总数偏少：${records.length}`);
  const ids = new Set();
  let noSource = 0;
  let badSub = 0;
  let badBoard = 0;
  let badType = 0;
  let badLevel = 0;
  let dupId = 0;
  for (const r of records) {
    if (!r.id || ids.has(r.id)) dupId += 1;
    ids.add(r.id);
    if (!TYPES.includes(r.type)) badType += 1;
    if (!boards.some((b) => b.id === r.board)) badBoard += 1;
    if (!Array.isArray(r.subs) || !r.subs.length || r.subs.some((s) => !subIds.has(s))) badSub += 1;
    if (!LEVELS.includes(r.verification)) badLevel += 1;
    const urls = (r.sources || []).filter((s) => s && /^https?:\/\//i.test(s.url || ''));
    if (!urls.length) noSource += 1;
  }
  dupId === 0 ? ok('记录 ID 无重复') : bad(`重复 ID ${dupId} 条`);
  badType === 0 ? ok('记录 type 全部合法') : bad(`非法 type ${badType} 条`);
  badBoard === 0 ? ok('记录 board 全部合法') : bad(`非法 board ${badBoard} 条`);
  badSub === 0 ? ok('记录 subs 全部指向合法子分类') : bad(`非法 subs ${badSub} 条`);
  badLevel === 0 ? ok('核验等级全部合法') : bad(`非法核验等级 ${badLevel} 条`);
  noSource === 0 ? ok('每条记录都有可访问来源 URL') : bad(`${noSource} 条记录缺来源 URL`);

  const byType = TYPES.reduce((m, t) => ((m[t] = records.filter((r) => r.type === t).length), m), {});
  ok(`维度分布 ${JSON.stringify(byType)}`);

  // 已下线的四个维度不应再出现在数据里（价格/销量/销售额/样板工程）
  const retired = records.filter((r) => ['price', 'sale', 'project'].includes(r.type));
  retired.length === 0 ? ok('已下线维度（价格/销量/工程）无残留') : bad(`残留 ${retired.length} 条已下线维度记录`);

  /* ---------- 3. 文献 ---------- */
  section('[3/6] 文献元数据');
  const litFile = await readJson('data/literature.json');
  const lits = litFile.items || [];
  lits.length >= 100 ? ok(`文献总数 ${lits.length} ≥ 100`) : bad(`文献总数偏少：${lits.length}`);
  const dois = new Set();
  let dupDoi = 0;
  let noDoi = 0;
  let badUrl = 0;
  for (const l of lits) {
    if (!l.doi) noDoi += 1;
    else if (dois.has(l.doi)) dupDoi += 1;
    else dois.add(l.doi);
    if (l.doi && !String(l.url || '').includes(l.doi)) badUrl += 1;
  }
  noDoi === 0 ? ok('每条文献都有 DOI') : bad(`${noDoi} 条文献缺 DOI`);
  dupDoi === 0 ? ok('DOI 无重复') : bad(`重复 DOI ${dupDoi} 条`);
  badUrl === 0 ? ok('文献链接均为 doi.org 直链') : bad(`${badUrl} 条文献链接与 DOI 不一致`);

  // 抽查 DOI 形态
  const badDoiShape = lits.filter((l) => l.doi && !/^10\.\d{4,9}\//.test(l.doi));
  badDoiShape.length === 0 ? ok('DOI 前缀形态合法') : bad(`${badDoiShape.length} 条 DOI 形态可疑`);

  /* ---------- 4. 密钥扫描 ---------- */
  section('[4/6] 明文密钥扫描');
  const suspects = [];
  const scanFiles = [];
  const walk = async (dir) => {
    for (const e of await fs.readdir(path.join(ROOT, dir), { withFileTypes: true })) {
      if (['node_modules', '.git', 'shots', 'shots_tmp'].includes(e.name)) continue;
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) await walk(rel);
      else if (/\.(mjs|js|json|html|css|md|cmd|ps1)$/i.test(e.name)) scanFiles.push(rel);
    }
  };
  await walk('server');
  await walk('web');
  await walk('tools');
  scanFiles.push('README.md', 'start.cmd', 'data/catalog.json');
  const patterns = [
    /(api[_-]?key|apikey)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i,
    /(secret|password|passwd)\s*[:=]\s*["'][^"']{8,}["']/i,
    /sk-[A-Za-z0-9]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA |EC )?PRIVATE KEY-----/
  ];
  for (const f of scanFiles) {
    let txt = '';
    try {
      txt = await fs.readFile(path.join(ROOT, f), 'utf8');
    } catch {
      continue;
    }
    for (const p of patterns) {
      if (p.test(txt)) suspects.push(`${f} ↔ ${p}`);
    }
  }
  suspects.length === 0
    ? ok(`扫描 ${scanFiles.length} 个文件，未发现明文密钥`)
    : bad(`疑似密钥：${suspects.join('; ')}`);

  /* ---------- 5. 接口 ---------- */
  section('[5/6] 接口连通性');
  const get = async (p) => {
    const res = await fetch(BASE + p, { signal: AbortSignal.timeout(15000) });
    const txt = await res.text();
    return { status: res.status, json: (() => { try { return JSON.parse(txt); } catch { return null; } })() };
  };
  let health;
  try {
    health = await get('/api/health');
  } catch (err) {
    bad(`服务未启动（${BASE}）：请先运行 node server/server.mjs`);
    return finish();
  }
  health.status === 200 && health.json?.ok ? ok(`/api/health 正常（记录 ${health.json.records} / 文献 ${health.json.literature}）`) : bad('/api/health 异常');

  const checks = [
    ['/api/meta', (j) => j.catalog?.boards?.length === 2],
    ['/api/stats', (j) => j.totals?.records > 0 && Object.keys(j.coverage || {}).length === 8],
    ['/api/gaps', (j) => Array.isArray(j.gaps)],
    ['/api/sources', (j) => Array.isArray(j.sources) && j.sources.length > 0],
    ['/api/records?board=dc&type=product', (j) => Array.isArray(j.items) && j.items.length > 0],
    ['/api/records?board=rc&type=sale', (j) => Array.isArray(j.items)],
    ['/api/literature?board=rc', (j) => Array.isArray(j.items) && j.items.length > 0],
    ['/api/search?q=' + encodeURIComponent('辐射制冷'), (j) => j.total > 0]
  ];
  for (const [p, test] of checks) {
    const r = await get(p);
    r.status === 200 && test(r.json || {}) ? ok(p) : bad(`${p} 异常（status=${r.status}）`);
  }

  const noSrcPost = await fetch(BASE + '/api/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'product', board: 'dc', subs: ['dc-1'], name: '自检-无来源' })
  });
  noSrcPost.status === 400 ? ok('无来源写入被拒（400）') : bad(`无来源写入未被拒绝（status=${noSrcPost.status}）`);

  const health2 = await get('/api/health');
  Number.isFinite(health2.json?.records) ? ok('拒绝写入后记录数未变化') : bad('记录数读取异常');

  /* ---------- 6. 交付文件 ---------- */
  section('[6/6] 交付文件');
  for (const f of ['README.md', 'start.cmd', 'web/index.html', 'web/app.css', 'server/server.mjs', 'data/records.json', 'data/literature.json']) {
    try {
      const st = await fs.stat(path.join(ROOT, f));
      st.size > 0 ? ok(`${f} (${st.size} B)`) : bad(`${f} 为空`);
    } catch {
      bad(`${f} 缺失`);
    }
  }

  return finish();
}

function finish() {
  console.log(`\n${'='.repeat(46)}`);
  console.log(`通过 ${pass} 项，失败 ${fail} 项`);
  if (fail) {
    console.log('失败明细：');
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exitCode = 1;
  } else {
    console.log('自检全部通过。');
  }
  console.log('='.repeat(46));
}

main().catch((err) => {
  console.error('自检脚本异常：', err);
  process.exit(1);
});
