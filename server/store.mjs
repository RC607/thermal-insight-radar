/**
 * 数据仓储层：基于 JSON 文件的轻量存储，零外部依赖。
 * 所有实体共享统一记录结构，便于跨维度检索与统计。
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const readJson = async (file, fallback) => {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw new Error(`读取 ${file} 失败: ${err.message}`);
  }
};

const writeJson = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
};

export class Store {
  constructor(root) {
    this.root = root;
    this.dataDir = path.join(root, 'data');
    this.files = {
      catalog: path.join(this.dataDir, 'catalog.json'),
      records: path.join(this.dataDir, 'records.json'),
      literature: path.join(this.dataDir, 'literature.json')
    };
    this.catalog = null;
    this.records = { meta: {}, items: [] };
    this.literature = { meta: {}, items: [] };
    this._index = null;
  }

  async init() {
    this.catalog = await readJson(this.files.catalog, null);
    if (!this.catalog) throw new Error('缺少 data/catalog.json 分类目录');
    this.records = await readJson(this.files.records, { meta: { version: 1 }, items: [] });
    this.literature = await readJson(this.files.literature, { meta: { version: 1 }, items: [] });
    this.records.items ||= [];
    this.literature.items ||= [];
    this._index = null;
    return this;
  }

  /** 分类字典：快速取子类与板块元信息 */
  get taxonomy() {
    return this.catalog;
  }

  boardOf(id) {
    return this.catalog.boards.find((b) => b.id === id) || null;
  }

  subOf(id) {
    for (const b of this.catalog.boards) {
      const s = b.subs.find((x) => x.id === id);
      if (s) return { ...s, board: b.id, boardName: b.name };
    }
    return null;
  }

  dimOf(id) {
    return this.catalog.dimensions.find((d) => d.id === id) || null;
  }

  get allRecords() {
    return this.records.items;
  }

  get allLiterature() {
    return this.literature.items;
  }

  /** 统一检索：把记录与文献都映射成可搜索的文本块 */
  buildIndex() {
    if (this._index) return this._index;
    const index = [];
    for (const r of this.records.items) {
      index.push({
        kind: 'record',
        id: r.id,
        type: r.type,
        board: r.board,
        subs: r.subs || [],
        title: r.name || r.org || '',
        sub: [r.nameEn, r.org, r.name, r.summary, ...(r.tags || [])].filter(Boolean).join(' '),
        item: r
      });
    }
    for (const l of this.literature.items) {
      index.push({
        kind: 'literature',
        id: l.id,
        type: 'literature',
        board: l.board,
        subs: l.subs || [],
        title: l.title,
        sub: [l.title, l.authors?.join(' '), l.journal, l.abstract, l.doi].filter(Boolean).join(' '),
        item: l
      });
    }
    this._index = index;
    return index;
  }

  search(q, { limit = 60, board = null, sub = null, kinds = null } = {}) {
    const needle = String(q || '').trim().toLowerCase();
    if (!needle) return [];
    const terms = needle.split(/\s+/).filter(Boolean);
    const out = [];
    for (const doc of this.buildIndex()) {
      if (board && doc.board !== board) continue;
      if (sub && !(doc.subs || []).includes(sub)) continue;
      if (kinds && !kinds.includes(doc.kind === 'record' ? doc.type : 'literature')) continue;
      const hay = doc.sub.toLowerCase();
      let score = 0;
      let all = true;
      for (const t of terms) {
        const pos = hay.indexOf(t);
        if (pos === -1) {
          all = false;
          break;
        }
        score += hay.indexOf(t) < 80 ? 3 : 1;
        if (doc.title.toLowerCase().includes(t)) score += 6;
      }
      if (!all) continue;
      out.push({ ...doc, score });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  filterRecords({ board, sub, type, q, verification, sort = 'recent', limit = 500 } = {}) {
    let list = this.records.items.slice();
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
    const sorters = {
      recent: (a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')),
      name: (a, b) => String(a.name || a.org || '').localeCompare(String(b.name || b.org || ''), 'zh'),
      nameEn: (a, b) => String(a.nameEn || '').localeCompare(String(b.nameEn || '')),
      year: (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0)
    };
    list.sort(sorters[sort] || sorters.recent);
    return list.slice(0, limit);
  }

  async upsertRecord(input) {
    const now = new Date().toISOString();
    const isNew = !input.id;
    let rec = isNew ? null : this.records.items.find((r) => r.id === input.id);
    if (!rec) {
      const prefix = { company: 'co', product: 'pd', standard: 'st' }[input.type] || 'rc';
      const seq = String(this.records.items.filter((r) => r.type === input.type).length + 1).padStart(3, '0');
      rec = { id: `${prefix}-${seq}`, createdAt: now };
      this.records.items.push(rec);
    }
    Object.assign(rec, {
      ...input,
      id: rec.id,
      createdAt: rec.createdAt || now,
      updatedAt: now
    });
    await this.saveRecords();
    return rec;
  }

  async deleteRecord(id) {
    const before = this.records.items.length;
    this.records.items = this.records.items.filter((r) => r.id !== id);
    if (this.records.items.length === before) return false;
    await this.saveRecords();
    return true;
  }

  async saveRecords() {
    this._index = null;
    this.records.meta = {
      ...this.records.meta,
      updatedAt: new Date().toISOString(),
      count: this.records.items.length
    };
    await writeJson(this.files.records, this.records);
  }

  async mergeLiterature(items) {
    const byDoi = new Map(this.literature.items.map((l) => [l.doi || l.id, l]));
    let added = 0;
    let updated = 0;
    for (const item of items) {
      const key = item.doi || item.id;
      if (!key) continue;
      if (byDoi.has(key)) {
        const prev = byDoi.get(key);
        Object.assign(prev, {
          ...item,
          id: prev.id,
          subs: [...new Set([...(prev.subs || []), ...(item.subs || [])])],
          updatedAt: new Date().toISOString()
        });
        updated += 1;
      } else {
        const rec = { ...item, id: item.id || `lit-${Date.now()}-${added}`, addedAt: new Date().toISOString() };
        this.literature.items.push(rec);
        byDoi.set(key, rec);
        added += 1;
      }
    }
    this.literature.meta = {
      ...this.literature.meta,
      updatedAt: new Date().toISOString(),
      total: this.literature.items.length
    };
    this._index = null;
    await writeJson(this.files.literature, this.literature);
    return { added, updated, total: this.literature.items.length };
  }

  filterLiterature({ q, board, sub, yearFrom, yearTo, sort = 'year', limit = 400 } = {}) {
    let list = this.literature.items.slice();
    if (board) list = list.filter((l) => l.board === board);
    if (sub) list = list.filter((l) => (l.subs || []).includes(sub));
    if (yearFrom) list = list.filter((l) => Number(l.year) >= Number(yearFrom));
    if (yearTo) list = list.filter((l) => Number(l.year) <= Number(yearTo));
    if (q) {
      const needle = String(q).toLowerCase();
      list = list.filter((l) =>
        [l.title, (l.authors || []).join(' '), l.journal, l.abstract, l.doi]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle)
      );
    }
    const sorters = {
      year: (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0) || (b.citations || 0) - (a.citations || 0),
      citations: (a, b) => (b.citations || 0) - (a.citations || 0),
      title: (a, b) => String(a.title).localeCompare(String(b.title))
    };
    list.sort(sorters[sort] || sorters.year);
    return list.slice(0, limit);
  }

  /** 看板统计：全部由真实记录聚合，没有记录的地方就是 0，不做估算 */
  stats() {
    const recs = this.records.items;
    const lits = this.literature.items;
    const countBy = (arr, fn) =>
      arr.reduce((acc, x) => {
        const k = fn(x);
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {});

    const byType = countBy(recs, (r) => r.type);
    const byVerification = countBy(recs, (r) => r.verification || 'pending');
    const byCountry = countBy(recs.filter((r) => r.type === 'company'), (r) => r.country || '未标注');

    const coverage = {};
    for (const b of this.catalog.boards) {
      for (const s of b.subs) {
        const inSub = recs.filter((r) => (r.subs || []).includes(s.id));
        const litInSub = lits.filter((l) => (l.subs || []).includes(s.id));
        const cells = {};
        for (const d of this.catalog.dimensions) {
          cells[d.id] = inSub.filter((r) => r.type === d.id).length;
        }
        cells.literature = litInSub.length;
        coverage[s.id] = { board: b.id, name: s.name, total: inSub.length, cells };
      }
    }

    const years = {};
    for (const l of lits) {
      const y = Number(l.year);
      if (y) years[y] = (years[y] || 0) + 1;
    }

    const journals = Object.entries(countBy(lits, (l) => l.journal || '未标注'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));

    const recent = recs
      .slice()
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
      .slice(0, 8)
      .map((r) => ({ id: r.id, type: r.type, name: r.name, org: r.org, board: r.board, updatedAt: r.updatedAt }));

    return {
      totals: {
        records: recs.length,
        literature: lits.length,
        companies: byType.company || 0,
        products: byType.product || 0,
        standards: byType.standard || 0
      },
      byType,
      byVerification,
      byCountry,
      coverage,
      years,
      journals,
      recent,
      dataUpdatedAt: this.records.meta?.updatedAt || null,
      literatureUpdatedAt: this.literature.meta?.updatedAt || null,
      literatureProvider: this.literature.meta?.provider || 'Crossref REST API'
    };
  }

  /** 数据缺口清单：明确告诉用户"这里没有公开数据"，而不是填假数字 */
  gaps() {
    const expected = [];
    for (const b of this.catalog.boards) {
      for (const s of b.subs) {
        for (const d of this.catalog.dimensions) {
          if (d.id === 'literature') continue;
          const n = this.records.items.filter((r) => r.type === d.id && (r.subs || []).includes(s.id)).length;
          if (n === 0) expected.push({ board: b.id, sub: s.id, subName: s.name, dimension: d.id, dimensionName: d.name });
        }
      }
    }
    return expected;
  }
}

export default Store;
