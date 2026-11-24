/**
 * X-Mol 接入适配器（合规版）。
 *
 * 事实说明：X-Mol 对服务端抓取有反爬保护（headless 访问返回「访问受限」页），
 * 因此本系统不做静默爬取，而是提供三条可核查的接入路径：
 *   1) 深链跳转：生成 X-Mol 检索 URL，用户在自己浏览器登录态下打开；
 *   2) 粘贴导入：把 X-Mol 页面上的条目/DOI/BibTeX/RIS 粘贴进来，服务端解析入库；
 *   3) 回链绑定：Crossref 补录的文献自动附带 X-Mol 同名检索链接，方便二次核对。
 */

export function buildSearchUrl(query, { option = '' } = {}) {
  const q = String(query || '').trim();
  const base = 'https://www.x-mol.com/paper/search/q';
  const params = new URLSearchParams();
  if (q) params.set('option', q);
  if (option) params.set('searchType', option);
  return `${base}?${params.toString()}`;
}

const DOI_RE = /10\.\d{4,9}\/[^\s"'<>)\]]+/i;

function cleanDoi(raw) {
  return raw.replace(/[.,;:]+$/, '').toLowerCase();
}

function parseBibtex(raw) {
  const out = [];
  const blocks = raw.split(/@(?=article|inproceedings|misc|book|patent)/i).slice(1);
  for (const b of blocks) {
    const field = (name) => {
      const m = b.match(new RegExp(`${name}\\s*=\\s*[{"]([^}"]*)[}"]`, 'i'));
      return m ? m[1].trim() : '';
    };
    const title = field('title');
    if (!title) continue;
    out.push({
      title,
      authors: field('author').split(/\s+and\s+/).filter(Boolean),
      journal: field('journal') || field('booktitle'),
      year: Number(field('year')) || null,
      doi: cleanDoi(field('doi')),
      abstract: field('abstract')
    });
  }
  return out;
}

function parseRis(raw) {
  const out = [];
  const blocks = raw.split(/^ER\s+-.*$/im).filter((b) => /TY\s+-/i.test(b));
  for (const b of blocks) {
    const pick = (tag) => {
      const m = b.match(new RegExp(`^${tag}\\s+-\\s*(.+)$`, 'im'));
      return m ? m[1].trim() : '';
    };
    const title = pick('TI') || pick('T1');
    if (!title) continue;
    out.push({
      title,
      authors: [...b.matchAll(/^(?:AU|A1)\s+-\s*(.+)$/gim)].map((m) => m[1].trim()),
      journal: pick('JO') || pick('JF') || pick('T2'),
      year: Number((pick('PY') || pick('Y1')).slice(0, 4)) || null,
      doi: cleanDoi(pick('DO')),
      abstract: pick('AB')
    });
  }
  return out;
}

/**
 * 解析用户粘贴的文本。支持：BibTeX、RIS、纯 DOI 列表、以及从 X-Mol 复制的中文条目块。
 * 返回 { items, warnings }，绝不臆造 DOI —— 没有 DOI 的条目会被标记出来。
 */
export function parsePasted(raw, { board = null } = {}) {
  const text = String(raw || '').replace(/\r\n/g, '\n').trim();
  const warnings = [];
  if (!text) return { items: [], warnings: ['粘贴内容为空'] };

  let items = [];
  if (/^@(article|inproceedings|misc)/im.test(text)) {
    items = parseBibtex(text);
    warnings.push('按 BibTeX 解析');
  } else if (/^TY\s+-/im.test(text)) {
    items = parseRis(text);
    warnings.push('按 RIS 解析');
  } else {
    // 以空行分块，逐块识别标题 / DOI / 期刊年份
    const blocks = text
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);
    for (const block of blocks) {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (!lines.length) continue;
      const doiMatch = block.match(DOI_RE);
      let title = lines.find((l) => l.length > 18 && !DOI_RE.test(l) && !/^https?:/.test(l)) || lines[0];
      title = title.replace(/^\d+[.)]\s*/, '').replace(/^题目[:：]\s*/, '').trim();
      const yearMatch = block.match(/(19|20)\d{2}/);
      const journalLine = lines.find((l) => /(19|20)\d{2}/.test(l) && l !== title) || '';
      items.push({
        title,
        authors: [],
        journal: journalLine.replace(/\s*[,，]\s*(19|20)\d{2}.*$/, '').trim(),
        year: yearMatch ? Number(yearMatch[0]) : null,
        doi: doiMatch ? cleanDoi(doiMatch[0]) : '',
        abstract: ''
      });
    }
    warnings.push('按自由文本解析');
  }

  const seen = new Set();
  const normalized = items
    .filter((it) => {
      const key = (it.doi || it.title).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((it, i) => {
      if (!it.doi) warnings.push(`第 ${i + 1} 条缺 DOI，已按「待核验」入库，请人工补全`);
      return {
        id: it.doi ? `lit-${it.doi.replace(/[^a-z0-9]/g, '-')}` : `lit-paste-${Date.now()}-${i}`,
        title: it.title,
        authors: (it.authors || []).slice(0, 6),
        authorCount: (it.authors || []).length,
        journal: it.journal || '',
        year: it.year || null,
        doi: it.doi || '',
        url: it.doi ? `https://doi.org/${it.doi}` : buildSearchUrl(it.title),
        citations: 0,
        abstract: it.abstract || '',
        board,
        subs: [],
        keywords: [],
        source: it.doi ? 'X-Mol 粘贴导入（Crossref 可校验 DOI）' : 'X-Mol 粘贴导入（无 DOI）',
        xmolUrl: buildSearchUrl(it.title.slice(0, 120)),
        retrievedAt: new Date().toISOString().slice(0, 10),
        pendingVerification: !it.doi
      };
    });

  return { items: normalized, warnings: [...new Set(warnings)] };
}
