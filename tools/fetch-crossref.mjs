/**
 * 文献种子采集器：调用 Crossref 开放 REST API（无需 API Key）拉取真实文献元数据。
 * 产出的每条记录都带真实 DOI 与 https://doi.org/ 链接，可逐条点开验证。
 *
 * 用法： node tools/fetch-crossref.mjs [--rows 20]
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MAILTO = 'thermal-radar@example.com';
const UA = `ThermalInsightRadar/1.0 (mailto:${MAILTO})`;

const QUERIES = [
  // 透明陶瓷隔热 / 铯钨青铜
  { q: 'cesium tungsten bronze near-infrared shielding', board: 'dc', subs: ['dc-1', 'dc-2'] },
  { q: 'cesium tungsten bronze CsxWO3 nanoparticle', board: 'dc', subs: ['dc-1'] },
  { q: 'CsxWO3 transparent thermal insulation coating', board: 'dc', subs: ['dc-1', 'dc-3'] },
  { q: 'tungsten bronze nanoparticle solar control film', board: 'dc', subs: ['dc-4'] },
  { q: 'transparent heat insulation coating glass energy saving', board: 'dc', subs: ['dc-3', 'dc-4'] },
  { q: 'cesium tungsten bronze nanocomposite dispersion stability', board: 'dc', subs: ['dc-1', 'dc-2'] },
  { q: 'tungsten bronze electrochromic near infrared absorption', board: 'dc', subs: ['dc-1', 'dc-4'] },
  { q: 'near-infrared shielding window film visible transmittance haze', board: 'dc', subs: ['dc-4'] },
  { q: 'transparent thermal insulation glazing laminated glass', board: 'dc', subs: ['dc-4', 'dc-3'] },
  { q: 'nanoparticle dispersion coating durability weathering', board: 'dc', subs: ['dc-2', 'dc-3'] },
  // 辐射制冷
  { q: 'passive daytime radiative cooling coating', board: 'rc', subs: ['rc-3'] },
  { q: 'radiative cooling porous polymer film', board: 'rc', subs: ['rc-4'] },
  { q: 'silica microsphere radiative cooling paint', board: 'rc', subs: ['rc-1', 'rc-3'] },
  { q: 'radiative cooling barium sulfate particle solar reflectance', board: 'rc', subs: ['rc-1'] },
  { q: 'radiative cooling slurry scalable manufacturing', board: 'rc', subs: ['rc-2'] },
  { q: 'subambient daytime radiative cooling emitter design', board: 'rc', subs: ['rc-1', 'rc-4'] },
  { q: 'radiative cooling building energy saving simulation', board: 'rc', subs: ['rc-3'] },
  { q: 'radiative cooling personal thermal management textile', board: 'rc', subs: ['rc-4', 'rc-3'] },
  { q: 'radiative cooling film roll-to-roll fabrication', board: 'rc', subs: ['rc-4', 'rc-2'] },
  { q: 'radiative cooling cooling power measurement standard', board: 'rc', subs: ['rc-3', 'rc-1'] },
  { q: 'colored radiative cooling coating optical design', board: 'rc', subs: ['rc-3'] },
  { q: 'radiative cooling ceramic hollow microsphere composite', board: 'rc', subs: ['rc-1', 'rc-2'] }
];

const SUB_HINTS = {
  'dc-1': ['powder', 'particle', 'nanoparticle', 'synthesis', 'nanocrystal', 'bronze', 'cesium tungsten'],
  'dc-2': ['dispersion', 'slurry', 'sol', 'colloidal', 'paste', 'nanofluid'],
  'dc-3': ['coating', 'paint', 'film-forming', 'spray', 'coated'],
  'dc-4': ['film', 'foil', 'laminate', 'laminated', 'pet', 'pvb', 'membrane', 'window', 'glazing'],
  'rc-1': ['filler', 'particle', 'microsphere', 'sphere', 'barium sulfate', 'alumina', 'silica', 'zirconia', 'powder', 'titania'],
  'rc-2': ['slurry', 'dispersion', 'suspension', 'paste', 'scalable'],
  'rc-3': ['coating', 'paint', 'pigment', 'brush', 'spray'],
  'rc-4': ['film', 'membrane', 'sheet', 'roll', 'laminate', 'textile', 'fabric']
};

const stripTags = (s) =>
  (s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const normTitle = (s) => stripTags(s).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '');

function classifiySubs(board, text, fallback) {
  const hits = new Set();
  const lower = text.toLowerCase();
  for (const [sub, words] of Object.entries(SUB_HINTS)) {
    if (!sub.startsWith(board)) continue;
    if (words.some((w) => lower.includes(w))) hits.add(sub);
  }
  return hits.size ? [...hits] : [...fallback];
}

async function crossref(query, rows) {
  const url = new URL('https://api.crossref.org/works');
  url.searchParams.set('query.bibliographic', query);
  url.searchParams.set('rows', String(rows));
  url.searchParams.set('filter', 'from-pub-date:2014-01-01,type:journal-article');
  url.searchParams.set('select', 'DOI,title,author,container-title,issued,abstract,is-referenced-by-count,URL,subject,publisher');
  url.searchParams.set('mailto', MAILTO);
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Crossref HTTP ${res.status}`);
  const json = await res.json();
  return json.message?.items ?? [];
}

function normalize(item, q, idx) {
  const title = stripTags((item.title || [])[0] || '').trim();
  if (!title) return null;
  const doi = (item.DOI || '').toLowerCase();
  if (!doi) return null;
  const authors = (item.author || [])
    .map((a) => [a.given, a.family].filter(Boolean).join(' ').trim() || a.name || '')
    .filter(Boolean);
  const year =
    item.issued?.['date-parts']?.[0]?.[0] ??
    null;
  const journal = stripTags((item['container-title'] || [])[0] || '');
  const abstract = stripTags(item.abstract || '').slice(0, 900);
  const subSource = `${title} ${abstract}`;
  return {
    id: `lit-${doi.replace(/[^a-z0-9]/g, '-')}`,
    title,
    authors: authors.slice(0, 6),
    authorCount: authors.length,
    journal,
    publisher: item.publisher || '',
    year,
    doi,
    url: `https://doi.org/${doi}`,
    citations: item['is-referenced-by-count'] ?? 0,
    abstract,
    board: q.board,
    subs: classifiySubs(q.board, subSource, q.subs),
    keywords: (item.subject || []).slice(0, 6),
    source: 'Crossref REST API',
    retrievedAt: new Date().toISOString().slice(0, 10),
    query: q.q,
    order: idx
  };
}

async function main() {
  const rowsArg = process.argv.indexOf('--rows');
  const rows = rowsArg > -1 ? Number(process.argv[rowsArg + 1]) : 20;
  const byDoi = new Map();
  const log = [];

  for (const q of QUERIES) {
    process.stdout.write(`[crossref] ${q.q} ... `);
    try {
      const items = await crossref(q.q, rows);
      let added = 0;
      items.forEach((item, i) => {
        const rec = normalize(item, q, i);
        if (!rec) return;
        if (byDoi.has(rec.doi)) {
          const prev = byDoi.get(rec.doi);
          prev.subs = [...new Set([...prev.subs, ...rec.subs])];
          return;
        }
        byDoi.set(rec.doi, rec);
        added += 1;
      });
      log.push({ query: q.q, returned: items.length, added });
      console.log(`返回 ${items.length}，新增 ${added}`);
    } catch (err) {
      console.log(`失败：${err.message}`);
      log.push({ query: q.q, error: err.message });
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  const fetched = [...byDoi.values()].sort((a, b) => (b.year || 0) - (a.year || 0) || b.citations - a.citations);

  // 合并模式：保留库里非 Crossref 来源的条目（X-Mol 粘贴导入 / 手工补录），
  // 否则每天跑一次 CI 就会把它们冲掉。
  const target = path.join(ROOT, 'data', 'literature.json');
  let prev = { meta: {}, items: [] };
  try {
    prev = JSON.parse(await fs.readFile(target, 'utf8'));
  } catch {
    /* 首次运行，无既有文件 */
  }
  const keptManual = (prev.items || []).filter((it) => !/Crossref/i.test(it.source || ''));
  const manualKeys = new Set(keptManual.map((it) => it.doi || it.id));
  const merged = [...keptManual, ...fetched.filter((it) => !manualKeys.has(it.doi || it.id))]
    .sort((a, b) => (b.year || 0) - (a.year || 0) || (b.citations || 0) - (a.citations || 0))
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const all = merged;

  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      provider: 'Crossref REST API (https://api.crossref.org)',
      license: 'Crossref 元数据按开放政策提供；摘要版权归原出版方',
      filter: 'from-pub-date:2014-01-01, type:journal-article',
      total: all.length,
      crossrefItems: fetched.length,
      manualKept: keptManual.length,
      queries: log
    },
    items: all
  };

  await fs.mkdir(path.join(ROOT, 'data'), { recursive: true });
  await fs.writeFile(target, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`\n共写入 ${all.length} 条文献 -> data/literature.json`);
  console.log(`  Crossref ${fetched.length} 条 · 保留手工/导入条目 ${keptManual.length} 条`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
