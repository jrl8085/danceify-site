#!/usr/bin/env node
/*
 * build-site-meta.js — derives the site's cross-page metadata from the HTML on disk.
 *
 * Run from the repo root:
 *
 *   node tools/build-site-meta.js            build everything (see steps below)
 *   node tools/build-site-meta.js --check    validate, print a summary, exit 1 on a problem
 *
 * Optional flags:
 *   --exclude=blog,de,fr   leave the pages under these top-level dirs untouched and, with
 *                          --check, do not report their problems (they are still READ for
 *                          the sitemap, llms.txt, feed.xml and the hreflang groups of other
 *                          pages). Use it while someone else is editing those directories;
 *                          the final run should go without it.
 *   --schema | --hreflang | --sitemap | --llms | --feed
 *                          run only the named step(s) instead of all of them.
 *
 * Steps (all idempotent: running twice changes nothing the second time):
 *   hreflang  For every page group (an English page and its translations at the same path
 *             under de/ fr/ it/ es/ pt-br/ ko/ ja/) with 2+ members, writes the full set of
 *             <link rel="alternate" hreflang> tags (+ x-default = the English page, + the
 *             og:locale:alternate tags) between <!-- hreflang:start --> / <!-- hreflang:end -->
 *             right after the canonical link, and a <nav class="lang-switch"> between
 *             <!-- lang-switch:start --> / <!-- lang-switch:end --> right after </header>.
 *             Older hreflang links and hand-written lang-switch navs are removed.
 *             Pages with no translation get neither block.
 *   schema    Rewrites the Organization (#org) and MobileApplication (#app) nodes of each
 *             page's JSON-LD @graph from the single definition below (marked with
 *             <!-- schema:org --> above the script), sets inLanguage/dateModified on the
 *             page's WebPage node, and on dance-style pages adds the @graph, BreadcrumbList,
 *             og:image and a VideoObject (when the page's clip exists in videos/).
 *             Pages that have og:title but no og:image get the site's og-image.
 *             index.html and blog/index.html get the RSS <link>.
 *   sitemap   sitemap.xml: every HTML page except 404.html, with xhtml:link hreflang entries
 *             and <lastmod> from the page's "Updated <Month D, YYYY>" line, its
 *             "Facts current as of" line, its JSON-LD dateModified, else its git date.
 *   llms      llms.txt: regenerates the "Pages in other languages" and "Guides" sections
 *             (between [//]: # (generated:start ...) / (generated:end) lines) and writes
 *             llms-full.txt with the plain text of the English pages.
 *   feed      feed.xml: RSS 2.0 of blog/*.html, newest first.
 *
 * No dependencies. Node 18+.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://danceifyapp.com';
const APP_STORE_URL = 'https://apps.apple.com/app/id6760788471';
const OG_IMAGE = `${SITE}/og-image.png`;
const OG_IMAGE_ALT = 'Danceify: a person, a baby, a dog and a cat dancing';

const LOCALE_DIRS = ['de', 'fr', 'it', 'es', 'pt-br', 'ko', 'ja'];
const LOCALES = {
  en: { hreflang: 'en', name: 'English', og: 'en_US', label: 'Language' },
  de: { hreflang: 'de', name: 'Deutsch', og: 'de_DE', label: 'Sprache' },
  es: { hreflang: 'es', name: 'Español', og: 'es_ES', label: 'Idioma' },
  fr: { hreflang: 'fr', name: 'Français', og: 'fr_FR', label: 'Langue' },
  it: { hreflang: 'it', name: 'Italiano', og: 'it_IT', label: 'Lingua' },
  ja: { hreflang: 'ja', name: '日本語', og: 'ja_JP', label: '言語' },
  ko: { hreflang: 'ko', name: '한국어', og: 'ko_KR', label: '언어' },
  'pt-br': { hreflang: 'pt-BR', name: 'Português (Brasil)', og: 'pt_BR', label: 'Idioma' },
};
// Order of the language switcher and of the hreflang links.
const LOCALE_ORDER = ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt-br'];

// ---------------------------------------------------------------------------
// The one definition of the Organization and the app. Price changes go here.
// ---------------------------------------------------------------------------
const ORG = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: 'Danceify',
  url: `${SITE}/`,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE}/logo.png`,
    width: 1024,
    height: 1024,
  },
  sameAs: [APP_STORE_URL],
};

const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  name: 'Danceify',
  url: `${SITE}/`,
  publisher: { '@id': `${SITE}/#org` },
};

function appNode(dateModified) {
  return {
    '@type': 'MobileApplication',
    '@id': `${SITE}/#app`,
    name: 'Danceify - AI Dance Videos',
    alternateName: [
      'Danceify',
      'Danceify - AIダンス動画',
      'Danceify - Videos de Baile IA',
      'Danceify - Vídeos de Dança IA',
      'Danceify - AI 댄스 영상 메이커',
    ],
    operatingSystem: 'iOS',
    applicationCategory: 'EntertainmentApplication',
    url: `${SITE}/`,
    downloadUrl: APP_STORE_URL,
    installUrl: APP_STORE_URL,
    sameAs: [APP_STORE_URL],
    image: OG_IMAGE,
    publisher: { '@id': `${SITE}/#org` },
    description:
      'An iPhone app that turns one photo of a person, a baby, a dog or a cat into a 10-second dance video in 17 dance styles, plus Premium themed templates. Free to download; no account, sign-up or email.',
    inLanguage: ['en', 'ja', 'es', 'pt-BR', 'ko', 'de', 'fr', 'it'],
    offers: [
      {
        '@type': 'Offer',
        name: 'Download',
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Coin packs (one-time)',
        price: '3.99',
        priceCurrency: 'USD',
        description: 'One-time coin packs start at $3.99 (US).',
      },
      {
        '@type': 'Offer',
        name: 'Creation Weekly',
        price: '11.99',
        priceCurrency: 'USD',
        description:
          '$11.99 a week in the US with 4,000 coins a week. No free trial; eligible new subscribers may get the first week for $2.99 (US) with 1,200 coins, then $11.99 a week.',
      },
    ],
    dateModified,
  };
}

// ---------------------------------------------------------------------------
// Files and paths
// ---------------------------------------------------------------------------
const SKIP_DIRS = new Set(['.git', 'node_modules', 'tools', 'videos']);

function listHtml() {
  const out = [];
  (function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) {
        if (!SKIP_DIRS.has(ent.name)) walk(path.join(dir, ent.name));
      } else if (ent.name.endsWith('.html')) {
        out.push(path.relative(ROOT, path.join(dir, ent.name)).split(path.sep).join('/'));
      }
    }
  })(ROOT);
  return out.sort();
}

function urlPathOf(rel) {
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function localeOf(rel) {
  const first = rel.split('/')[0];
  if (LOCALE_DIRS.includes(first)) return { locale: first, key: rel.slice(first.length + 1) };
  return { locale: 'en', key: rel };
}

function topDir(rel) {
  return rel.includes('/') ? rel.split('/')[0] : '';
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function writeIfChanged(rel, content) {
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs) && fs.readFileSync(abs, 'utf8') === content) return false;
  fs.writeFileSync(abs, content);
  return true;
}

// ---------------------------------------------------------------------------
// Page parsing
// ---------------------------------------------------------------------------
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isoFromLongDate(month, day, year) {
  const m = MONTHS.indexOf(month);
  if (m < 0) return null;
  return `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function gitDate(rel) {
  const r = spawnSync('git', ['log', '-1', '--format=%cs', '--', rel], { cwd: ROOT, encoding: 'utf8' });
  const d = (r.stdout || '').trim();
  if (d) return d;
  return fs.statSync(path.join(ROOT, rel)).mtime.toISOString().slice(0, 10);
}

function gitAddedDate(rel) {
  const r = spawnSync('git', ['log', '--diff-filter=A', '--format=%cs', '--', rel], { cwd: ROOT, encoding: 'utf8' });
  const lines = (r.stdout || '').trim().split('\n').filter(Boolean);
  return lines.length ? lines[lines.length - 1] : gitDate(rel);
}

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d))
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&copy;/g, '©')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function attr(html, re) {
  const m = html.match(re);
  return m ? decodeEntities(m[1]).trim() : '';
}

function ldBlocks(html) {
  const out = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const block = { start: m.index, end: m.index + m[0].length, raw: m[1], json: null, error: null };
    try {
      block.json = JSON.parse(m[1]);
    } catch (e) {
      block.error = e.message;
    }
    out.push(block);
  }
  return out;
}

function pageDate(rel, html) {
  let m = html.match(/Updated (January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})/);
  if (m) return isoFromLongDate(m[1], m[2], m[3]);
  m = html.match(/Facts current as of (January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})/);
  if (m) return isoFromLongDate(m[1], m[2], m[3]);
  // JSON-LD: the page's own node first, then any other node except the shared #app node.
  let other = null;
  for (const b of ldBlocks(html)) {
    if (!b.json) continue;
    const nodes = Array.isArray(b.json['@graph']) ? b.json['@graph'] : [b.json];
    for (const n of nodes) {
      const d = typeof n.dateModified === 'string' ? n.dateModified.slice(0, 10) : null;
      if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
      if (typeof n['@id'] === 'string' && n['@id'].endsWith('#webpage')) return d;
      if (n['@id'] !== `${SITE}/#app` && !other) other = d;
    }
  }
  if (other) return other;
  return gitDate(rel);
}

function datePublished(rel, html) {
  const m = html.match(/"datePublished":\s*"(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : gitAddedDate(rel);
}

function loadPage(rel) {
  const html = read(rel);
  const { locale, key } = localeOf(rel);
  return {
    rel,
    html,
    locale,
    key,
    urlPath: urlPathOf(rel),
    url: SITE + urlPathOf(rel),
    title: attr(html, /<title>([\s\S]*?)<\/title>/),
    description: attr(html, /<meta name="description" content="([^"]*)"/),
    lang: attr(html, /<html lang="([^"]*)"/),
    canonical: attr(html, /<link rel="canonical" href="([^"]*)"/),
    date: pageDate(rel, html),
  };
}

function buildGroups(pages) {
  const groups = new Map();
  for (const p of pages) {
    if (p.rel === '404.html') continue;
    if (!groups.has(p.key)) groups.set(p.key, {});
    groups.get(p.key)[p.locale] = p;
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Step: hreflang + language switcher
// ---------------------------------------------------------------------------
function hreflangBlock(group, page) {
  const lines = ['<!-- hreflang:start -->'];
  for (const loc of LOCALE_ORDER) {
    if (group[loc]) lines.push(`<link rel="alternate" hreflang="${LOCALES[loc].hreflang}" href="${group[loc].url}">`);
  }
  if (group.en) lines.push(`<link rel="alternate" hreflang="x-default" href="${group.en.url}">`);
  for (const loc of LOCALE_ORDER) {
    if (group[loc] && loc !== page.locale) lines.push(`<meta property="og:locale:alternate" content="${LOCALES[loc].og}">`);
  }
  lines.push('<!-- hreflang:end -->');
  return lines.join('\n');
}

function langSwitch(group, page) {
  const parts = [];
  for (const loc of LOCALE_ORDER) {
    if (!group[loc]) continue;
    const L = LOCALES[loc];
    if (loc === page.locale) parts.push(`<span aria-current="page" lang="${L.hreflang}">${L.name}</span>`);
    else parts.push(`<a href="${group[loc].urlPath}" hreflang="${L.hreflang}" lang="${L.hreflang}">${L.name}</a>`);
  }
  return [
    '  <!-- lang-switch:start -->',
    `  <nav class="lang-switch" aria-label="${LOCALES[page.locale].label}">${parts.join(' &middot; ')}</nav>`,
    '  <!-- lang-switch:end -->',
  ].join('\n');
}

// <!-- footer-langs:start -->…<!-- footer-langs:end --> lists the page group's members (own-language
// names, current one marked); "footer-langs:start home" lists the home page's group instead, for
// "In other languages" sections on pages that have no translation of their own. A group with
// no translations gives an empty block. Legacy hand-written <div class="links footer-langs"> is replaced.
function footerLangs(group, page, indent) {
  if (Object.keys(group).length < 2) return `${indent}<!-- footer-langs:start -->\n${indent}<!-- footer-langs:end -->`;
  const lines = [`${indent}<!-- footer-langs:start -->`, `${indent}<div class="links footer-langs">`];
  for (const loc of LOCALE_ORDER) {
    if (!group[loc]) continue;
    const L = LOCALES[loc];
    if (group[loc].rel === page.rel) lines.push(`${indent}  <span aria-current="page" lang="${L.hreflang}">${L.name}</span>`);
    else lines.push(`${indent}  <a href="${group[loc].urlPath}" hreflang="${L.hreflang}" lang="${L.hreflang}">${L.name}</a>`);
  }
  lines.push(`${indent}</div>`, `${indent}<!-- footer-langs:end -->`);
  return lines.join('\n');
}

function applyFooterLangs(html, page, group, homeGroup) {
  html = html.replace(/^([ \t]*)<!-- footer-langs:start( home)? -->[\s\S]*?<!-- footer-langs:end -->/gm, (m, indent, home) => {
    const g = home ? homeGroup : group;
    const block = footerLangs(g, page, indent);
    return home ? block.replace('footer-langs:start -->', 'footer-langs:start home -->') : block;
  });
  // Legacy hand-written list (only when it is not already inside markers).
  html = html.replace(/^(?<!<!-- footer-langs:start(?: home)? -->\n)([ \t]*)<div class="links footer-langs">[\s\S]*?<\/div>/m, (m, indent) => footerLangs(group, page, indent));
  return html;
}

function applyHreflang(page, group, homeGroup) {
  let html = applyFooterLangs(page.html, page, group, homeGroup || {});
  const headEnd = html.indexOf('</head>');
  if (headEnd < 0) return html;
  let head = html.slice(0, headEnd);
  let rest = html.slice(headEnd);

  // Strip the old block, stray hreflang links and og:locale:alternate tags from <head>.
  head = head.replace(/^[ \t]*<!-- hreflang:start -->[\s\S]*?<!-- hreflang:end -->[ \t]*\r?\n/m, '');
  head = head.replace(/^[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*">[ \t]*\r?\n/gm, '');
  head = head.replace(/^[ \t]*<meta property="og:locale:alternate" content="[^"]*">[ \t]*\r?\n/gm, '');
  head = head.replace(/\n{3,}/g, '\n\n');

  // Strip the old switcher (generated or hand-written) from <body>.
  rest = rest.replace(/\n[ \t]*<!-- lang-switch:start -->[\s\S]*?<!-- lang-switch:end -->/, '');
  rest = rest.replace(/\n[ \t]*<nav class="lang-switch"[\s\S]*?<\/nav>/, '');

  const members = Object.keys(group).length;
  if (members >= 2) {
    head = head.replace(/^([ \t]*<link rel="canonical" href="[^"]*">[ \t]*\r?\n)/m, (m) => m + hreflangBlock(group, page) + '\n');
    rest = rest.replace('</header>', '</header>\n' + langSwitch(group, page));
  }
  return head + rest;
}

// ---------------------------------------------------------------------------
// Step: schema and metadata
// ---------------------------------------------------------------------------
const STYLE_DIR = 'dance-styles/';

function isStylePage(rel) {
  return rel.startsWith(STYLE_DIR) && rel !== STYLE_DIR + 'index.html';
}

function styleNames() {
  // url → name, from the ItemList on dance-styles/index.html
  const map = new Map();
  const rel = STYLE_DIR + 'index.html';
  if (!fs.existsSync(path.join(ROOT, rel))) return map;
  for (const b of ldBlocks(read(rel))) {
    if (!b.json) continue;
    const nodes = b.json['@graph'] || [b.json];
    for (const n of nodes) {
      if (n['@type'] !== 'ItemList') continue;
      for (const item of n.itemListElement || []) {
        if (item.url && item.name) map.set(item.url, item.name);
      }
    }
  }
  return map;
}

function normalizeLang(lang) {
  if (!lang) return 'en';
  const l = lang.toLowerCase();
  if (l === 'pt-br') return 'pt-BR';
  return l.split('-')[0];
}

function pageNodeOf(graph) {
  return graph.find((n) => typeof n['@id'] === 'string' && n['@id'].endsWith('#webpage'));
}

function videoFor(page) {
  const m = page.html.match(/<source src="\.\.\/videos\/([^"]+\.mp4)"/);
  if (!m) return null;
  if (!fs.existsSync(path.join(ROOT, 'videos', m[1]))) return null;
  return `${SITE}/videos/${m[1]}`;
}

function serializeLd(obj) {
  return `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
}

function applySchema(page, ctx) {
  let html = page.html;
  const lang = normalizeLang(page.lang);
  const styleName = ctx.styleNames.get(page.url);
  const stylePage = isStylePage(page.rel);

  // 1. Rewrite the @graph that carries #org / #app.
  const blocks = ldBlocks(html);
  let graphBlock = blocks.find((b) => b.json && Array.isArray(b.json['@graph']) && b.json['@graph'].some((n) => n['@id'] === `${SITE}/#org`));

  const upsertVideo = (graph) => {
    const contentUrl = stylePage ? videoFor(page) : null;
    const idx = graph.findIndex((n) => n['@type'] === 'VideoObject' && n['@id'] === `${page.url}#video`);
    if (!contentUrl) {
      if (idx >= 0) graph.splice(idx, 1);
      return;
    }
    const node = {
      '@type': 'VideoObject',
      '@id': `${page.url}#video`,
      name: `${styleName || page.title} AI dance video made with Danceify`,
      description: page.description,
      thumbnailUrl: [OG_IMAGE],
      contentUrl,
      uploadDate: page.date,
      duration: 'PT10S',
      inLanguage: lang,
      publisher: { '@id': `${SITE}/#org` },
    };
    if (idx >= 0) graph[idx] = node;
    else graph.push(node);
    const wp = pageNodeOf(graph);
    if (wp) wp.video = { '@id': node['@id'] };
  };

  if (graphBlock) {
    const graph = graphBlock.json['@graph'];
    const orgIdx = graph.findIndex((n) => n['@id'] === `${SITE}/#org`);
    graph[orgIdx] = ORG;
    const siteIdx = graph.findIndex((n) => n['@id'] === `${SITE}/#website`);
    if (siteIdx >= 0) graph[siteIdx] = WEBSITE;
    const appIdx = graph.findIndex((n) => n['@id'] === `${SITE}/#app`);
    if (appIdx >= 0) graph[appIdx] = appNode(ctx.appDate);
    else graph.splice(orgIdx + 1, 0, appNode(ctx.appDate));
    const wp = pageNodeOf(graph);
    if (wp) {
      wp.inLanguage = lang;
      wp.dateModified = page.date;
    }
    upsertVideo(graph);
    const before = html.slice(0, graphBlock.start).replace(/[ \t]*<!-- schema:org -->[ \t]*\r?\n?$/, '');
    html = before + '<!-- schema:org -->\n' + serializeLd(graphBlock.json) + html.slice(graphBlock.end);
  } else if (stylePage) {
    const graph = [
      ORG,
      WEBSITE,
      appNode(ctx.appDate),
      {
        '@type': 'WebPage',
        '@id': `${page.url}#webpage`,
        url: page.url,
        name: page.title,
        description: page.description,
        inLanguage: lang,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#app` },
        dateModified: page.date,
      },
    ];
    upsertVideo(graph);
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Danceify', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Dance styles', item: `${SITE}/dance-styles/` },
        { '@type': 'ListItem', position: 3, name: styleName || page.title, item: page.url },
      ],
    };
    const hasBreadcrumb = blocks.some((b) => b.json && b.json['@type'] === 'BreadcrumbList');
    const insert =
      (hasBreadcrumb ? '' : serializeLd(breadcrumb) + '\n') +
      '<!-- schema:org -->\n' +
      serializeLd({ '@context': 'https://schema.org', '@graph': graph }) +
      '\n';
    html = html.replace('</head>', insert + '</head>');
  }

  // 2. og:image / twitter:image on pages that have cards but no image.
  if (/<meta property="og:title"/.test(html) && !/<meta property="og:image"/.test(html)) {
    const imgLines =
      `<meta property="og:image" content="${OG_IMAGE}">\n` +
      `<meta property="og:image:width" content="1200">\n` +
      `<meta property="og:image:height" content="630">\n` +
      `<meta property="og:image:alt" content="${OG_IMAGE_ALT}">\n`;
    html = html.replace(/^([ \t]*<meta property="og:type" content="[^"]*">[ \t]*\r?\n)/m, (m) => m + imgLines);
  }
  if (/<meta property="og:title"/.test(html) && !/<meta property="og:site_name"/.test(html)) {
    html = html.replace(/^([ \t]*<meta property="og:type" content="[^"]*">[ \t]*\r?\n)/m, (m) => m + '<meta property="og:site_name" content="Danceify">\n');
  }
  if (/<meta name="twitter:card"/.test(html) && !/<meta name="twitter:image"/.test(html)) {
    html = html.replace(/^([ \t]*<meta name="twitter:description" content="[^"]*">[ \t]*\r?\n)/m, (m) => m + `<meta name="twitter:image" content="${OG_IMAGE}">\n`);
  }

  // 3. RSS discovery link on the home page and the blog index.
  if ((page.rel === 'index.html' || page.rel === 'blog/index.html') && !/type="application\/rss\+xml"/.test(html)) {
    html = html.replace(
      /^([ \t]*<link rel="canonical" href="[^"]*">[ \t]*\r?\n)/m,
      (m) => m + `<link rel="alternate" type="application/rss+xml" title="Danceify guides" href="${SITE}/feed.xml">\n`
    );
  }
  return html;
}

// ---------------------------------------------------------------------------
// Step: sitemap.xml
// ---------------------------------------------------------------------------
function priorityOf(page) {
  if (page.rel === 'index.html') return '1.0';
  if (page.locale !== 'en') return page.key === 'index.html' ? '0.8' : '0.7';
  if (['privacy.html', 'terms.html'].includes(page.rel)) return '0.4';
  if (page.rel === 'support.html') return '0.6';
  if (page.rel.startsWith('blog/')) return '0.7';
  if (page.rel.startsWith(STYLE_DIR)) return '0.8';
  if (page.rel === 'faq.html') return '0.7';
  return '0.9';
}

function sortForSitemap(a, b) {
  const rank = (p) => (p.rel === 'index.html' ? 0 : p.locale === 'en' ? 1 : 2 + LOCALE_ORDER.indexOf(p.locale));
  return rank(a) - rank(b) || a.rel.localeCompare(b.rel);
}

function buildSitemap(pages, groups) {
  const out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', '        xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
  for (const p of [...pages].filter((p) => p.rel !== '404.html').sort(sortForSitemap)) {
    out.push('  <url>');
    out.push(`    <loc>${p.url}</loc>`);
    out.push(`    <lastmod>${p.date}</lastmod>`);
    out.push(`    <priority>${priorityOf(p)}</priority>`);
    const group = groups.get(p.key) || {};
    if (Object.keys(group).length >= 2) {
      for (const loc of LOCALE_ORDER) {
        if (group[loc]) out.push(`    <xhtml:link rel="alternate" hreflang="${LOCALES[loc].hreflang}" href="${group[loc].url}"/>`);
      }
      if (group.en) out.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${group.en.url}"/>`);
    }
    out.push('  </url>');
  }
  out.push('</urlset>', '');
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Step: llms.txt and llms-full.txt
// ---------------------------------------------------------------------------
function blogPosts(pages) {
  return pages
    .filter((p) => p.rel.startsWith('blog/') && p.rel !== 'blog/index.html')
    .map((p) => ({ ...p, published: datePublished(p.rel, p.html) }))
    .sort((a, b) => b.published.localeCompare(a.published) || a.rel.localeCompare(b.rel));
}

function replaceSection(text, heading, bodyLines, tag) {
  const start = `[//]: # (generated:start ${tag})`;
  const end = `[//]: # (generated:end ${tag})`;
  const generated = [start, ...bodyLines, end].join('\n');
  const marked = new RegExp(`\\[//\\]: # \\(generated:start ${tag}\\)[\\s\\S]*?\\[//\\]: # \\(generated:end ${tag}\\)`);
  if (marked.test(text)) return text.replace(marked, () => generated);
  const re = new RegExp(`(^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[ \\t]*\\n\\n?)([\\s\\S]*?)(?=\\n## |$(?![\\r\\n]))`, 'm');
  if (!re.test(text)) throw new Error(`llms.txt: section "## ${heading}" not found`);
  return text.replace(re, (m, head) => head + generated + '\n');
}

function buildLlms(pages) {
  let text = read('llms.txt');
  const localePages = pages.filter((p) => p.locale !== 'en').sort((a, b) => LOCALE_ORDER.indexOf(a.locale) - LOCALE_ORDER.indexOf(b.locale) || a.rel.localeCompare(b.rel));
  const langLines = localePages.map((p) => `- [${LOCALES[p.locale].name}: ${p.title}](${p.url})`);
  if (!langLines.length) langLines.push('- (none yet)');
  text = replaceSection(text, 'Pages in other languages', langLines, 'locale-pages');

  const guideLines = blogPosts(pages).map((p) => `- [${p.title}](${p.url}): ${p.description}`);
  guideLines.push(`- [All guides](${SITE}/blog/)`);
  text = replaceSection(text, 'Guides', guideLines, 'guides');
  return text;
}

function inlineText(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function htmlToText(html) {
  let b = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [null, html])[1];
  b = b.replace(/<!--[\s\S]*?-->/g, '');
  b = b.replace(/<(script|style|svg|video|noscript|iframe|template)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  b = b.replace(/<(nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  // h1 → ##, h2 → ###, …: the page title is the only level-1 heading in llms-full.txt.
  b = b.replace(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, t, c) => `\n\n${'#'.repeat(Math.min(6, +t[1] + 1))} ${inlineText(c)}\n\n`);
  b = b.replace(/<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi, (m, dt, dd) => `\n- ${inlineText(dt)}: ${inlineText(dd)}\n`);
  b = b.replace(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi, (m, row) => {
    const cells = [];
    row.replace(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi, (mm, c) => cells.push(inlineText(c)));
    return `\n${cells.join(' | ')}\n`;
  });
  b = b.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (m, c) => `\n- ${inlineText(c)}\n`);
  b = b.replace(/<br\s*\/?>/gi, '\n');
  b = b.replace(/<\/(p|div|section|article|ul|ol|dl|table|blockquote|figure|figcaption|details|summary|aside|main)>/gi, '\n\n');
  b = b.replace(/<[^>]+>/g, '');
  b = decodeEntities(b);
  return b
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^(- .*)\n\n(?=- )/gm, '$1\n')
    .trim();
}

function fullTextOrder(pages) {
  const byRel = new Map(pages.map((p) => [p.rel, p]));
  const en = pages.filter((p) => p.locale === 'en');
  const pick = (rel) => (byRel.has(rel) ? [byRel.get(rel)] : []);
  const fixed = new Set(['index.html', 'about/index.html', 'faq.html', 'support.html', 'privacy.html', 'terms.html', '404.html']);
  const answers = en.filter((p) => /^[^/]+\/index\.html$/.test(p.rel) && !fixed.has(p.rel) && !p.rel.startsWith(STYLE_DIR) && !p.rel.startsWith('blog/'));
  const styles = en.filter((p) => isStylePage(p.rel)).sort((a, b) => a.rel.localeCompare(b.rel));
  return [
    ...pick('index.html'),
    ...pick('about/index.html'),
    ...pick('faq.html'),
    ...pick('support.html'),
    ...answers.sort((a, b) => a.rel.localeCompare(b.rel)),
    ...pick(STYLE_DIR + 'index.html'),
    ...styles,
    ...blogPosts(pages),
  ];
}

function buildLlmsFull(pages, llmsText) {
  const header = llmsText.split(/\n## /)[0].trimEnd();
  const out = [header, '', 'This file holds the full text of the English pages on danceifyapp.com. The short index is https://danceifyapp.com/llms.txt.', ''];
  for (const p of fullTextOrder(pages)) {
    out.push('---', '', `# ${p.title}`, '', `URL: ${p.url}`, `Updated: ${p.date}`);
    if (p.description) out.push('', p.description);
    out.push('', htmlToText(p.html), '');
  }
  const localePages = pages.filter((p) => p.locale !== 'en').sort((a, b) => LOCALE_ORDER.indexOf(a.locale) - LOCALE_ORDER.indexOf(b.locale) || a.rel.localeCompare(b.rel));
  if (localePages.length) {
    out.push('---', '', '# Pages in other languages', '');
    for (const p of localePages) out.push(`- ${LOCALES[p.locale].name}: ${p.title} — ${p.url}`);
    out.push('');
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Step: feed.xml
// ---------------------------------------------------------------------------
function rfc822(iso) {
  return new Date(`${iso}T12:00:00Z`).toUTCString();
}

function buildFeed(pages) {
  const posts = blogPosts(pages);
  const latest = posts.reduce((d, p) => (p.date > d ? p.date : d), posts.length ? posts[0].date : '2026-01-01');
  const out = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Danceify guides</title>',
    `    <link>${SITE}/blog/</link>`,
    '    <description>Guides from Danceify, the iPhone app that turns one photo of a person, a baby, a dog or a cat into a 10-second dance video.</description>',
    '    <language>en</language>',
    `    <lastBuildDate>${rfc822(latest)}</lastBuildDate>`,
    `    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>`,
  ];
  for (const p of posts) {
    out.push('    <item>');
    out.push(`      <title>${escapeXml(p.title)}</title>`);
    out.push(`      <link>${p.url}</link>`);
    out.push(`      <guid isPermaLink="true">${p.url}</guid>`);
    out.push(`      <pubDate>${rfc822(p.published)}</pubDate>`);
    out.push(`      <description>${escapeXml(p.description)}</description>`);
    out.push('    </item>');
  }
  out.push('  </channel>', '</rss>', '');
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// --check
// ---------------------------------------------------------------------------
function resolveInternal(pageRel, href) {
  let h = href.trim();
  if (!h || /^(#|mailto:|tel:|javascript:|data:)/i.test(h)) return null;
  if (h.startsWith(SITE + '/')) h = h.slice(SITE.length);
  else if (h === SITE) h = '/';
  else if (/^([a-z]+:)?\/\//i.test(h)) return null;
  h = h.replace(/[?#].*$/, '');
  if (!h) return null;
  const base = '/' + path.posix.dirname(pageRel) + '/';
  let p = h.startsWith('/') ? h : path.posix.resolve(base, h);
  if (p.endsWith('/')) p += 'index.html';
  return p;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function check(pages, groups, exclude) {
  const problems = [];
  const drift = [];
  const exists = (p) => fs.existsSync(path.join(ROOT, p));
  let ldCount = 0;
  let linkCount = 0;
  let skipped = 0;

  for (const p of pages) {
    if (exclude.has(topDir(p.rel))) {
      skipped++;
      continue;
    }
    const blocks = ldBlocks(p.html);
    const typesSeen = new Map();
    for (const b of blocks) {
      ldCount++;
      if (b.error) problems.push(`${p.rel}: JSON-LD does not parse (${b.error})`);
      if (!b.json) continue;
      const t = Array.isArray(b.json['@graph']) ? '@graph' : String(b.json['@type']);
      typesSeen.set(t, (typesSeen.get(t) || 0) + 1);
    }
    for (const [t, n] of typesSeen) if (n > 1) problems.push(`${p.rel}: ${n} JSON-LD blocks of type ${t}`);
    if (p.rel !== '404.html') {
      if (!p.canonical) problems.push(`${p.rel}: no canonical link`);
      else if (p.canonical !== p.url) problems.push(`${p.rel}: canonical is ${p.canonical}, expected ${p.url}`);
      const want = LOCALES[p.locale].hreflang.toLowerCase();
      if (normalizeLang(p.lang).toLowerCase() !== want) problems.push(`${p.rel}: <html lang="${p.lang}"> but the directory says ${want}`);
      if (!p.title) problems.push(`${p.rel}: no <title>`);
    }
    // hreflang targets
    const hre = /<link rel="alternate" hreflang="([^"]*)" href="([^"]*)">/g;
    let m;
    while ((m = hre.exec(p.html))) {
      const target = resolveInternal(p.rel, m[2]);
      if (!target || !exists(target)) problems.push(`${p.rel}: hreflang ${m[1]} points to ${m[2]}, which does not exist`);
    }
    // internal links, sources, posters and site URLs anywhere in the file (JSON-LD included)
    const seen = new Set();
    const re = /\b(?:href|src|poster)="([^"]*)"|"(https:\/\/danceifyapp\.com\/[^"\s<)]*)"/g;
    while ((m = re.exec(p.html))) {
      const raw = m[1] !== undefined ? m[1] : m[2];
      if (seen.has(raw)) continue;
      seen.add(raw);
      const target = resolveInternal(p.rel, raw);
      if (!target) continue;
      linkCount++;
      if (!exists(target)) problems.push(`${p.rel}: link to ${raw} does not resolve to a file`);
    }
    // schema drift (warn only: the build step fixes it)
    for (const b of blocks) {
      if (!b.json || !Array.isArray(b.json['@graph'])) continue;
      for (const n of b.json['@graph']) {
        if (n['@id'] === `${SITE}/#org` && !deepEqual(n, ORG)) drift.push(p.rel);
        if (n['@id'] === `${SITE}/#app`) {
          const { dateModified, ...rest } = n;
          const { dateModified: d2, ...want } = appNode('');
          if (!deepEqual(rest, want)) drift.push(p.rel);
        }
      }
    }
  }

  // Generated files: every site URL in them must exist.
  for (const f of ['sitemap.xml', 'llms.txt', 'llms-full.txt', 'feed.xml', 'robots.txt']) {
    if (!exists(f)) {
      problems.push(`${f} is missing`);
      continue;
    }
    const text = read(f);
    const re = /https:\/\/danceifyapp\.com\/[^"'\s<)]*/g;
    let m;
    const seen = new Set();
    while ((m = re.exec(text))) {
      const raw = m[0].replace(/[.,;:]+$/, '');
      if (seen.has(raw)) continue;
      seen.add(raw);
      const target = resolveInternal('index.html', raw);
      if (target && !exists(target)) problems.push(`${f}: ${raw} does not resolve to a file`);
    }
  }
  // Sitemap covers every page.
  if (exists('sitemap.xml')) {
    const sm = read('sitemap.xml');
    for (const p of pages) {
      if (p.rel !== '404.html' && !sm.includes(`<loc>${p.url}</loc>`)) problems.push(`sitemap.xml: ${p.url} is missing`);
    }
  }
  if (!exists('logo.png')) problems.push('logo.png is missing (the Organization schema points to it)');

  const groupsWithTranslations = [...groups.values()].filter((g) => Object.keys(g).length >= 2).length;
  console.log(`check: ${pages.length} pages (${skipped} skipped by --exclude), ${ldCount} JSON-LD blocks, ${linkCount} internal links, ${groups.size} page groups (${groupsWithTranslations} with translations)`);
  const drifted = [...new Set(drift)];
  if (drifted.length) console.log(`  warning: Organization/MobileApplication schema differs from the tool's definition on ${drifted.length} page(s); run the build to rewrite it: ${drifted.join(', ')}`);
  for (const e of problems) console.log(`  PROBLEM: ${e}`);
  console.log(problems.length ? `check: ${problems.length} problem(s)` : 'check: OK');
  return problems.length === 0;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
function main(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')).map((a) => a.split('=')[0]));
  const excludeArg = argv.find((a) => a.startsWith('--exclude='));
  const exclude = new Set(excludeArg ? excludeArg.slice('--exclude='.length).split(',').filter(Boolean) : []);
  const stepFlags = ['--schema', '--hreflang', '--sitemap', '--llms', '--feed'];
  const only = stepFlags.filter((f) => flags.has(f));
  const run = (f) => only.length === 0 || only.includes(f);

  let pages = listHtml().map(loadPage);
  let groups = buildGroups(pages);

  if (flags.has('--check')) {
    process.exit(check(pages, groups, exclude) ? 0 : 1);
  }

  const ctx = {
    styleNames: styleNames(),
    appDate: pages.filter((p) => p.locale === 'en').reduce((d, p) => (p.date > d ? p.date : d), '2026-01-01'),
  };

  const changed = [];
  if (run('--schema') || run('--hreflang')) {
    for (const p of pages) {
      if (p.rel === '404.html') continue;
      const editable = !exclude.has(topDir(p.rel));
      const rssOnly = p.rel === 'blog/index.html'; // the RSS link is wanted even when blog/ is excluded
      if (!editable && !rssOnly) continue;
      let html = p.html;
      if (editable && run('--schema')) html = applySchema({ ...p, html }, ctx);
      if (editable && run('--hreflang')) html = applyHreflang({ ...p, html }, groups.get(p.key) || { [p.locale]: p }, groups.get('index.html'));
      if (!editable && rssOnly && run('--schema') && !/type="application\/rss\+xml"/.test(html)) {
        html = html.replace(/^([ \t]*<link rel="canonical" href="[^"]*">[ \t]*\r?\n)/m, (m) => m + `<link rel="alternate" type="application/rss+xml" title="Danceify guides" href="${SITE}/feed.xml">\n`);
      }
      if (writeIfChanged(p.rel, html)) changed.push(p.rel);
    }
    // Re-read so the generated files see the edited pages.
    pages = listHtml().map(loadPage);
    groups = buildGroups(pages);
  }
  if (run('--sitemap') && writeIfChanged('sitemap.xml', buildSitemap(pages, groups))) changed.push('sitemap.xml');
  if (run('--llms')) {
    const llms = buildLlms(pages);
    if (writeIfChanged('llms.txt', llms)) changed.push('llms.txt');
    if (writeIfChanged('llms-full.txt', buildLlmsFull(pages, llms))) changed.push('llms-full.txt');
  }
  if (run('--feed') && writeIfChanged('feed.xml', buildFeed(pages))) changed.push('feed.xml');

  console.log(`build: ${pages.length} pages read, ${changed.length} file(s) written${exclude.size ? ` (excluded: ${[...exclude].join(', ')})` : ''}`);
  for (const f of changed) console.log(`  wrote ${f}`);
}

main(process.argv.slice(2));
