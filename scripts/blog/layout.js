const studio = require('./studio');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteUrl(path) {
  if (!path) return studio.siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return `${studio.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function header(active) {
  const link = (href, label, key) => {
    const current = active === key ? ' aria-current="page"' : '';
    return `<a href="${href}"${current}>${label}</a>`;
  };
  return `
<header class="blog-header">
  <a class="blog-brand" href="/">
    <img src="${studio.logoPath}" alt="Interior Lord" width="120" height="70" />
    <span>Interior Lord</span>
  </a>
  <nav class="blog-nav" aria-label="Primary">
    ${link('/', 'Work', 'work')}
    ${link('/blog/', 'Blog', 'blog')}
    ${link('/#contact', 'Contact', 'contact')}
  </nav>
</header>`;
}

function footer() {
  return `
<footer class="blog-footer">
  <span>${escapeHtml(studio.brand)} · ${escapeHtml(studio.address)}</span>
  <span>
    <a href="mailto:${studio.email}">${studio.email}</a>
    ·
    <a href="tel:${studio.phoneTel}">${studio.phone}</a>
    ·
    <a href="${studio.socialHref}" rel="noopener noreferrer" target="_blank">${studio.socialText}</a>
  </span>
</footer>`;
}

function fonts() {
  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/blog/blog.css">`;
}

function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${studio.siteUrl}/#organization`,
    name: studio.brand,
    url: studio.siteUrl,
    email: studio.email,
    telephone: studio.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Gaur City Centre',
      addressLocality: 'Greater Noida West',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN'
    },
    sameAs: [studio.socialHref],
    logo: absoluteUrl(studio.logoPath)
  };
}

function renderArticlePage(article) {
  const canonical = absoluteUrl(`/blog/${article.slug}/`);
  const image = absoluteUrl(article.image);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: studio.siteUrl + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog/') },
      { '@type': 'ListItem', position: 3, name: article.title, item: canonical }
    ]
  };
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.metaDescription,
    image: [image],
    datePublished: studio.publishedDate,
    dateModified: studio.publishedDate,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    author: { '@type': 'Organization', name: studio.brand, url: studio.siteUrl },
    publisher: organizationSchema(),
    keywords: [article.primaryKeyword, ...(article.secondaryKeywords || [])].join(', ')
  };

  const related = (article.related || []).map((item) => (
    `<li><a href="/blog/${item.slug}/">${escapeHtml(item.title)}</a></li>`
  )).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${escapeHtml(article.title)} | Interior Lord</title>
<meta name="description" content="${escapeHtml(article.metaDescription)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Interior Lord">
<meta property="og:title" content="${escapeHtml(article.title)}">
<meta property="og:description" content="${escapeHtml(article.metaDescription)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(article.title)}">
<meta name="twitter:description" content="${escapeHtml(article.metaDescription)}">
<meta name="twitter:image" content="${image}">
<link rel="icon" href="${studio.faviconPath}" type="image/png">
${fonts()}
<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
</head>
<body>
${header('blog')}
<main class="blog-main blog-article">
  <nav class="blog-breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a><span>/</span>
    <a href="/blog/">Blog</a><span>/</span>
    <span>${escapeHtml(article.spaceLabel || article.title)}</span>
  </nav>
  <span class="blog-kicker">Interior design guide</span>
  <h1>${escapeHtml(article.title)}</h1>
  <p class="blog-lead">${escapeHtml(article.excerpt)}</p>
  <div class="blog-meta-row">
    <span>${studio.publishedLabel}</span>
    <span>${escapeHtml(studio.brand)}</span>
    <span>Selected Spaces — ${escapeHtml(article.spaceLabel)}</span>
  </div>
  <figure class="blog-hero-image">
    <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt)}" width="1200" height="750" loading="eager">
    <figcaption class="blog-caption">Interior Lord Selected Spaces — ${escapeHtml(article.spaceLabel)}</figcaption>
  </figure>
  <article class="blog-content">
    ${article.bodyHtml}
  </article>
  <aside class="blog-cta">
    <h2>Plan this space with Interior Lord</h2>
    <p>If you are planning ${escapeHtml(article.spaceLabel.toLowerCase())} as part of a home interior in Greater Noida West, start a conversation with the studio.</p>
    <div class="blog-actions">
      <a class="blog-button" href="/#contact">Contact Interior Lord</a>
      <a class="blog-button blog-button-secondary" href="/">View Selected Spaces</a>
      <a class="blog-button blog-button-secondary" href="https://wa.me/${studio.phoneTel.replace(/\D/g, '')}">WhatsApp</a>
    </div>
  </aside>
  <aside class="blog-related">
    <h2>Related guides</h2>
    <ul>${related}</ul>
  </aside>
</main>
${footer()}
</body>
</html>
`;
}

function renderListingPage(articles) {
  const canonical = absoluteUrl('/blog/');
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/blog/${article.slug}/`),
      name: article.title
    }))
  };
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Interior Design Ideas and Guides',
    description: 'Practical interior design guides from Interior Lord for kitchens, ceilings, bedrooms, bathrooms and more.',
    url: canonical,
    publisher: organizationSchema()
  };

  const cards = articles.map((article) => `
    <a class="blog-card" href="/blog/${article.slug}/">
      <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt)}" width="640" height="440" loading="lazy">
      <div class="blog-card-body">
        <span>${escapeHtml(article.spaceLabel)}</span>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.excerpt)}</p>
        <span>Read more</span>
      </div>
    </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Interior Design Ideas and Guides | Interior Lord Blog</title>
<meta name="description" content="Explore Interior Lord guides on false ceilings, modular kitchens, wardrobes, bathrooms and more for modern homes in Greater Noida West.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Interior Lord">
<meta property="og:title" content="Interior Design Ideas and Guides | Interior Lord Blog">
<meta property="og:description" content="Practical interior design guides for modern homes from Interior Lord.">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${absoluteUrl(studio.logoPath)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${studio.faviconPath}" type="image/png">
${fonts()}
<script type="application/ld+json">${JSON.stringify(collection)}</script>
<script type="application/ld+json">${JSON.stringify(itemList)}</script>
</head>
<body>
${header('blog')}
<main class="blog-main">
  <section class="blog-hero">
    <nav class="blog-breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span>/</span><span>Blog</span>
    </nav>
    <span class="blog-kicker">Interior Lord journal</span>
    <h1>Interior Design Ideas and Guides</h1>
    <p class="blog-lead">Practical planning notes for the Selected Spaces on the Interior Lord website — from modular kitchens and false ceilings to wardrobes, entrances and bathroom updates.</p>
  </section>
  <section class="blog-grid" aria-label="Blog articles">
    ${cards}
  </section>
</main>
${footer()}
</body>
</html>
`;
}

module.exports = { renderArticlePage, renderListingPage, absoluteUrl, studio };
