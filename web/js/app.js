/** 应用外壳：侧栏、顶栏、路由、详情抽屉 */
import api from './api.js';
import { esc, fmtDate, TYPE_LABEL, VERIFY_LABEL, verifyBadge, typeTag, domainOf, toast, $ } from './ui.js';
import {
  renderOverview,
  renderBoard,
  renderLiterature,
  renderSources,
  renderIngest,
  renderSearch
} from './pages.js';

const state = { meta: null, stats: null, view: null };

/* ------------------------------------------------------------ 外壳 */

function shell() {
  const boards = state.meta.catalog.boards;
  const c = state.meta.counts;
  return `
  <div id="app">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark"></div>
      <div>
        <div class="brand-name">${esc(state.meta.catalog.productName)}</div>
        <div class="brand-sub">${esc(state.meta.catalog.productNameEn)} v${esc(state.meta.catalog.version)}</div>
      </div>
    </div>
    <nav class="nav" id="nav">
      <div class="nav-item" data-route="#/">总览看板</div>
      <div class="nav-label">情报板块</div>
      ${boards
        .map((b) => {
          const subs = b.subs
            .map((s) => {
              const n = state.stats?.coverage?.[s.id]?.total ?? 0;
              return `<div class="nav-sub" data-board="${b.id}" data-sub="${s.id}" data-route="#/board/${b.id}?sub=${s.id}">
                ${esc(s.name)}<span class="count">${n}</span></div>`;
            })
            .join('');
          const total = Object.values(state.stats?.coverage || {})
            .filter((x) => x.board === b.id)
            .reduce((sum, x) => sum + x.total, 0);
          return `<div class="nav-board" data-board="${b.id}" data-route="#/board/${b.id}">
            <i class="sq"></i>${esc(b.name)}<span class="total">${total}</span></div>${subs}`;
        })
        .join('')}
      <div class="nav-label">数据与文献</div>
      <div class="nav-item" data-route="#/literature">学术文献 <span class="count">${c.literature}</span></div>
      <div class="nav-item" data-route="#/sources">来源与口径</div>
      ${api.isStatic ? '' : '<div class="nav-item" data-route="#/ingest">录入情报</div>'}
    </nav>
    <div class="side-foot">
      <div class="live"><i></i>${api.isStatic ? '静态站点 · 每日自动构建' : '本地服务运行中'}</div>
      <div>记录 ${c.records} 条 · 文献 ${c.literature} 条</div>
      <div>${api.isStatic ? '构建于' : '数据更新'} ${esc(
        fmtDate(api.isStatic ? api.buildTime : state.meta.recordsUpdatedAt || state.meta.literature?.updatedAt)
      )}</div>
    </div>
  </aside>
  <div class="main">
    <header class="topbar">
      <div class="search-wrap">
        <span class="icon">⌕</span>
        <input id="global-q" placeholder="全站检索：企业 / 产品 / 标准 / 文献关键词" autocomplete="off" />
        <kbd>/</kbd>
      </div>
      <div class="top-actions">
        <a class="btn sm ghost" href="#/sources">数据口径</a>
        ${api.isStatic ? '' : '<a class="btn sm primary" href="#/ingest">+ 录入</a>'}
      </div>
    </header>
    <main class="view" id="view"></main>
  </div>
  </div>`;
}

/* ------------------------------------------------------------ 抽屉 */

function ensureDrawer() {
  if ($('#drawer-mask')) return;
  const mask = document.createElement('div');
  mask.className = 'drawer-mask';
  mask.id = 'drawer-mask';
  const drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.id = 'drawer';
  document.body.append(mask, drawer);
  mask.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

function closeDrawer() {
  $('#drawer')?.classList.remove('open');
  $('#drawer-mask')?.classList.remove('open');
}

const dl = (rows) =>
  rows
    .filter(([, v]) => v != null && v !== '' && v !== '—')
    .map(([k, v]) => `<div class="field"><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
    .join('');

async function openRecord(id) {
  ensureDrawer();
  const { record: r, related } = await api.record(id);
  const subName = (sid) => state.meta.catalog.boards.flatMap((b) => b.subs).find((s) => s.id === sid)?.name || sid;
  const board = state.meta.catalog.boards.find((b) => b.id === r.board);
  const specs = Object.entries(r.specs || {}).filter(([, v]) => v !== '' && v != null);

  const drawer = $('#drawer');
  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <div class="eyebrow">${esc((board?.name || r.board) + ' / ' + (r.subs || []).map(subName).join('、'))}</div>
        <h3 style="margin-top:4px">${esc(r.name || r.org || '记录')}</h3>
        <div style="margin-top:7px;display:flex;gap:7px;flex-wrap:wrap">${typeTag(r.type)}${verifyBadge(
    r.verification
  )}<span class="badge">${esc(r.id)}</span></div>
      </div>
      <button class="close" id="drawer-close">✕</button>
    </div>
    <div class="drawer-body">
      ${r.summary ? `<p style="margin:0 0 14px;color:#2b3b4d;font-size:13.5px;line-height:1.8">${esc(r.summary)}</p>` : ''}
      <dl style="margin:0 0 16px">
        ${dl([
          ['英文名', esc(r.nameEn || '')],
          ['主体', esc(r.org || '')],
          ['国别 / 地区', esc([r.country, r.region].filter(Boolean).join(' · ') || '')],
          ['角色 / 形态', esc(r.role || r.form || '')],
          ['时间', esc(r.year || '')],
          ['核验等级', verifyBadge(r.verification) + ` <span style="color:#56687a;font-size:12px">${
            state.meta.catalog.verificationLevels.find((v) => v.id === r.verification)?.desc || ''
          }</span>`],
          ['标签', (r.tags || []).map((t) => `<span class="spec">${esc(t)}</span>`).join(' ')],
          ['录入 / 更新', `<span class="num">${esc(fmtDate(r.createdAt))} → ${esc(fmtDate(r.updatedAt))}</span>`]
        ])}
      </dl>

      ${
        specs.length
          ? `<h4 style="font-size:12.5px;color:#8698a6;letter-spacing:.5px;margin:0 0 8px">公开技术参数</h4>
             <div class="table-wrap" style="margin-bottom:16px"><table class="data"><tbody>
             ${specs
               .map(
                 ([k, val]) =>
                   `<tr><td style="width:44%;color:#8698a6">${esc(k)}</td><td class="num">${esc(val)}</td></tr>`
               )
               .join('')}
             </tbody></table></div>`
          : ''
      }

      <h4 style="font-size:12.5px;color:#8698a6;letter-spacing:.5px;margin:0 0 8px">来源（${
        (r.sources || []).filter((s) => s.url).length
      }）</h4>
      ${
        (r.sources || []).length
          ? (r.sources || [])
              .map(
                (s) => `<div class="src-item">
            <div style="flex:1">
              <div class="s-kind">${esc(s.kind || '来源')} · 访问于 ${esc(s.accessed || '—')}</div>
              <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title || s.url)}</a>
              <div class="cell-en" style="word-break:break-all;margin-top:2px">${esc(domainOf(s.url))}</div>
            </div></div>`
              )
              .join('')
          : '<div class="notice" style="color:#f0a7ab">该记录没有可访问的来源链接，属于待补证状态。</div>'
      }

      ${
        related?.length
          ? `<h4 style="font-size:12.5px;color:#8698a6;letter-spacing:.5px;margin:18px 0 8px">同子分类相关记录</h4>
             ${related
               .map(
                 (x) =>
                   `<div class="src-item" data-open="${esc(x.id)}" style="cursor:pointer">
                     <div style="flex:1"><div style="font-size:13px">${esc(x.name || x.org || '')}</div>
                     <div class="cell-en">${esc(TYPE_LABEL[x.type])} · ${esc(x.org || '')}</div></div></div>`
               )
               .join('')}`
          : ''
      }
    </div>`;

  $('#drawer-close').addEventListener('click', closeDrawer);
  drawer.querySelectorAll('[data-open]').forEach((el) =>
    el.addEventListener('click', () => openRecord(el.dataset.open))
  );
  requestAnimationFrame(() => {
    $('#drawer').classList.add('open');
    $('#drawer-mask').classList.add('open');
  });
}

async function openLiterature(l) {
  ensureDrawer();
  const subName = (sid) => state.meta.catalog.boards.flatMap((b) => b.subs).find((s) => s.id === sid)?.name || sid;
  $('#drawer').innerHTML = `
    <div class="drawer-head">
      <div>
        <div class="eyebrow">学术文献 · ${esc(l.year || '—')}</div>
        <h3 style="margin-top:4px;font-size:16px;line-height:1.5">${esc(l.title)}</h3>
        <div style="margin-top:7px;display:flex;gap:7px;flex-wrap:wrap">
          ${(l.subs || []).map((s) => `<span class="sub-chip">${esc(subName(s))}</span>`).join('')}
          ${l.pendingVerification ? '<span class="badge pending">待核验</span>' : '<span class="badge official">DOI 可核验</span>'}
        </div>
      </div>
      <button class="close" id="drawer-close">✕</button>
    </div>
    <div class="drawer-body">
      <dl style="margin:0 0 16px">
        ${dl([
          ['作者', esc((l.authors || []).join(', ') + (l.authorCount > (l.authors || []).length ? ' 等' : ''))],
          ['期刊', esc(l.journal || '')],
          ['年份', esc(l.year || '')],
          ['被引', `<span class="num">${esc(l.citations ?? 0)}</span>`],
          ['DOI', l.doi ? `<a class="src-link" href="https://doi.org/${esc(l.doi)}" target="_blank">${esc(l.doi)} ↗</a>` : '—'],
          ['数据来源', esc(l.source || '')],
          ['采集时间', esc(l.retrievedAt || '')]
        ])}
      </dl>
      ${l.abstract ? `<h4 style="font-size:12.5px;color:#8698a6;margin:0 0 8px">摘要（原文照录）</h4>
        <p style="color:#b8c8d4;font-size:13px;line-height:1.8;margin:0 0 16px">${esc(l.abstract)}</p>` : ''}
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${l.doi ? `<a class="btn sm" href="https://doi.org/${esc(l.doi)}" target="_blank">打开 DOI</a>` : ''}
        <a class="btn sm" href="${esc(
          l.xmolUrl || `https://www.x-mol.com/paper/search/q?option=${encodeURIComponent(l.title.slice(0, 100))}`
        )}" target="_blank">在 X-Mol 中检索 ↗</a>
        <a class="btn sm ghost" href="#/literature?q=${encodeURIComponent(l.title.slice(0, 40))}">库内相关</a>
      </div>
    </div>`;
  $('#drawer-close').addEventListener('click', closeDrawer);
  requestAnimationFrame(() => {
    $('#drawer').classList.add('open');
    $('#drawer-mask').classList.add('open');
  });
}

/* ------------------------------------------------------------ 路由 */

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  return { path, parts, params: new URLSearchParams(qs) };
}

async function route() {
  const { parts, params } = parseHash();
  const view = $('#view');
  if (!view) return;
  const ctx = {
    meta: state.meta,
    stats: state.stats,
    navigate: (h) => {
      location.hash = h;
    },
    openRecord,
    openLiterature,
    toast
  };

  // 高亮侧栏：板块 / 子分类各自独立高亮，子分类选中时板块头不再抢焦点
  const top = parts[0] || '';
  const boardId = top === 'board' ? parts[1] : null;
  const subId = params.get('sub');
  document.querySelectorAll('.nav-item').forEach((el) => {
    const r = el.dataset.route || '';
    const hit =
      (top === '' && r === '#/') ||
      (top === 'literature' && r === '#/literature') ||
      (top === 'sources' && r === '#/sources') ||
      (top === 'ingest' && r === '#/ingest');
    el.classList.toggle('active', hit);
  });
  document.querySelectorAll('.nav-board').forEach((el) => {
    el.classList.toggle('active', el.dataset.board === boardId && !subId);
  });
  document.querySelectorAll('.nav-sub').forEach((el) => {
    el.classList.toggle('active', el.dataset.board === boardId && el.dataset.sub === subId);
  });

  try {
    view.innerHTML = `<div class="empty"><div class="e-icon">◌</div><p>载入中…</p></div>`;
    if (api.isStatic && parts[0] === 'ingest') {
      ctx.navigate('#/');
      return;
    }
    if (!parts.length) await renderOverview(view, ctx);
    else if (parts[0] === 'board' && parts[1]) await renderBoard(view, ctx, parts[1], params);
    else if (parts[0] === 'literature') await renderLiterature(view, ctx, params);
    else if (parts[0] === 'sources') await renderSources(view, ctx);
    else if (parts[0] === 'ingest') await renderIngest(view, ctx, params);
    else if (parts[0] === 'search') await renderSearch(view, ctx, params);
    else await renderOverview(view, ctx);
  } catch (err) {
    view.innerHTML = `<div class="notice" style="color:#c0473f">页面渲染失败：${esc(err.message)}</div>`;
    console.error(err);
  }
  window.scrollTo({ top: 0 });
}

/* ------------------------------------------------------------ 启动 */

async function boot() {
  const root = document.body;
  try {
    state.meta = await api.meta();
    state.stats = await api.stats();
  } catch (err) {
    root.innerHTML = `<div style="padding:60px;max-width:640px;margin:0 auto">
      <h2 style="color:#0f1b2a">数据载入失败</h2>
      <p style="color:#56687a">${esc(err.message)}</p>
      <p style="color:#56687a">${
        api.isStatic
          ? '静态站点缺少 api/*.json，请重新运行 <code>node tools/build-static.mjs</code> 后再次部署。'
          : '请确认已运行 <code>node server/server.mjs</code>，并通过 http://127.0.0.1:8788 访问。'
      }</p>
    </div>`;
    return;
  }

  root.innerHTML = `${shell()}<div class="toast" id="toast"></div>`;

  const gq = $('#global-q');
  gq.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gq.value.trim()) location.hash = `#/search?q=${encodeURIComponent(gq.value.trim())}`;
  });
  // 侧栏导航：板块标题与 8 个子分类都可直接点击进入
  $('#nav').addEventListener('click', (e) => {
    const target = e.target.closest('[data-route]');
    if (!target) return;
    const hash = target.dataset.route;
    if (location.hash === hash) route();
    else location.hash = hash;
  });
  // 静态模式下的导出按钮（服务端模式是普通链接）
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-export]');
    if (!el) return;
    e.preventDefault();
    const params = el.dataset.params ? JSON.parse(el.dataset.params) : {};
    api.exportStatic(el.dataset.export, params).catch((err) => toast(err.message, true));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault();
      gq.focus();
    }
  });

  window.addEventListener('hashchange', route);
  await route();
}

boot();
