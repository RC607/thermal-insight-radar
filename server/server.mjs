/**
 * 隔热情报雷达 —— 零依赖 Node HTTP 服务
 * 同时承担：静态站点托管 + 数据 REST API + 文献适配器网关
 *
 * 启动： node server/server.mjs [--port 8788]
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './store.mjs';
import { queryCrossref } from './adapters/crossref.mjs';
import { buildSearchUrl, parsePasted } from './adapters/xmol.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WEB = path.join(ROOT, 'web');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8'
};

const json = (res, code, data) => {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
};

const readBody = (req, limit = 2 * 1024 * 1024) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('请求体过大'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('请求体不是合法 JSON'));
      }
    });
    req.on('error', reject);
  });

const csvEscape = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (rows, columns) => {
  const head = columns.map((c) => csvEscape(c.label)).join(',');
  const body = rows
    .map((r) => columns.map((c) => csvEscape(typeof c.get === 'function' ? c.get(r) : r[c.key])).join(','))
    .join('\n');
  return `\ufeff${head}\n${body}`;
};

async function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? '/index.html' : pathname;
  const full = path.join(WEB, path.normalize(rel).replace(/^([/\\])+/, ''));
  if (!full.startsWith(WEB)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const data = await fs.readFile(full);
    const ext = path.extname(full).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=300'
    });
    res.end(data);
  } catch {
    // SPA 兜底
    const index = await fs.readFile(path.join(WEB, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(index);
  }
}

async function main() {
  const portArg = process.argv.indexOf('--port');
  const basePort = Number(process.env.PORT || (portArg > -1 ? process.argv[portArg + 1] : 8788));

  const store = await new Store(ROOT).init();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    const { pathname, searchParams } = url;

    try {
      if (pathname === '/api/health') {
        return json(res, 200, {
          ok: true,
          version: store.taxonomy.version,
          records: store.allRecords.length,
          literature: store.allLiterature.length,
          uptimeSec: Math.round(process.uptime())
        });
      }

      if (pathname === '/api/meta') {
        return json(res, 200, {
          catalog: store.taxonomy,
          counts: {
            records: store.allRecords.length,
            literature: store.allLiterature.length
          },
          recordsUpdatedAt: store.records.meta?.updatedAt || null,
          literature: store.literature.meta || {}
        });
      }

      if (pathname === '/api/stats') {
        return json(res, 200, store.stats());
      }

      if (pathname === '/api/gaps') {
        return json(res, 200, { gaps: store.gaps() });
      }

      if (pathname === '/api/sources') {
        // 汇总所有记录的来源链接，形成可核查的来源登记表
        const map = new Map();
        for (const r of store.allRecords) {
          for (const s of r.sources || []) {
            if (!s.url) continue;
            const key = s.url;
            const prev = map.get(key) || { url: s.url, title: s.title || '', kind: s.kind || '', usedBy: [] };
            prev.usedBy.push({ id: r.id, name: r.name || r.org || '', type: r.type, accessed: s.accessed || '' });
            map.set(key, prev);
          }
        }
        return json(res, 200, {
          sources: [...map.values()].sort((a, b) => b.usedBy.length - a.usedBy.length),
          literatureProvider: store.literature.meta || {}
        });
      }

      if (pathname === '/api/search') {
        const q = searchParams.get('q') || '';
        const results = store.search(q, {
          board: searchParams.get('board') || null,
          sub: searchParams.get('sub') || null,
          limit: Number(searchParams.get('limit') || 60)
        });
        return json(res, 200, {
          q,
          total: results.length,
          groups: {
            company: results.filter((r) => r.type === 'company'),
            product: results.filter((r) => r.type === 'product'),
            project: results.filter((r) => r.type === 'project'),
            price: results.filter((r) => r.type === 'price'),
            sale: results.filter((r) => r.type === 'sale'),
            literature: results.filter((r) => r.type === 'literature')
          }
        });
      }

      if (pathname === '/api/records' && req.method === 'GET') {
        const items = store.filterRecords({
          board: searchParams.get('board') || undefined,
          sub: searchParams.get('sub') || undefined,
          type: searchParams.get('type') || undefined,
          q: searchParams.get('q') || undefined,
          verification: searchParams.get('verification') || undefined,
          sort: searchParams.get('sort') || 'recent',
          limit: Number(searchParams.get('limit') || 500)
        });
        return json(res, 200, { total: items.length, items });
      }

      if (pathname === '/api/records' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.type || !['company', 'product', 'standard'].includes(body.type)) {
          return json(res, 400, { error: 'type 必须是 company/product/standard' });
        }
        if (!body.board || !store.boardOf(body.board)) return json(res, 400, { error: 'board 非法' });
        if (!Array.isArray(body.subs) || !body.subs.length) return json(res, 400, { error: '至少选择一个子分类' });
        const hasSource = (body.sources || []).some((s) => s && s.url);
        if (!hasSource) {
          return json(res, 400, {
            error: '必须至少提供一条来源 URL。本系统不接受无出处的数据入库。'
          });
        }
        const rec = await store.upsertRecord(body);
        return json(res, 201, rec);
      }

      if (pathname.startsWith('/api/records/') && req.method === 'DELETE') {
        const id = decodeURIComponent(pathname.slice('/api/records/'.length));
        const ok = await store.deleteRecord(id);
        return json(res, ok ? 200 : 404, { ok });
      }

      if (pathname.startsWith('/api/records/') && req.method === 'GET') {
        const id = decodeURIComponent(pathname.slice('/api/records/'.length));
        const rec = store.allRecords.find((r) => r.id === id);
        if (!rec) return json(res, 404, { error: '记录不存在' });
        // 同类型优先（产品看产品、企业看企业），同子分类兜底
        const sameType = store.allRecords.filter(
          (r) => r.id !== rec.id && r.type === rec.type && (r.subs || []).some((s) => (rec.subs || []).includes(s))
        );
        const related = (
          sameType.length
            ? sameType
            : store.allRecords.filter(
                (r) => r.id !== rec.id && r.board === rec.board && (r.subs || []).some((s) => (rec.subs || []).includes(s))
              )
        )
          .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
          .slice(0, 6);
        return json(res, 200, { record: rec, related });
      }

      if (pathname === '/api/literature' && req.method === 'GET') {
        const items = store.filterLiterature({
          q: searchParams.get('q') || undefined,
          board: searchParams.get('board') || undefined,
          sub: searchParams.get('sub') || undefined,
          yearFrom: searchParams.get('yearFrom') || undefined,
          yearTo: searchParams.get('yearTo') || undefined,
          sort: searchParams.get('sort') || 'year',
          limit: Number(searchParams.get('limit') || 400)
        });
        return json(res, 200, { total: items.length, items, meta: store.literature.meta });
      }

      if (pathname === '/api/literature/crossref' && req.method === 'POST') {
        const body = await readBody(req);
        const items = await queryCrossref({
          q: body.q,
          board: body.board || null,
          subs: body.subs || [],
          rows: body.rows || 20
        });
        let merged = { added: 0, updated: 0, total: store.allLiterature.length };
        if (body.persist !== false) merged = await store.mergeLiterature(items);
        return json(res, 200, { fetched: items.length, merged, items });
      }

      if (pathname === '/api/literature/import' && req.method === 'POST') {
        const body = await readBody(req);
        const { items, warnings } = parsePasted(body.raw, { board: body.board || null });
        if (!items.length) return json(res, 400, { error: '未能解析出条目', warnings });
        const merged = await store.mergeLiterature(items);
        return json(res, 200, { parsed: items.length, warnings, merged, items });
      }

      if (pathname === '/api/xmol/url') {
        const q = searchParams.get('q') || '';
        return json(res, 200, {
          url: buildSearchUrl(q),
          note: 'X-Mol 有反爬保护，本系统不静默抓取；请在新标签打开检索页后使用「粘贴导入」入库。'
        });
      }

      if (pathname === '/api/export/records') {
        const items = store.filterRecords({
          board: searchParams.get('board') || undefined,
          sub: searchParams.get('sub') || undefined,
          type: searchParams.get('type') || undefined
        });
        const csv = toCsv(items, [
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
        ]);
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="records.csv"'
        });
        return res.end(csv);
      }

      if (pathname === '/api/export/literature') {
        const items = store.filterLiterature({
          board: searchParams.get('board') || undefined,
          sub: searchParams.get('sub') || undefined
        });
        const csv = toCsv(items, [
          { key: 'title', label: '标题' },
          { label: '作者', get: (r) => (r.authors || []).join('; ') },
          { key: 'journal', label: '期刊' },
          { key: 'year', label: '年份' },
          { key: 'doi', label: 'DOI' },
          { key: 'url', label: '链接' },
          { key: 'citations', label: '被引' }
        ]);
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="literature.csv"'
        });
        return res.end(csv);
      }

      if (pathname.startsWith('/api/')) return json(res, 404, { error: '接口不存在' });

      return serveStatic(req, res, pathname);
    } catch (err) {
      console.error('[error]', req.method, pathname, err.message);
      return json(res, 500, { error: err.message || '服务器内部错误' });
    }
  });

  const listen = (port, attempt = 0) =>
    new Promise((resolve, reject) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempt < 12) resolve(listen(port + 1, attempt + 1));
        else reject(err);
      });
      server.listen(port, '127.0.0.1', () => resolve(port));
    });

  const port = await listen(basePort);
  console.log(`✓ 隔热情报雷达已启动  http://127.0.0.1:${port}`);
  console.log(`  记录 ${store.allRecords.length} 条 · 文献 ${store.allLiterature.length} 条`);
  console.log('  按 Ctrl+C 停止');
}

main().catch((err) => {
  console.error('启动失败：', err);
  process.exit(1);
});
