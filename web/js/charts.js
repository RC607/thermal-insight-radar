/** 纯手写 SVG 图表，不依赖任何 CDN，离线可运行。所有数值来自真实接口返回。 */
import { esc, fmtNum } from './ui.js';

let uid = 0;
const nextId = () => `c${++uid}`;

/**
 * 横向条形图：用于价格点位、期刊分布、企业地域分布等。
 * items: [{ label, value, color?, sub? }]
 */
export function barChart(items = [], { unit = '', labelWidth = 148, rowHeight = 26, color = '#3fb8c9' } = {}) {
  if (!Array.isArray(items) || !items.length) return emptyChart('暂无数据');
  const width = 720;
  const padTop = 6;
  const height = padTop + items.length * rowHeight + 8;
  const max = Math.max(...items.map((i) => Number(i.value) || 0), 1);
  const barMax = width - labelWidth - 74;
  const id = nextId();

  const rows = items
    .map((it, i) => {
      const y = padTop + i * rowHeight;
      const v = Number(it.value) || 0;
      const w = Math.max(2, (v / max) * barMax);
      const c = it.color || color;
      return `
      <g class="bar">
        <title>${esc(it.label)}：${esc(String(it.value))}${esc(unit)}</title>
        <text x="0" y="${y + 14}" fill="#56687a" font-size="11.5">${esc(truncate(it.label, 18))}</text>
        <rect x="${labelWidth}" y="${y + 3}" width="${barMax}" height="${rowHeight - 9}" fill="#eef2f7" rx="3"/>
        <rect x="${labelWidth}" y="${y + 3}" width="${w}" height="${rowHeight - 9}" fill="url(#${id}-g)" rx="3"/>
        <text x="${labelWidth + barMax + 8}" y="${y + 14}" fill="#0f1b2a" font-size="11.5" font-weight="600">${esc(
        fmtNum(it.value)
      )}${esc(unit)}</text>
      </g>`;
    })
    .join('');

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMinYMin meet" role="img">
    <defs><linearGradient id="${id}-g" x1="0" x2="1">
      <stop offset="0" stop-color="${color}" stop-opacity=".95"/>
      <stop offset="1" stop-color="${color}" stop-opacity=".45"/>
    </linearGradient></defs>
    ${rows}
  </svg>`;
}

/**
 * 纵向柱图：用于文献年度趋势。
 * points: [{ label, value }]
 */
export function columnChart(points = [], { color = '#9fb4ff', height = 190, unit = '篇' } = {}) {
  if (!Array.isArray(points) || !points.length) return emptyChart('暂无数据');
  const width = 720;
  const padL = 34;
  const padB = 26;
  const padT = 12;
  const innerW = width - padL - 12;
  const innerH = height - padT - padB;
  const max = Math.max(...points.map((p) => Number(p.value) || 0), 1);
  const step = innerW / points.length;
  const bw = Math.min(30, step * 0.62);
  const id = nextId();

  const ticks = [0, 0.5, 1].map((r) => {
    const y = padT + innerH - r * innerH;
    return `<line x1="${padL}" x2="${width - 10}" y1="${y}" y2="${y}" stroke="#e8eef5" stroke-dasharray="3 4"/>
      <text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#8798a8" font-size="10">${Math.round(max * r)}</text>`;
  });

  const bars = points
    .map((p, i) => {
      const v = Number(p.value) || 0;
      const h = (v / max) * innerH;
      const x = padL + i * step + (step - bw) / 2;
      const y = padT + innerH - h;
      return `<g class="bar">
        <title>${esc(p.label)}：${v}${unit}</title>
        <rect x="${x}" y="${y}" width="${bw}" height="${Math.max(1, h)}" fill="url(#${id}-g)" rx="3"/>
        <text x="${x + bw / 2}" y="${height - 9}" text-anchor="middle" fill="#8798a8" font-size="10">${esc(
        String(p.label).slice(2)
      )}</text>
        ${v > 0 ? `<text x="${x + bw / 2}" y="${y - 4}" text-anchor="middle" fill="#56687a" font-size="9.5" font-weight="600">${v}</text>` : ''}
      </g>`;
    })
    .join('');

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMinYMin meet" role="img">
    <defs><linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity=".9"/>
      <stop offset="1" stop-color="${color}" stop-opacity=".25"/>
    </linearGradient></defs>
    ${ticks.join('')}${bars}
  </svg>`;
}

/** 堆叠占比条：用于核验等级分布 */
export function stackBar(segments = []) {
  const total = segments.reduce((s, x) => s + (Number(x.value) || 0), 0);
  if (!total) return emptyChart('暂无数据');
  const bars = segments
    .filter((s) => Number(s.value) > 0)
    .map((s) => {
      const w = (Number(s.value) / total) * 100;
      return `<div title="${esc(s.label)}：${s.value}" style="width:${w}%;background:${s.color};height:100%"></div>`;
    })
    .join('');
  const legend = segments
    .map(
      (s) =>
        `<span><i style="background:${s.color}"></i>${esc(s.label)} <b style="color:#0f1b2a;font-weight:700">${s.value}</b></span>`
    )
    .join('');
  return `<div style="height:9px;border-radius:5px;overflow:hidden;display:flex;background:#eef2f7">${bars}</div>
    <div class="legend">${legend}</div>`;
}

export function emptyChart(text = '暂无数据') {
  return `<div class="empty" style="padding:28px 10px"><div class="e-icon">◔</div><p>${esc(text)}</p></div>`;
}

const truncate = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s));
