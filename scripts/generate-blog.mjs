import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const articlesDir = path.join(__dirname, 'blog', 'articles');
const outRoot = path.join(root, 'frontend', 'public', 'blog');
const publicMirror = path.join(root, 'backend', 'public', 'blog');
const { renderArticlePage, renderListingPage, studio } = require('./blog/layout');

const ARTICLE_FILES = [
  'false-ceiling.js',
  'modular-kitchen.js',
  'luxury-tv-unit.js',
  'dressing.js',
  'entrance.js',
  'mandir.js',
  'study.js',
  'feature-wall.js',
  'floor-tile.js',
  'almira.js',
  'bathroom.js'
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeBoth(relativePath, contents) {
  const a = path.join(outRoot, relativePath);
  const b = path.join(publicMirror, relativePath);
  ensureDir(path.dirname(a));
  ensureDir(path.dirname(b));
  fs.writeFileSync(a, contents);
  fs.writeFileSync(b, contents);
}

function wordCount(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function updateSitemap(articles) {
  const urls = [
    { loc: `${studio.siteUrl}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${studio.siteUrl}/blog/`, changefreq: 'weekly', priority: '0.8' },
    ...articles.map((article) => ({
      loc: `${studio.siteUrl}/blog/${article.slug}/`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: studio.publishedDate
    }))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((entry) => {
    const last = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : '';
    return `  <url>\n    <loc>${entry.loc}</loc>${last}\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`;
  }).join('\n')}\n</urlset>\n`;

  for (const target of [
    path.join(root, 'frontend', 'public', 'sitemap.xml'),
    path.join(root, 'backend', 'public', 'sitemap.xml')
  ]) {
    fs.writeFileSync(target, xml);
  }
}

function main() {
  const missing = ARTICLE_FILES.filter((file) => !fs.existsSync(path.join(articlesDir, file)));
  if (missing.length) {
    console.error(`Missing article modules:\n- ${missing.join('\n- ')}`);
    process.exit(1);
  }

  const articles = ARTICLE_FILES.map((file) => require(path.join(articlesDir, file)));
  ensureDir(outRoot);
  ensureDir(publicMirror);

  // Keep shared CSS in both public trees.
  const css = fs.readFileSync(path.join(outRoot, 'blog.css'), 'utf8');
  fs.writeFileSync(path.join(publicMirror, 'blog.css'), css);

  writeBoth('index.html', renderListingPage(articles));

  const report = [];
  for (const article of articles) {
    const html = renderArticlePage(article);
    writeBoth(path.join(article.slug, 'index.html'), html);
    report.push({
      slug: article.slug,
      title: article.title,
      words: wordCount(article.bodyHtml),
      primaryKeyword: article.primaryKeyword
    });
  }

  updateSitemap(articles);
  console.log(JSON.stringify({ ok: true, count: articles.length, report }, null, 2));
}

main();
