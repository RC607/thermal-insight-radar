/** 页面渲染层：概览 / 板块 / 文献 / 来源 / 录入 / 检索 */
import api from './api.js';
import {
  esc,
  fmtDate,
  fmtNum,
  TYPE_LABEL,
  VERIFY_LABEL,
  verifyBadge,
  typeTag,
  srcLink,
  domainOf
} from './ui.js';
import { barChart, columnChart, stackBar } from './charts.js';

const VERIFY_COLORS = {
  official: '#56d6a0',
  media: '#7fb5ee',
  b2b: '#e6bd63',
  report: '#b790e8',
  pending: '#d98e6a'
};

/* ------------------------------------------------------------------ 通用块 */

const head = (eyebrow, title, desc, actions = '') => `
  <div class="page-head">
    <div style="flex:1;min-width:240px">
      <div class="eyebrow">${esc(eyebrow)}</div>
      <h1 class="page-title">${esc(title)}</h1>
      ${desc ? `<div class="page-desc">${desc}</div>` : ''}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${actions}</div>
  </div>`;

const panel = (title, body, { hint = '', actions = '', flush = false } = {}) => `
  <section class="panel">
    <div class="panel-head">
      <h3>${esc(title)}</h3>
      ${hint ? `<span class="hint">${esc(hint)}</span>` : ''}
      <span class="spacer"></span>${actions}
    </div>
    <div class="panel-body${flush ? ' flush' : ''}">${body}</div>
  </section>`;

const emptyState = (title, desc, actions = '') => `
  <div class="empty">
    <div class="e-icon">◎</div>
    <h4>${esc(title)}</h4>
    <p>${desc}</p>
    ${actions ? `<div class="e-actions">${actions}</div>` : ''}
  </div>`;

const specChips = (specs, n = 3) => {
  const entries = Object.entries(specs || {}).filter(([, v]) => v !== '' && v != null);
  if (!entries.length) return '<span class="src-count">参数未公开</span>';
  return `<div class="spec-list">${entries
    .slice(0, n)
    .map(([k, v]) => `<span class="spec">${esc(k)} <b>${esc(v)}</b></span>`)
    .join('')}${entries.length > n ? `<span class="spec">+${entries.length - n}</span>` : ''}</div>`;
};

/* ------------------------------------------------------------------ 表格列定义 */

const COLUMNS = {
  company: [
    {
      h: '企业主体',
      get: (r) =>
        `<div class="cell-name">${esc(r.name)}</div>${r.nameEn ? `<div class="cell-en">${esc(r.nameEn)}</div>` : ''}`
    },
    { h: '产业链角色', get: (r) => `<span class="cell-org">${esc(r.role || '—')}</span>` },
    { h: '国别 / 地区', get: (r) => esc([r.country, r.region].filter(Boolean).join(' · ') || '—') },
    { h: '产品线索', get: (r) => esc(r.productHint || r.summary?.slice(0, 46) || '—') },
    { h: '核验', get: (r) => verifyBadge(r.verification) },
    { h: '来源', get: (r) => srcLink(r.sources) }
  ],
  product: [
    {
      h: '产品 / 型号',
      get: (r) =>
        `<div class="cell-name">${esc(r.name)}</div>${r.nameEn ? `<div class="cell-en">${esc(r.nameEn)}</div>` : ''}`
    },
    { h: '企业', get: (r) => `<span class="cell-org">${esc(r.org || '—')}</span>` },
    { h: '形态', get: (r) => esc(r.form || '—') },
    { h: '公开参数', get: (r) => specChips(r.specs) },
    { h: '核验', get: (r) => verifyBadge(r.verification) },
    { h: '来源', get: (r) => srcLink(r.sources) }
  ],
  standard: [
    {
      h: '标准 / 专利',
      get: (r) =>
        `<div class="cell-name">${esc(r.name)}</div>${r.nameEn ? `<div class="cell-en">${esc(r.nameEn)}</div>` : ''}`
    },
    { h: '类型', get: (r) => `<span class="cell-org">${esc(r.role || '—')}</span>` },
    { h: '时间', get: (r) => `<span class="num">${esc(r.year || '—')}</span>` },
    { h: '提出 / 起草单位', get: (r) => esc(r.org || '—') },
    { h: '核验', get: (r) => verifyBadge(r.verification) },
    { h: '来源', get: (r) => srcLink(r.sources) }
  ]
};

const recordTable = (items, type) => {
  const cols = COLUMNS[type] || COLUMNS.company;
  return `<div class="table-wrap"><table class="data">
    <thead><tr>${cols.map((c) => `<th>${esc(c.h)}</th>`).join('')}</tr></thead>
    <tbody>${items
      .map((r) => `<tr data-record="${esc(r.id)}">${cols.map((c) => `<td>${c.get(r)}</td>`).join('')}</tr>`)
      .join('')}</tbody>
  </table></div>`;
};

const recordCards = (items, type) =>
  `<div class="grid-cards">${items
    .map(
      (r) => `<article class="card" data-record="${esc(r.id)}">
        <h4>${esc(r.name || '未命名')}</h4>
        <div class="c-sub">${esc(r.nameEn || r.org || '')}</div>
        <div class="c-body">${esc(r.summary || '（无摘要）').slice(0, 130)}</div>
        ${type === 'product' ? specChips(r.specs) : ''}
        <div class="c-foot">${typeTag(type)}${verifyBadge(r.verification)}${srcLink(r.sources)}</div>
      </article>`
    )
    .join('')}</div>`;

/* ------------------------------------------------------------------ 概览 */

export async function renderOverview(root, ctx) {
  const [stats, gapsRes] = await Promise.all([api.stats(), api.gaps()]);
  ctx.stats = stats;
  const t = stats.totals;

  const kpis = [
    { label: '情报记录', value: t.records, foot: '五类维度合计', tone: '' },
    { label: '生产商', value: t.companies, foot: '企业主体与产业链位置', tone: '' },
    { label: '产品资料', value: t.products, foot: '型号与公开参数', tone: 'dc' },
    { label: '标准与专利', value: t.standards, foot: '国标/行标/团标/专利', tone: '' },
    { label: '学术文献', value: t.literature, foot: 'Crossref 元数据', tone: 'rc' }
  ];

  const boardCards = ctx.meta.catalog.boards
    .map((b) => {
      const recs = Object.values(stats.coverage).filter((c) => c.board === b.id);
      const total = recs.reduce((s, c) => s + c.total, 0);
      const lit = recs.reduce((s, c) => s + (c.cells.literature || 0), 0);
      const chips = b.subs
        .map((s) => {
          const c = stats.coverage[s.id];
          return `<span class="sub-chip">${esc(s.name)} <b>${c ? c.total : 0}</b></span>`;
        })
        .join('');
      return `<article class="board-card" data-board="${b.id}" style="--accent:${b.accent}">
        <div class="bc-head">
          <div>
            <div class="bc-title">${esc(b.name)}</div>
            <div class="bc-sub">${esc(b.subtitle)}</div>
          </div>
          <span style="margin-left:auto"><span class="badge" style="color:${b.accent};border-color:${b.accent}55">${
        b.subs.length
      } 个子分类</span></span>
        </div>
        <p class="bc-desc">${esc(b.subs.map((s) => s.name).join(' · '))}</p>
        <div class="sub-chips">${chips}</div>
        <div class="bc-foot">
          <span>覆盖条目 <b>${total}</b></span>
          <span>文献 <b>${lit}</b></span>
          <span style="margin-left:auto;color:${b.accent}">进入板块 →</span>
        </div>
      </article>`;
    })
    .join('');

  const matrix = renderMatrix(stats.coverage, ctx.meta.catalog);

  const years = Object.entries(stats.years)
    .map(([y, n]) => ({ label: String(y), value: n }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter((p) => Number(p.label) >= 2014);
  const yearChart = columnChart(years, { color: '#9fb4ff' });

  const verifySegs = Object.entries(VERIFY_COLORS).map(([id, color]) => ({
    label: VERIFY_LABEL[id],
    value: stats.byVerification[id] || 0,
    color
  }));

  // 企业国别分布：全部来自 company 记录的真实 country 字段
  const countryItems = Object.entries(stats.byCountry || {})
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 9);
  const countryChart = barChart(countryItems, { color: '#3a6ad4' });

  const journalItems = (stats.journals || []).map((j) => ({ label: j.name, value: j.count })).slice(0, 8);
  const journalChart = barChart(journalItems, { color: '#7a51c7' });

  const recent = stats.recent.length
    ? `<div class="table-wrap"><table class="data"><thead><tr><th>记录</th><th>维度</th><th>板块</th><th>更新时间</th></tr></thead>
      <tbody>${stats.recent
        .map(
          (r) => `<tr data-record="${esc(r.id)}"><td class="cell-name">${esc(r.name || '—')}</td>
          <td>${typeTag(r.type)}</td>
          <td class="cell-org">${esc(ctx.meta.catalog.boards.find((b) => b.id === r.board)?.name || r.board)}</td>
          <td class="num">${esc(fmtDate(r.updatedAt))}</td></tr>`
        )
        .join('')}</tbody></table></div>`
    : emptyState('还没有录入记录', '站点当前只载入了分类目录与文献库。请从「录入情报」开始补充有出处的产业数据。');

  const gapCount = gapsRes.gaps.length;
  const gapPreview = gapsRes.gaps.slice(0, 8);

  root.innerHTML = `
    ${head(
      'THERMAL INSULATION INTELLIGENCE',
      '隔热领域行业情报检索',
      `透明陶瓷隔热（铯钨青铜 CsₓWO₃）与辐射制冷两大板块，覆盖生产商、产品资料、标准与专利、学术文献四个维度。<b style="color:#0f1b2a">所有记录均附来源链接与核验等级</b>，无出处的数据不入库。`,
      `<a class="btn" href="#/literature">文献库</a>
       <a class="btn" href="#/sources">来源与口径</a>
       ${api.isStatic ? '' : '<a class="btn primary" href="#/ingest">录入情报</a>'}`
    )}

    <div class="kpi-grid">
      ${kpis
        .map(
          (k) => `<div class="kpi" ${k.tone ? `data-tone="${k.tone}"` : ''}>
        <div class="k-label">${esc(k.label)}</div>
        <div class="k-value">${fmtNum(k.value)}</div>
        <div class="k-foot">${esc(k.foot)}</div></div>`
        )
        .join('')}
    </div>

    <div class="board-grid">${boardCards}</div>

    <div class="ov-grid">
      ${panel('数据覆盖矩阵', matrix, { hint: '每格为该子分类下的记录条数（虚线=缺口）' })}
      ${panel('核验等级分布', stackBar(verifySegs), { hint: '入库记录的出处强度' })}
    </div>

    <div class="ov-grid">
      ${panel('文献年度分布', yearChart, {
        hint: `来源：${stats.literatureProvider}`,
        actions: `<a class="btn sm ghost" href="#/literature">查看全部 ${t.literature} 篇</a>`
      })}
      ${panel('企业国别分布', countryChart, { hint: '按生产商记录的国别字段聚合' })}
    </div>

    <div class="ov-grid">
      ${panel('高被引期刊分布', journalChart, { hint: '本库文献出现频次最高的期刊' })}
      ${panel('最近入库', recent, { hint: '按更新时间倒序' })}
    </div>

    <div class="ov-grid">
      ${panel(
        '数据缺口清单',
        `<div class="notice">当前有 <b>${gapCount}</b> 个「子分类 × 维度」组合没有任何记录。这些位置在页面上显示为空，而非填充占位数据。
         <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
           ${gapPreview.map((g) => `<span class="sub-chip">${esc(g.subName)} · ${esc(g.dimensionName)}</span>`).join('')}
           ${gapCount > gapPreview.length ? `<span class="sub-chip">… 共 ${gapCount} 项</span>` : ''}
         </div>
         <div style="margin-top:12px"><a class="btn sm" href="#/sources">查看完整缺口与入库规则</a></div>
        </div>`,
        { hint: '透明的空，好过编造的数字' }
      )}
      ${panel(
        '本库口径说明',
        `<div class="notice info">
          收录范围为<b>可核查的公开信息</b>：企业官网、政府与协会公示、标准平台、开放文献元数据。
          价格、销量、销售额、样板工程四类数据在公开渠道几乎不可得（详见「来源与口径」页的说明），
          因此不作为独立维度呈现，避免用估算值污染判断。
         </div>`,
        { hint: '为什么没有价格/销量维度' }
      )}
    </div>
  `;

  root.querySelectorAll('[data-board]').forEach((el) =>
    el.addEventListener('click', () => ctx.navigate(`#/board/${el.dataset.board}`))
  );
  root.querySelectorAll('[data-record]').forEach((el) =>
    el.addEventListener('click', () => ctx.openRecord(el.dataset.record))
  );
}

function renderMatrix(coverage, catalog) {
  const dims = catalog.dimensions;
  const rows = [];
  rows.push(
    `<div class="matrix-row head"><div class="m-name">子分类</div>${dims
      .map((d) => `<div style="text-align:center">${esc(d.name.replace('标准与专利', '标准专利'))}</div>`)
      .join('')}</div>`
  );
  for (const b of catalog.boards) {
    for (const s of b.subs) {
      const c = coverage[s.id];
      if (!c) continue;
      const cells = dims
        .map((d) => {
          const n = c.cells[d.id] || 0;
          const alpha = n ? Math.min(0.06 + n * 0.09, 0.42) : 0;
          const bg = n ? `background:rgba(${b.id === 'dc' ? '240,161,58' : '63,184,201'},${alpha})` : '';
          return `<div class="matrix-cell ${n ? '' : 'gap'}" data-n="${n}" style="${bg}">${n || '·'}</div>`;
        })
        .join('');
      rows.push(`<div class="matrix-row"><div class="m-name">${esc(s.name)}</div>${cells}</div>`);
    }
  }
  return `<div class="matrix">${rows.join('')}</div>
    <div class="legend">
      <span><i style="background:rgba(240,161,58,.45)"></i>透明陶瓷隔热</span>
      <span><i style="background:rgba(63,184,201,.45)"></i>辐射制冷</span>
      <span>虚线格 = 该维度尚无记录</span>
    </div>`;
}

/* ------------------------------------------------------------------ 板块页 */

export async function renderBoard(root, ctx, boardId, params) {
  const board = ctx.meta.catalog.boards.find((b) => b.id === boardId);
  if (!board) {
    ctx.navigate('#/');
    return;
  }
  const stats = ctx.stats || (await api.stats());
  ctx.stats = stats;

  const subId =
    params.get('sub') && board.subs.some((s) => s.id === params.get('sub')) ? params.get('sub') : board.subs[0].id;
  const dimId = params.get('dim') || 'company';
  const q = params.get('q') || '';
  const sort = params.get('sort') || 'recent';
  const view = params.get('view') || 'table';

  const sub = board.subs.find((s) => s.id === subId);
  const { items } = await api.records({ board: board.id, sub: subId, type: dimId, q, sort });

  const subTabs = board.subs
    .map(
      (s) =>
        `<div class="tab ${s.id === subId ? 'active' : ''}" data-sub="${s.id}">${esc(s.name)}
         <span class="n">${stats.coverage[s.id]?.total || 0}</span></div>`
    )
    .join('');

  const dimTabs = ctx.meta.catalog.dimensions
    .map((d) => {
      const n = stats.coverage[subId]?.cells?.[d.id] || 0;
      return `<div class="tab ${d.id === dimId ? 'active' : ''}" data-dim="${d.id}">${esc(d.name)}
        <span class="n">${n}</span></div>`;
    })
    .join('');

  const body = items.length
    ? view === 'card'
      ? recordCards(items, dimId)
      : recordTable(items, dimId)
    : emptyState(
        `${sub.name} · ${TYPE_LABEL[dimId]} 暂无记录`,
        `该子分类下还没有可核查的「${TYPE_LABEL[dimId]}」条目。系统对每条数据强制要求来源 URL，因此不会用推测值填充。
         ${
           api.isStatic
             ? '静态站点为只读：这张表随每日构建更新，缺口会一直显示为空，直到运营方补录。'
             : '建议：先在官网/1688/爱采购/行业媒体找到原始页面，再到「录入情报」登记，来源会自动出现在列表与详情页中。'
         }`,
        `${
          api.isStatic
            ? ''
            : `<a class="btn sm primary" href="#/ingest?board=${board.id}&sub=${subId}&type=${dimId}">录入此维度</a>`
        }
         <button class="btn sm ghost" data-switch-dim="company">看该子分类生产商</button>`
      );

  root.innerHTML = `
    ${head(
      board.id === 'dc' ? 'BOARD 01 · 透明陶瓷隔热' : 'BOARD 02 · 辐射制冷',
      board.name,
      `${esc(board.subtitle)} —— ${esc(sub.desc)}`,
      `<a class="btn" href="#/literature?board=${board.id}&sub=${subId}">该子分类文献</a>
       ${api.isStatic ? '' : `<a class="btn primary" href="#/ingest?board=${board.id}&sub=${subId}&type=${dimId}">录入情报</a>`}`
    )}
    <div class="tabs">${subTabs}</div>
    <div class="tabs">${dimTabs}</div>

    <div class="toolbar">
      <input class="input" id="bq" placeholder="在「${esc(sub.name)} · ${esc(TYPE_LABEL[dimId])}」内检索…" value="${esc(
    q
  )}" style="min-width:280px" />
      <select class="input" id="bsort">
        <option value="recent" ${sort === 'recent' ? 'selected' : ''}>最近更新</option>
        <option value="name" ${sort === 'name' ? 'selected' : ''}>名称</option>
      </select>
      <div class="grow"></div>
      <span class="src-count">${items.length} 条结果</span>
      <button class="btn sm ${view === 'table' ? 'primary' : 'ghost'}" data-view="table">表格</button>
      <button class="btn sm ${view === 'card' ? 'primary' : 'ghost'}" data-view="card">卡片</button>
      <a class="btn sm ghost" ${
        api.isStatic
          ? `data-export="records" data-params='${JSON.stringify({ board: board.id, sub: subId, type: dimId })}' href="#"`
          : `href="/api/export/records?board=${board.id}&sub=${subId}&type=${dimId}"`
      }>导出 CSV</a>
    </div>

    <section class="panel">${body}</section>

    <div style="height:16px"></div>
    ${panel(
      '该子分类的数据说明',
      `<div class="notice info">
        <b>口径：</b>本板块只收录 ${esc(sub.name)} 相关的可核查信息，四个维度分别是生产商、产品资料、标准与专利、学术文献。
        文献元数据来自 ${esc(stats.literatureProvider)}，每条带真实 DOI；企业与标准条目均附原始页面链接。
        <br/><b>子分类定义：</b>${esc(sub.desc)}
      </div>`,
      { hint: '来源与核验等级定义见「来源与口径」页' }
    )}
  `;

  const nav = (patch) => {
    const p = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v == null || v === '' ? p.delete(k) : p.set(k, v)));
    if (!p.get('sub')) p.delete('sub');
    if (!p.get('dim')) p.delete('dim');
    ctx.navigate(`#/board/${boardId}?${p.toString()}`);
  };

  root.querySelectorAll('[data-sub]').forEach((el) =>
    el.addEventListener('click', () => nav({ sub: el.dataset.sub, q: '', sort: '', view: '' }))
  );
  root.querySelectorAll('[data-dim]').forEach((el) =>
    el.addEventListener('click', () => nav({ dim: el.dataset.dim, q: '' }))
  );
  root.querySelectorAll('[data-view]').forEach((el) =>
    el.addEventListener('click', () => nav({ view: el.dataset.view !== 'table' ? el.dataset.view : '', sub: subId, dim: dimId }))
  );
  const bq = root.querySelector('#bq');
  bq?.addEventListener('input', (e) => {
    clearTimeout(bq._t);
    bq._t = setTimeout(() => nav({ q: e.target.value, sub: subId, dim: dimId }), 320);
  });
  root.querySelector('#bsort')?.addEventListener('change', (e) => nav({ sort: e.target.value, sub: subId, dim: dimId }));
  root.querySelectorAll('[data-record]').forEach((el) =>
    el.addEventListener('click', () => ctx.openRecord(el.dataset.record))
  );
  root.querySelector('[data-switch-dim]')?.addEventListener('click', (e) =>
    nav({ dim: e.currentTarget.dataset.switchDim, sub: subId })
  );
}

/* ------------------------------------------------------------------ 文献页 */

export async function renderLiterature(root, ctx, params) {
  const q = params.get('q') || '';
  const board = params.get('board') || '';
  const sub = params.get('sub') || '';
  const sort = params.get('sort') || 'year';
  const yearFrom = params.get('yearFrom') || '';
  const yearTo = params.get('yearTo') || '';
  const { items, total, meta } = await api.literature({ q, board, sub, sort, yearFrom, yearTo });

  const boardOpts = ctx.meta.catalog.boards
    .map((b) => `<option value="${b.id}" ${board === b.id ? 'selected' : ''}>${esc(b.name)}</option>`)
    .join('');
  const subOpts = ctx.meta.catalog.boards
    .flatMap((b) => b.subs)
    .map((s) => `<option value="${s.id}" ${sub === s.id ? 'selected' : ''}>${esc(s.name)}</option>`)
    .join('');
  const subName = (id) => ctx.meta.catalog.boards.flatMap((b) => b.subs).find((s) => s.id === id)?.name || id;

  const list = items.length
    ? items
        .map(
          (l) => `<article class="paper" data-lit="${esc(l.id)}">
        <div>
          <h4>${esc(l.title)}</h4>
          <div class="p-meta">
            ${l.year ? `<span class="num">${esc(l.year)}</span>` : ''}
            ${l.journal ? `<span class="j">${esc(l.journal)}</span>` : ''}
            ${l.authors?.length ? `<span>${esc(l.authors.slice(0, 3).join(', '))}${l.authorCount > 3 ? ' 等' : ''}</span>` : ''}
            ${(l.subs || []).map((s) => `<span class="sub-chip">${esc(subName(s))}</span>`).join('')}
            ${l.pendingVerification ? `<span class="badge pending">待核验</span>` : ''}
          </div>
          ${l.abstract ? `<div class="p-abs">${esc(l.abstract)}</div>` : ''}
        </div>
        <div class="p-side">
          <span class="cite-pill">引用 ${esc(l.citations ?? 0)}</span>
          ${
            l.doi
              ? `<a class="src-link" href="https://doi.org/${esc(l.doi)}" target="_blank" rel="noopener">DOI ↗</a>`
              : '<span class="src-count">无 DOI</span>'
          }
          <a class="src-link" href="${esc(
            l.xmolUrl || `https://www.x-mol.com/paper/search/q?option=${encodeURIComponent(l.title.slice(0, 100))}`
          )}" target="_blank" rel="noopener">X-Mol ↗</a>
        </div>
      </article>`
        )
        .join('')
    : emptyState(
        '没有匹配的文献',
        '当前库内文献来自 Crossref 元数据种子。你可以用「Crossref 在线检索」按关键词实时抓取，或用「X-Mol 导入」把 X-Mol 上看到的条目补进来。',
        `<button class="btn sm primary" id="e-crossref">Crossref 在线检索</button>
         <button class="btn sm" id="e-xmol">X-Mol 导入</button>`
      );

  root.innerHTML = `
    ${head(
      'LITERATURE INTELLIGENCE',
      '学术文献库',
      `共 <b style="color:#0f1b2a">${meta.total || total}</b> 条文献元数据，来源 ${esc(
        meta.provider || 'Crossref REST API'
      )}，每条带真实 DOI 可点开验证。X-Mol 有反爬保护，采用「深链检索 + 粘贴导入」的合规接入方式。`,
      api.isStatic
        ? `<span class="badge" title="每日自动构建，数据随构建更新">静态站点 · 只读</span>`
        : `<button class="btn" id="btn-crossref">Crossref 在线检索</button>
       <button class="btn" id="btn-xmol">X-Mol 导入</button>`
    )}

    <div class="toolbar">
      <input class="input" id="lq" placeholder="检索标题 / 作者 / 期刊 / DOI…" value="${esc(q)}" style="min-width:300px" />
      <select class="input" id="lboard"><option value="">全部板块</option>${boardOpts}</select>
      <select class="input" id="lsub"><option value="">全部子分类</option>${subOpts}</select>
      <select class="input" id="lsort">
        <option value="year" ${sort === 'year' ? 'selected' : ''}>按年份</option>
        <option value="citations" ${sort === 'citations' ? 'selected' : ''}>按被引</option>
        <option value="title" ${sort === 'title' ? 'selected' : ''}>按标题</option>
      </select>
      <input class="input" id="lyf" placeholder="起年" value="${esc(yearFrom)}" style="width:82px" />
      <input class="input" id="lyt" placeholder="止年" value="${esc(yearTo)}" style="width:82px" />
      <div class="grow"></div>
      <span class="src-count">${items.length} 篇</span>
      <a class="btn sm ghost" ${
        api.isStatic
          ? `data-export="literature" data-params='${JSON.stringify({ board, sub })}' href="#"`
          : `href="/api/export/literature?board=${board}&sub=${sub}"`
      }>导出 CSV</a>
    </div>

    <section class="panel"><div class="panel-body flush">${list}</div></section>

    <div style="height:16px"></div>
    ${panel(
      '文献接入说明（Crossref / X-Mol）',
      `<div class="notice">
        文献元数据来自 Crossref 开放接口，每条带真实 DOI。<b>站点每日自动重建</b>，重建时会重新抓取一次 Crossref 增量。<br/>
        X-Mol 对服务端与 headless 浏览器访问返回「访问受限」，因此本系统<b>不静默爬取</b>，只提供「深链跳转 + 本地解析器」两条路径：
        每篇论文右侧的「X-Mol ↗」会在你自己的登录态下打开同名检索页；解析器（BibTeX / RIS / DOI / 自由文本）保留在
        <code>server/adapters/xmol.mjs</code>，本地运行 <code>node server/server.mjs</code> 时可直接粘贴入库。
        ${
          api.isStatic
            ? '<br/><b>当前为静态托管（只读）模式</b>：写入与在线抓取入口已隐藏，数据随每日构建更新。'
            : ''
        }
      </div>`,
      { hint: '合规优先' }
    )}
  `;

  const nav = (patch) => {
    const p = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    ctx.navigate(`#/literature?${p.toString()}`);
  };
  const lq = root.querySelector('#lq');
  lq?.addEventListener('input', (e) => {
    clearTimeout(lq._t);
    lq._t = setTimeout(() => nav({ q: e.target.value }), 340);
  });
  const fieldMap = { lboard: 'board', lsub: 'sub', lsort: 'sort', lyf: 'yearFrom', lyt: 'yearTo' };
  Object.entries(fieldMap).forEach(([id, key]) => {
    root.querySelector(`#${id}`)?.addEventListener('change', (e) => nav({ [key]: e.target.value }));
  });
  root.querySelectorAll('[data-lit]').forEach((el) =>
    el.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const item = items.find((i) => i.id === el.dataset.lit);
      if (item) ctx.openLiterature(item);
    })
  );

  const openCrossref = () => crossrefModal(ctx, { q: q || 'cesium tungsten bronze', board, sub });
  root.querySelector('#btn-crossref')?.addEventListener('click', openCrossref);
  root.querySelector('#e-crossref')?.addEventListener('click', openCrossref);
  const openXmol = () => xmolModal(ctx, { q, board });
  root.querySelector('#btn-xmol')?.addEventListener('click', openXmol);
  root.querySelector('#e-xmol')?.addEventListener('click', openXmol);
}

/* ------------------------------------------------------------------ 来源页 */

export async function renderSources(root, ctx) {
  const [src, gapsRes] = await Promise.all([api.sources(), api.gaps()]);
  const gapsByBoard = {};
  for (const g of gapsRes.gaps) (gapsByBoard[g.board] ||= []).push(g);

  const rows = src.sources.length
    ? src.sources
        .map(
          (s) => `<tr>
        <td><a class="src-link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(domainOf(s.url))} ↗</a>
            <div class="cell-en" style="max-width:520px;word-break:break-all">${esc(s.url)}</div></td>
        <td class="cell-org">${esc(s.title || '—')}</td>
        <td class="num">${s.usedBy.length}</td>
        <td class="cell-org">${esc([...new Set(s.usedBy.map((u) => TYPE_LABEL[u.type]))].join('、'))}</td>
      </tr>`
        )
        .join('')
    : `<tr><td colspan="4">${emptyState('尚无来源登记', '当前库内没有带来源链接的记录。')}</td></tr>`;

  const gapBlocks = ctx.meta.catalog.boards
    .map((b) => {
      const list = gapsByBoard[b.id] || [];
      return `<div style="margin-bottom:14px">
        <div style="font-size:12.5px;color:${b.accent};margin-bottom:6px">${esc(b.name)} · 缺口 ${list.length} 项</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${
            list.length
              ? list.map((g) => `<span class="sub-chip">${esc(g.subName)} × ${esc(g.dimensionName)}</span>`).join('')
              : '<span class="src-count">该板块无缺口</span>'
          }
        </div></div>`;
    })
    .join('');

  root.innerHTML = `
    ${head(
      'SOURCES & METHODOLOGY',
      '来源与口径',
      '这一页用来回答「你的数据凭什么可信」：每条记录指向哪个原始页面、核验到什么程度、哪些格子是真的没有公开数据。',
      ''
    )}

    <div class="ov-grid">
      ${panel(
        '数据诚信四条规则',
        `<div class="notice">
          <b>1. 无来源不入库。</b>新增记录必须填写至少一条可访问的来源 URL，否则接口直接拒绝写入。<br/>
          <b>2. 只收录可核实的字段。</b>价格、销量、销售额、样板工程四类数据在公开渠道几乎不可得，本库不设这些维度，也不用行业均值去填补。<br/>
          <b>3. 等级可见。</b>每条记录标注核验等级（官方原文 / 权威媒体 / B2B 挂牌 / 研究报告 / 待核验），弱来源不会被伪装成硬数据。<br/>
          <b>4. 缺口公开。</b>没有数据的「子分类 × 维度」组合在本页与概览页列出，作为下一步调研任务，而不是隐藏。
        </div>
        <div style="margin-top:14px" class="table-wrap">
          <table class="data"><thead><tr><th>核验等级</th><th>含义</th><th>条数</th></tr></thead><tbody>
          ${ctx.meta.catalog.verificationLevels
            .map(
              (v) =>
                `<tr><td>${verifyBadge(v.id)}</td><td class="cell-org">${esc(v.desc)}</td>
                 <td class="num">${ctx.stats?.byVerification?.[v.id] ?? 0}</td></tr>`
            )
            .join('')}
          </tbody></table>
        </div>`,
        { hint: '规则写进代码而不是文档' }
      )}
      ${panel(
        '文献数据来源',
        `<dl>
          <div class="field"><dt>提供方</dt><dd>${esc(src.literatureProvider.provider || 'Crossref REST API')}</dd></div>
          <div class="field"><dt>采集时间</dt><dd class="num">${esc(
            fmtDate(src.literatureProvider.generatedAt || src.literatureProvider.updatedAt)
          )}</dd></div>
          <div class="field"><dt>文献总量</dt><dd class="num">${src.literatureProvider.total ?? ctx.meta.counts.literature}</dd></div>
          <div class="field"><dt>许可</dt><dd>${esc(src.literatureProvider.license || 'Crossref 开放元数据')}</dd></div>
          <div class="field"><dt>X-Mol</dt><dd>深链检索 + 粘贴导入（不静默抓取）</dd></div>
        </dl>
        <div class="form-hint" style="margin-top:10px">
          每条文献都可用 DOI 在 doi.org 打开原文页面核验；摘要版权归原出版方，此处仅作检索索引。
        </div>`,
        { hint: '元数据可溯源' }
      )}
    </div>

    ${panel(
      '来源登记表',
      `<div class="table-wrap"><table class="data"><thead><tr>
        <th>来源地址</th><th>标题</th><th>被引用次数</th><th>支撑维度</th>
      </tr></thead><tbody>${rows}</tbody></table></div>`,
      { hint: `${src.sources.length} 个独立来源`, flush: true }
    )}

    ${panel('未覆盖的数据缺口', gapBlocks, {
      hint: '这些位置显示为空是有意的',
      actions: api.isStatic ? '' : `<a class="btn sm primary" href="#/ingest">去补录</a>`
    })}
  `;
}

/* ------------------------------------------------------------------ 录入页 */

export async function renderIngest(root, ctx, params) {
  const presetBoard = params.get('board') || 'dc';
  const presetSub = params.get('sub') || 'dc-1';
  const presetType = params.get('type') || 'company';

  root.innerHTML = `
    ${head(
      'DATA INGEST',
      '情报录入',
      '录入一条带出处的产业信息。系统强制要求来源 URL，写入后立刻出现在对应板块的列表与检索结果中。',
      `<a class="btn" href="/api/export/records">导出全部记录 CSV</a>
       <a class="btn" href="/api/export/literature">导出文献 CSV</a>`
    )}
    <div class="ov-grid">
      ${panel(
        '新增记录',
        `<form id="ingest-form">
          <div class="form-grid">
            <div class="form-row"><label>维度 *</label>
              <select name="type" id="f-type">
                ${ctx.meta.catalog.dimensions
                  .filter((d) => d.id !== 'literature')
                  .map((d) => `<option value="${d.id}" ${d.id === presetType ? 'selected' : ''}>${esc(d.name)}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="form-row"><label>板块 *</label>
              <select name="board" id="f-board">
                ${ctx.meta.catalog.boards
                  .map((b) => `<option value="${b.id}" ${b.id === presetBoard ? 'selected' : ''}>${esc(b.name)}</option>`)
                  .join('')}
              </select>
            </div>
          </div>
          <div class="form-row"><label>子分类 *</label>
            <select name="sub" id="f-sub"></select>
          </div>
          <div class="form-grid">
            <div class="form-row"><label>名称 *</label><input name="name" required placeholder="例：Cs₀.₃₃WO₃ 纳米粉体 / XX-WO3-30" /></div>
            <div class="form-row"><label>英文名</label><input name="nameEn" placeholder="Cesium Tungsten Bronze Powder" /></div>
          </div>
          <div class="form-grid">
            <div class="form-row"><label>主体（企业/机构）</label><input name="org" placeholder="例：XX 新材料股份有限公司" /></div>
            <div class="form-row"><label>国别 / 地区</label><input name="region" placeholder="中国 · 江苏苏州" /></div>
          </div>
          <div class="form-grid">
            <div class="form-row"><label>产业链角色 / 形态</label><input name="role" placeholder="粉体 / 浆料 / 涂料 / 膜 / 设备" /></div>
            <div class="form-row"><label>核验等级 *</label>
              <select name="verification">
                ${ctx.meta.catalog.verificationLevels
                  .map(
                    (v) =>
                      `<option value="${v.id}" ${v.id === 'official' ? 'selected' : ''}>${esc(v.name)} — ${esc(v.desc)}</option>`
                  )
                  .join('')}
              </select>
            </div>
          </div>
          <div class="form-row"><label>摘要 / 说明</label>
            <textarea name="summary" style="min-height:80px;font-family:inherit" placeholder="一句话说明这条情报的关键信息"></textarea>
          </div>
          <div class="form-row"><label>公开技术参数（每行 键: 值）</label>
            <textarea name="specs" placeholder="可见光透过率: 70%
红外阻隔率: 95%
一次粒径: 30 nm"></textarea>
          </div>
          <div class="form-row"><label>来源（每行 标题 | URL，至少一条）*</label>
            <textarea name="sources" placeholder="住友金属矿山 产品页 | https://crossmining.smm.co.jp/material/nir_absorbing_materials/
标准信息平台 T/ZZB 2304-2021 | https://www.spc.org.cn/online/xxx.html"></textarea>
          </div>
          <div class="form-row"><label>标签（逗号分隔）</label><input name="tags" placeholder="近红外吸收,建筑玻璃,窗膜" /></div>
          <button class="btn primary" type="submit">写入并校验</button>
          <span class="form-hint" style="margin-left:10px">写入前会校验来源 URL，缺失则拒绝</span>
        </form>`,
        { hint: '来源强制' }
      )}
      ${panel(
        '录入前请先确认',
        `<div class="notice">
          <b>能录什么：</b>官网产品页与参数表、企业新闻、政府与协会公示、标准平台详情页、专利公开页、B2B 企业展台（需注明平台）。<br/><br/>
          <b>不能录什么：</b>没有出处的口头传闻，以及价格、销量、销售额这类在公开渠道普遍不可得的数据——本库已不设这些维度，避免用估算值污染判断。<br/><br/>
          <b>参数录入建议：</b>把页面原文照录到「公开技术参数」，不同来源的口径冲突就分条录入并各自附来源，让读者自己判断。
        </div>
        <div class="form-hint" style="margin-top:12px">
          录入后记录会带上 id、createdAt、updatedAt，来源链接在列表、卡片、详情抽屉三处可见。
        </div>`,
        { hint: '入库守则' }
      )}
    </div>
  `;

  const fBoard = root.querySelector('#f-board');
  const fSub = root.querySelector('#f-sub');
  const fillSubs = () => {
    const b = ctx.meta.catalog.boards.find((x) => x.id === fBoard.value);
    fSub.innerHTML = b.subs
      .map((s) => `<option value="${s.id}" ${s.id === presetSub ? 'selected' : ''}>${esc(s.name)}</option>`)
      .join('');
  };
  fillSubs();
  fBoard.addEventListener('change', fillSubs);

  root.querySelector('#ingest-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const specs = {};
    String(fd.get('specs') || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const idx = line.indexOf(':');
        if (idx > 0) specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      });
    const sources = String(fd.get('sources') || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, url] = line.split('|').map((s) => s.trim());
        return url
          ? { title, url, accessed: new Date().toISOString().slice(0, 10), kind: 'manual' }
          : { title: line, url: line };
      })
      .filter((s) => /^https?:\/\//i.test(s.url || ''));

    const payload = {
      type: fd.get('type'),
      board: fd.get('board'),
      subs: [fd.get('sub')],
      name: fd.get('name'),
      nameEn: fd.get('nameEn') || '',
      org: fd.get('org') || '',
      region: fd.get('region') || '',
      country: (fd.get('region') || '').split(/[·\s]/)[0] || '',
      role: fd.get('role') || '',
      summary: fd.get('summary') || '',
      specs,
      sources,
      verification: fd.get('verification'),
      tags: String(fd.get('tags') || '')
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)
    };

    try {
      const rec = await api.createRecord(payload);
      ctx.stats = null;
      ctx.toast(`已写入 ${rec.id}：${rec.name}`);
      e.target.reset();
      fillSubs();
      ctx.openRecord(rec.id);
    } catch (err) {
      ctx.toast(err.message, true);
    }
  });
}

/* ------------------------------------------------------------------ 文献弹窗 */

function modalShell(title, bodyHtml, footHtml) {
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = `<div class="modal">
    <div class="modal-head"><h3>${esc(title)}</h3><button class="btn ghost sm" data-close style="margin-left:auto">关闭</button></div>
    <div class="modal-body">${bodyHtml}</div>
    <div class="modal-foot">${footHtml}</div>
  </div>`;
  document.body.appendChild(mask);
  const close = () => mask.remove();
  mask.addEventListener('click', (e) => {
    if (e.target === mask || e.target.closest('[data-close]')) close();
  });
  return { mask, close };
}

function crossrefModal(ctx, { q = '', board = '', sub = '' } = {}) {
  const subName = (id) => ctx.meta.catalog.boards.flatMap((b) => b.subs).find((s) => s.id === id)?.name || id;
  const { mask } = modalShell(
    'Crossref 在线检索并入库',
    `<div class="form-row"><label>检索式（英文关键词效果最好）</label>
       <input id="cr-q" value="${esc(q)}" placeholder="cesium tungsten bronze / radiative cooling coating" /></div>
     <div class="form-grid">
       <div class="form-row"><label>归入板块</label>
         <select id="cr-board"><option value="">自动判断</option>
         ${ctx.meta.catalog.boards.map((b) => `<option value="${b.id}" ${board === b.id ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}
         </select></div>
       <div class="form-row"><label>返回条数</label>
         <select id="cr-rows"><option>10</option><option selected>20</option><option>40</option></select></div>
     </div>
     <div class="form-hint">数据源 api.crossref.org（开放接口，无需 Key）。返回条目均带真实 DOI，可直接点开核验。</div>
     <div id="cr-result" style="margin-top:14px"></div>`,
    `<button class="btn" data-close>取消</button>
     <button class="btn primary" id="cr-go">检索并入库</button>`
  );

  const go = async () => {
    const btn = mask.querySelector('#cr-go');
    const out = mask.querySelector('#cr-result');
    btn.disabled = true;
    btn.textContent = '检索中…';
    try {
      const res = await api.crossref({
        q: mask.querySelector('#cr-q').value,
        board: mask.querySelector('#cr-board').value || null,
        subs: sub ? [sub] : [],
        rows: Number(mask.querySelector('#cr-rows').value)
      });
      out.innerHTML = `<div class="notice info">抓到 ${res.fetched} 条，新增 ${res.merged.added} 条，更新 ${res.merged.updated} 条，文献库共 ${res.merged.total} 条。</div>
        <div style="margin-top:10px;max-height:280px;overflow:auto">
        ${res.items
          .slice(0, 8)
          .map(
            (i) => `<div style="padding:8px 0;border-bottom:1px dashed var(--line)">
                <div style="font-size:12.8px">${esc(i.title)}</div>
                <div class="cell-en">${esc(i.journal || '')} · ${esc(i.year || '')} · DOI ${esc(i.doi)} · ${(i.subs || [])
              .map(subName)
              .map(esc)
              .join(' / ')}</div></div>`
          )
          .join('')}</div>`;
      ctx.toast(`Crossref 入库完成：+${res.merged.added}`);
    } catch (err) {
      out.innerHTML = `<div class="notice" style="border-color:rgba(229,100,109,.4);color:#f0a7ab">${esc(err.message)}</div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '检索并入库';
    }
  };
  mask.querySelector('#cr-go').addEventListener('click', go);
  mask.querySelector('#cr-q').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') go();
  });
}

function xmolModal(ctx, { q = '', board = '' } = {}) {
  const { mask } = modalShell(
    'X-Mol 检索与粘贴导入',
    `<div class="notice">
      X-Mol 对自动化访问返回「访问受限」，本系统不绕过其保护。请按两步操作：<b>先在浏览器打开检索页</b>，<b>再把看到的条目粘贴回这里</b>。
     </div>
     <div class="form-row" style="margin-top:14px"><label>X-Mol 检索词</label>
       <div style="display:flex;gap:8px">
         <input id="xm-q" value="${esc(q)}" placeholder="cesium tungsten bronze" />
         <button class="btn" id="xm-open">打开 X-Mol 检索页 ↗</button>
       </div>
     </div>
     <div class="form-grid">
       <div class="form-row"><label>归入板块</label>
         <select id="xm-board"><option value="">不指定</option>
         ${ctx.meta.catalog.boards.map((b) => `<option value="${b.id}" ${board === b.id ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}
         </select></div>
       <div class="form-row"><label>解析格式</label>
         <input value="自动识别：自由文本 / DOI / BibTeX / RIS" disabled /></div>
     </div>
     <div class="form-row"><label>粘贴内容</label>
       <textarea id="xm-raw" placeholder="铯钨青铜透明隔热涂层研究进展
张三, 李四
材料导报, 2023, 37(4): 1-9. DOI: 10.xxxx/xxxxx

（可一次粘贴多条，用空行分隔；也支持 BibTeX / RIS 整段粘贴）"></textarea>
     </div>
     <div id="xm-result"></div>`,
    `<button class="btn" data-close>取消</button>
     <button class="btn primary" id="xm-import">解析并入库</button>`
  );

  mask.querySelector('#xm-open').addEventListener('click', async () => {
    try {
      const { url } = await api.xmolUrl(mask.querySelector('#xm-q').value);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      ctx.toast(err.message, true);
    }
  });

  mask.querySelector('#xm-import').addEventListener('click', async () => {
    const out = mask.querySelector('#xm-result');
    try {
      const res = await api.importLiterature({
        raw: mask.querySelector('#xm-raw').value,
        board: mask.querySelector('#xm-board').value || null
      });
      out.innerHTML = `<div class="notice info">解析 ${res.parsed} 条，新增 ${res.merged.added}，更新 ${res.merged.updated}。</div>
        ${res.warnings.length ? `<div class="form-hint" style="margin-top:8px">提示：${esc(res.warnings.join('；'))}</div>` : ''}`;
      ctx.toast(`已导入 ${res.merged.added} 条文献`);
    } catch (err) {
      out.innerHTML = `<div class="notice" style="border-color:rgba(229,100,109,.4);color:#f0a7ab">${esc(err.message)}</div>`;
    }
  });
}

/* ------------------------------------------------------------------ 检索页 */

export async function renderSearch(root, ctx, params) {
  const q = params.get('q') || '';
  if (!q.trim()) {
    ctx.navigate('#/');
    return;
  }
  const res = await api.search(q);
  const subName = (id) => ctx.meta.catalog.boards.flatMap((b) => b.subs).find((s) => s.id === id)?.name || id;

  const group = (key, title) => {
    const items = res.groups[key] || [];
    if (!items.length) return '';
    return panel(
      `${title} · ${items.length}`,
      `<div class="table-wrap"><table class="data"><tbody>${items
        .slice(0, 12)
        .map((it) => {
          const subText = it.kind === 'literature'
            ? [it.item.journal, it.item.year].filter(Boolean).join(' · ')
            : it.item.summary || '';
          const clipped = subText.length > 88 ? `${subText.slice(0, 88)}…` : subText;
          return `<tr data-${it.kind === 'literature' ? 'lit' : 'record'}="${esc(it.id)}">
        <td style="width:92px">${typeTag(it.type)}</td>
        <td><div class="cell-name">${esc(it.kind === 'literature' ? it.title : it.item.name || it.item.org)}</div>
            <div class="cell-en">${esc(clipped)}</div></td>
        <td style="width:186px">${(it.subs || [])
          .map((s) => `<span class="sub-chip">${esc(subName(s))}</span>`)
          .join(' ')}</td>
      </tr>`;
        })
        .join('')}</tbody></table></div>`,
      { flush: true }
    );
  };

  const blocks = [
    group('company', '生产商'),
    group('product', '产品资料'),
    group('standard', '标准与专利'),
    group('literature', '学术文献')
  ].filter(Boolean);

  root.innerHTML = `
    ${head('SEARCH', `检索：${q}`, `跨板块、跨维度命中 <b style="color:#0f1b2a">${res.total}</b> 条结果（记录 + 文献）。`, '')}
    ${
      blocks.length
        ? blocks.join('<div style="height:16px"></div>')
        : emptyState(
            '没有命中结果',
            '换个关键词试试，例如「铯钨青铜」「CsxWO3」「辐射制冷」「radiative cooling」「PVB」「发射率」。',
            `<a class="btn sm" href="#/literature">去文献库按关键词在线检索</a>`
          )
    }
  `;

  root.querySelectorAll('[data-record]').forEach((el) =>
    el.addEventListener('click', () => ctx.openRecord(el.dataset.record))
  );
  root.querySelectorAll('[data-lit]').forEach((el) =>
    el.addEventListener('click', async () => {
      const { items } = await api.literature({ q, limit: 400 });
      const found = items.find((i) => i.id === el.dataset.lit);
      if (found) ctx.openLiterature(found);
    })
  );
}
