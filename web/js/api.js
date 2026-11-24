/** 与后端 REST API 的唯一通道；静态托管时切换为「一次加载 + 本地筛选」 */
export const isStatic = typeof window !== 'undefined' && window.__STATIC__ === true;
export const buildTime = typeof window !== 'undefined' ? window.__BUILD__ || null : null;

const cache = new Map();

function url(p) {
  // 相对路径，兼容 GitHub Pages 子目录部署（/repo/ 下也能取到）
  return isStatic ? `${p}.json` : p;
}

async function getJson(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(url(path), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${path} 请求失败：HTTP ${res.status}`);
  const data = await res.json();
  cache.set(path, data);
  return data;
}

async function request(path, options = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`响应不是 JSON: ${text.slice(0, 120)}`);
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const READONLY_MSG = '当前为静态托管（只读）模式：数据由每日构建产出，页面不支持在线写入。';

/* ---------------- 本地筛选（与 server/store.mjs 的语义保持一致） ---------------- */

const SORTERS = {
  recent: (a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')),
  name: (a, b) => String(a.name || a.org || '').localeCompare(String(b.name || b.org || ''), 'zh'),
  year: (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0)
};

function filterRecords(all, { board, sub, type, q, verification, sort = 'recent', limit = 500 } = {}) {
  let list = all.slice();
  if (board) list = list.filter((r) => r.board === board);
  if (sub) list = list.filter((r) => (r.subs || []).includes(sub));
  if (type) list = list.filter((r) => r.type === type);
  if (verification) list = list.filter((r) => r.verification === verification);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((r) =>
      [r.name, r.nameEn, r.org, r.summary, JSON.stringify(r.specs || {}), (r.tags || []).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }
  return list.sort(SORTERS[sort] || SORTERS.recent).slice(0, limit);
}

function filterLiterature(all, { q, board, sub, yearFrom, yearTo, sort = 'year', limit = 400 } = {}) {
  let list = all.slice();
  if (board) list = list.filter((l) => l.board === board);
  if (sub) list = list.filter((l) => (l.subs || []).includes(sub));
  if (yearFrom) list = list.filter((l) => Number(l.year) >= Number(yearFrom));
  if (yearTo) list = list.filter((l) => Number(l.year) <= Number(yearTo));
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((l) =>
      [l.title, (l.authors || []).join(' '), l.journal, l.abstract, l.doi].filter(Boolean).join(' ').toLowerCase().includes(needle)
    );
  }
  const sorters = {
    year: (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0) || (b.citations || 0) - (a.citations || 0),
    citations: (a, b) => (b.citations || 0) - (a.citations || 0),
    title: (a, b) => String(a.title).localeCompare(String(b.title))
  };
  return list.sort(sorters[sort] || sorters.year).slice(0, limit);
}

function searchIndex(allRecords, allLit, q, { board = null, sub = null, limit = 60 } = {}) {
  const needle = String(q || '').trim().toLowerCase();
  if (!needle) return [];
  const terms = needle.split(/\s+/).filter(Boolean);
  const docs = [
    ...allRecords.map((r) => ({
      kind: 'record',
      id: r.id,
      type: r.type,
      board: r.board,
      subs: r.subs || [],
      title: r.name || r.org || '',
      sub: [r.nameEn, r.org, r.name, r.summary, ...(r.tags || [])].filter(Boolean).join(' '),
      item: r
    })),
    ...allLit.map((l) => ({
      kind: 'literature',
      id: l.id,
      type: 'literature',
      board: l.board,
      subs: l.subs || [],
      title: l.title,
      sub: [l.title, (l.authors || []).join(' '), l.journal, l.abstract, l.doi].filter(Boolean).join(' '),
      item: l
    }))
  ];
  const out = [];
  for (const doc of docs) {
    if (board && doc.board !== board) continue;
    if (sub && !(doc.subs || []).includes(sub)) continue;
    const hay = doc.sub.toLowerCase();
    let score = 0;
    let all = true;
    for (const t of terms) {
      const pos = hay.indexOf(t);
      if (pos === -1) {
        all = false;
        break;
      }
      score += pos < 80 ? 3 : 1;
      if (doc.title.toLowerCase().includes(t)) score += 6;
    }
    if (all) out.push({ ...doc, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

/* ---------------- 导出 ---------------- */

const csvEscape = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows, cols) =>
  `\ufeff${cols.map((c) => csvEscape(c.label)).join(',')}\n${rows
    .map((r) => cols.map((c) => csvEscape(c.get ? c.get(r) : r[c.key])).join(','))
    .join('\n')}`;

function download(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}

export const api = {
  isStatic,
  buildTime,

  meta: () => (isStatic ? getJson('api/meta') : request('/api/meta')),
  health: () => (isStatic ? getJson('api/build') : request('/api/health')),
  stats: () => (isStatic ? getJson('api/stats') : request('/api/stats')),
  gaps: () => (isStatic ? getJson('api/gaps') : request('/api/gaps')),
  sources: () => (isStatic ? getJson('api/sources') : request('/api/sources')),

  async search(q, extra = '') {
    if (!isStatic) return request(`/api/search?q=${encodeURIComponent(q)}${extra}`);
    const [recs, lits] = await Promise.all([getJson('api/records'), getJson('api/literature')]);
    const results = searchIndex(recs.items, lits.items, q);
    const groups = { company: [], product: [], standard: [], literature: [] };
    for (const r of results) (groups[r.type] || (groups[r.type] = [])).push(r);
    return { q, total: results.length, groups };
  },

  async records(params = {}) {
    if (!isStatic) {
      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));
      return request(`/api/records?${qs}`);
    }
    const all = await getJson('api/records');
    const items = filterRecords(all.items, params);
    return { total: items.length, items };
  },

  async record(id) {
    if (!isStatic) return request(`/api/records/${encodeURIComponent(id)}`);
    const all = await getJson('api/records');
    const rec = all.items.find((r) => r.id === id);
    if (!rec) throw new Error('记录不存在');
    const sameType = all.items.filter(
      (r) => r.id !== rec.id && r.type === rec.type && (r.subs || []).some((s) => (rec.subs || []).includes(s))
    );
    const related = (
      sameType.length
        ? sameType
        : all.items.filter((r) => r.id !== rec.id && r.board === rec.board && (r.subs || []).some((s) => (rec.subs || []).includes(s)))
    )
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
      .slice(0, 6);
    return { record: rec, related };
  },

  async literature(params = {}) {
    if (!isStatic) {
      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));
      return request(`/api/literature?${qs}`);
    }
    const all = await getJson('api/literature');
    const items = filterLiterature(all.items, params);
    return { total: items.length, items, meta: all.meta };
  },

  async exportStatic(kind, params = {}) {
    if (kind === 'records') {
      const { items } = await this.records({ ...params, limit: 100000 });
      download(
        'records.csv',
        toCsv(items, [
          { key: 'id', label: 'ID' },
          { key: 'type', label: '维度' },
          { key: 'board', label: '板块' },
          { key: 'name', label: '名称' },
          { key: 'nameEn', label: '英文名' },
          { key: 'org', label: '主体' },
          { key: 'country', label: '国别' },
          { key: 'summary', label: '摘要' },
          { key: 'verification', label: '核验等级' },
          { label: '来源', get: (r) => (r.sources || []).map((s) => s.url).join(' | ') }
        ])
      );
    } else {
      const { items } = await this.literature({ ...params, limit: 100000 });
      download(
        'literature.csv',
        toCsv(items, [
          { key: 'title', label: '标题' },
          { label: '作者', get: (r) => (r.authors || []).join('; ') },
          { key: 'journal', label: '期刊' },
          { key: 'year', label: '年份' },
          { key: 'doi', label: 'DOI' },
          { key: 'url', label: '链接' },
          { key: 'citations', label: '被引' }
        ])
      );
    }
  },

  createRecord: () => (isStatic ? Promise.reject(new Error(READONLY_MSG)) : request('/api/records', { method: 'POST' })),
  deleteRecord: (id) => (isStatic ? Promise.reject(new Error(READONLY_MSG)) : request(`/api/records/${encodeURIComponent(id)}`, { method: 'DELETE' })),
  crossref: () => (isStatic ? Promise.reject(new Error(READONLY_MSG)) : request('/api/literature/crossref', { method: 'POST' })),
  importLiterature: () => (isStatic ? Promise.reject(new Error(READONLY_MSG)) : request('/api/literature/import', { method: 'POST' })),
  xmolUrl: async (q) => {
    const u = `https://www.x-mol.com/paper/search/q?option=${encodeURIComponent(q || '')}`;
    if (isStatic) return { url: u, note: '静态托管模式：直接跳转 X-Mol 检索页。' };
    return request(`/api/xmol/url?q=${encodeURIComponent(q)}`);
  }
};

export default api;
