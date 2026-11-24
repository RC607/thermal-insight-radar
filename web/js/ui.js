/** DOM / 格式化小工具 */

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const fmtNum = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  return v.toLocaleString('zh-CN');
};

export const fmtDate = (s) => {
  if (!s) return '—';
  const d = String(s).slice(0, 10);
  return d;
};

export const TYPE_LABEL = {
  company: '生产商',
  product: '产品资料',
  standard: '标准与专利',
  literature: '学术文献'
};

export const VERIFY_LABEL = {
  official: '官方原文',
  media: '权威媒体',
  b2b: 'B2B 挂牌',
  report: '研究报告',
  pending: '待核验'
};

export const typeTag = (t) => `<span class="type-tag ${esc(t)}">${esc(TYPE_LABEL[t] || t)}</span>`;
export const verifyBadge = (v) =>
  `<span class="badge ${esc(v || 'pending')}" title="${esc(VERIFY_LABEL[v] || '未标注')}">${esc(
    VERIFY_LABEL[v] || '待核验'
  )}</span>`;

export const srcLink = (sources = []) => {
  const valid = (sources || []).filter((s) => s && s.url);
  if (!valid.length) return '<span class="src-count">无来源</span>';
  const first = valid[0];
  const host = (() => {
    try {
      return new URL(first.url).hostname.replace(/^www\./, '');
    } catch {
      return '链接';
    }
  })();
  return `<a class="src-link" href="${esc(first.url)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${esc(
    host
  )} ↗</a>${valid.length > 1 ? `<span class="src-count">+${valid.length - 1}</span>` : ''}`;
};

export const domainOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export function toast(msg, isErr = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('err', !!isErr);
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3200);
}

export const debounce = (fn, wait = 260) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
