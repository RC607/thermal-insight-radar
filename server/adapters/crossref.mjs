/**
 * Crossref 在线检索适配器（开放 API，无需 Key）。
 * 站点内的「在线补录文献」直接走这里，返回的 DOI 均为真实可访问条目。
 */
const MAILTO = 'thermal-radar@example.com';
const UA = `ThermalInsightRadar/1.0 (mailto:${MAILTO})`;

const stripTags = (s) =>
  (s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

export function classifySubs(board, text, fallback = []) {
  const hints = {
    'dc-1': ['powder', 'nanoparticle', 'synthesis', 'nanocrystal', 'bronze'],
    'dc-2': ['dispersion', 'slurry', 'colloidal', 'paste', 'sol-gel'],
    'dc-3': ['coating', 'paint', 'spray', 'coated'],
    'dc-4': ['film', 'foil', 'laminate', 'pet', 'pvb', 'window'],
    'rc-1': ['filler', 'particle', 'microsphere', 'barium sulfate', 'alumina', 'silica', 'zirconia'],
    'rc-2': ['slurry', 'dispersion', 'suspension', 'paste'],
    'rc-3': ['coating', 'paint', 'pigment', 'brush', 'spray'],
    'rc-4': ['film', 'membrane', 'sheet', 'roll', 'laminate']
  };
  const lower = (text || '').toLowerCase();
  const hits = new Set();
  for (const [sub, words] of Object.entries(hints)) {
    if (board && !sub.startsWith(board)) continue;
    if (words.some((w) => lower.includes(w))) hits.add(sub);
  }
  return hits.size ? [...hits] : [...fallback];
}

export async function queryCrossref({ q, board = null, subs = [], rows = 20 }) {
  if (!q || !q.trim()) throw new Error('检索词不能为空');
  const url = new URL('https://api.crossref.org/works');
  url.searchParams.set('query.bibliographic', q.trim());
  url.searchParams.set('rows', String(Math.min(Math.max(Number(rows) || 20, 1), 100)));
  url.searchParams.set('filter', 'from-pub-date:2010-01-01,type:journal-article');
  url.searchParams.set('select', 'DOI,title,author,container-title,issued,abstract,is-referenced-by-count,URL,subject,publisher');
  url.searchParams.set('mailto', MAILTO);

  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`Crossref 返回 HTTP ${res.status}`);
  const json = await res.json();
  const items = json.message?.items ?? [];

  return items
    .map((item) => {
      const title = stripTags((item.title || [])[0] || '');
      const doi = (item.DOI || '').toLowerCase();
      if (!title || !doi) return null;
      const authors = (item.author || [])
        .map((a) => [a.given, a.family].filter(Boolean).join(' ').trim() || a.name || '')
        .filter(Boolean);
      const abstract = stripTags(item.abstract || '').slice(0, 900);
      const year = item.issued?.['date-parts']?.[0]?.[0] ?? null;
      return {
        id: `lit-${doi.replace(/[^a-z0-9]/g, '-')}`,
        title,
        authors: authors.slice(0, 6),
        authorCount: authors.length,
        journal: stripTags((item['container-title'] || [])[0] || ''),
        publisher: item.publisher || '',
        year,
        doi,
        url: `https://doi.org/${doi}`,
        citations: item['is-referenced-by-count'] ?? 0,
        abstract,
        board,
        subs: classifySubs(board, `${title} ${abstract}`, subs),
        keywords: (item.subject || []).slice(0, 6),
        source: 'Crossref REST API',
        xmolUrl: `https://www.x-mol.com/paper/search/q?option=${encodeURIComponent(title.slice(0, 120))}`,
        retrievedAt: new Date().toISOString().slice(0, 10),
        query: q.trim()
      };
    })
    .filter(Boolean);
}
