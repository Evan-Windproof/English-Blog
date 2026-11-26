import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const origin = 'https://en.evanwindproof.top';
const name = 'Evan Windproof';
const role = 'Independent Developer & Technical Researcher';
const introduction = 'I write about software engineering, operating system development, and technical experiments.';
const sections = [['/', 'Home'], ['/blog/', 'Blog'], ['/projects/', 'Projects'], ['/research/', 'Research'], ['/about/', 'About']];
const pageSize = 10;
const sitemap = [];
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const xml = (value) => escape(value).replaceAll('&#39;', '&apos;');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' });
const markdown = new MarkdownIt({
  highlight(code, language) {
    return language && hljs.getLanguage(language) ? hljs.highlight(code, { language }).value : '';
  },
});

async function output(file, content) {
  const path = join('dist', file);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

function spotlight(title, detail) {
  return `<header class="page-heading"><h1>${escape(title)}</h1><p>${escape(detail)}</p></header>`;
}

async function page(path, section, title, description, content, article) {
  const url = origin + path;
  const fullTitle = title === name ? title : `${title} | ${name}`;
  const nav = sections.map(([href, label]) =>
    `<a href="${href}"${href === path ? ' aria-current="page"' : href === section ? ' class="active"' : ''}>${label}</a>`).join('');
  sitemap.push(url);
  await output(join(path.slice(1), 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(fullTitle)}</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="${name}">
<meta property="og:title" content="${escape(fullTitle)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="${article ? 'article' : 'website'}">
${article ? `<meta property="article:published_time" content="${article.date}T00:00:00Z">` : ''}
<link rel="alternate" type="application/rss+xml" title="${name} RSS" href="/rss.xml">
<link rel="stylesheet" href="/assets/site.css">
${section === '/blog/' && !article ? '<script type="module" src="/assets/search.js"></script>' : ''}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="shell header-inner">
<a class="brand" href="/"><span aria-hidden="true">&gt;_</span> ${name}</a>
<nav aria-label="Main navigation">${nav}</nav>
</div></header>
<main id="main" class="shell">${content}</main>
<footer class="shell site-footer"><span>${name}</span><nav aria-label="External links"><a href="https://github.com/Evan-Windproof">GitHub</a><a href="/rss.xml">RSS</a></nav></footer>
</body>
</html>
`);
}

const topicPath = (kind, slug) => `/blog/${kind}/${slug}/`;
const dateLabel = ({ date }) => `<time datetime="${date}">${dateFormat.format(new Date(date))}</time>`;
const topicLinks = (kind, slugs) => slugs.map((slug) =>
  `<a class="topic" href="${topicPath(kind, slug)}">${escape(slug.replaceAll('-', ' '))}</a>`).join('');
const metadata = (post) => `<div class="metadata">${dateLabel(post)}${topicLinks('category', post.categories)}${topicLinks('tag', post.tags)}</div>`;
const listing = (posts) => posts.length ? `<ul class="article-list">${posts.map((post) =>
  `<li><h2><a href="${post.path}">${escape(post.title)}</a></h2><p>${escape(post.description)}</p>${metadata(post)}</li>`).join('')}</ul>`
  : '<p class="empty">No articles have been published yet.</p>';

async function readArticle(file) {
  const slug = file.slice(0, -3);
  const source = (await readFile(join('articles', file), 'utf8')).replaceAll('\r\n', '\n');
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source);
  if (!slugPattern.test(slug) || !match) throw new Error(`Invalid filename or front matter in ${file}`);
  const { title, description, date, draft, categories, tags } = JSON.parse(match[1]);
  if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim() ||
      typeof draft !== 'boolean' || ![categories, tags].every((list) =>
        Array.isArray(list) && list.every((label) => typeof label === 'string' && slugPattern.test(label)) &&
        new Set(list).size === list.length)) {
    throw new Error(`Invalid title, description, draft flag, categories, or tags in ${file}`);
  }
  if (draft) return null;
  const parsedDate = new Date(date);
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || !match[2].trim()) {
    throw new Error(`A valid publication date and article body are required in ${file}`);
  }
  if (['page', 'tag', 'category'].includes(slug)) throw new Error(`Reserved article slug in ${file}`);
  return { title, description, date, categories, tags, path: `/blog/${slug}/`, body: match[2] };
}

const files = (await readdir('articles')).filter((file) => file.endsWith('.md'));
const posts = (await Promise.all(files.map(readArticle))).filter(Boolean)
  .sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path));
const categories = [...new Set(posts.flatMap((post) => post.categories))].sort();
const tags = [...new Set(posts.flatMap((post) => post.tags))].sort();

await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await cp('assets', 'dist/assets', { recursive: true });

const cards = [
  ['/blog/', 'Blog', 'Software development notes and engineering observations.'],
  ['/projects/', 'Projects', 'Open-source projects and software experiments.'],
  ['/research/', 'Research', 'Operating systems and technical investigations.'],
  ['/about/', 'About', 'About Evan Windproof and this site.'],
];
await page('/', '/', name, `${role}. ${introduction}`, `
<header class="hero"><p class="role">${escape(role)}</p><h1>${name}</h1><p>${introduction}</p>
<a class="button" href="/blog/">Browse the blog <span aria-hidden="true">→</span></a></header>
<div class="cards">${cards.map(([href, label, detail]) => `<a class="card" href="${href}"><h2>${label} <span aria-hidden="true">↗</span></h2><p>${detail}</p></a>`).join('')}</div>
`);

await page('/projects/', '/projects/', 'Projects', 'Open-source projects and software experiments.', `
${spotlight('Projects', 'Open-source projects and software experiments.')}
<ul class="section-list"><li><h2>MLP OS Archive</h2><p>An introductory article is planned.</p></li>
<li><h2>Aelthoren</h2><p>A Gecko-based browser experiment. An article about its development is planned.</p></li></ul>
<p><a href="https://github.com/Evan-Windproof">Find Evan Windproof on GitHub</a></p>`);
await page('/research/', '/research/', 'Research', 'Technical research and experiments in operating systems and software.', `
${spotlight('Research', 'Technical research and experiments in operating systems and software.')}
<ul class="section-list"><li><h2>Exokernel operating systems</h2><p>An introductory exploration is planned.</p></li></ul>`);
await page('/about/', '/about/', 'About', `About ${name}, ${role}.`, `
${spotlight('About', role)}<div class="prose"><p>I’m Evan Windproof. ${introduction}</p>
<p>This is my independent English-language blog. It’s where I share development experiences, open-source projects, and observations from technical research.</p>
<p><a href="https://github.com/Evan-Windproof">Find me on GitHub</a></p></div>`);

const search = `<form id="search" role="search" hidden>
<label for="query">Search articles</label><div class="search-row"><input type="search" id="query" name="q" placeholder="Title, topic, or keyword"><button type="submit">Search</button></div>
</form><section id="search-results" aria-label="Search results" hidden><p id="search-status" role="status"></p><ul class="article-list" id="matches"></ul></section>`;

async function archive(base, title, description, entries, controls = '') {
  const count = Math.max(1, Math.ceil(entries.length / pageSize));
  const pathFor = (number) => number === 1 ? base : `${base}page/${number}/`;
  for (let number = 1; number <= count; number++) {
    const pagination = count === 1 ? '' : `<nav class="pagination" aria-label="Pagination">
${number > 1 ? `<a href="${pathFor(number - 1)}" rel="prev">← Newer</a>` : ''}
<span>Page ${number} of ${count}</span>
${number < count ? `<a href="${pathFor(number + 1)}" rel="next">Older →</a>` : ''}
</nav>`;
    const heading = number === 1 ? title : `${title} · Page ${number}`;
    await page(pathFor(number), '/blog/', heading, description,
      `${spotlight(heading, description)}${search}<div id="archive">${controls}${listing(entries.slice((number - 1) * pageSize, number * pageSize))}${pagination}</div>`);
  }
}

await archive('/blog/', 'Blog', 'Notes on software development, operating systems, and technical experiments.', posts,
  `${categories.length ? `<div class="metadata">Categories ${topicLinks('category', categories)}</div>` : ''}
${tags.length ? `<div class="metadata">Tags ${topicLinks('tag', tags)}</div>` : ''}`);

for (const [kind, labels, field] of [['category', categories, 'categories'], ['tag', tags, 'tags']]) {
  for (const label of labels) {
    const title = label.replaceAll('-', ' ');
    await archive(topicPath(kind, label), title, `Articles filed under the ${kind} “${title}”.`,
      posts.filter((post) => post[field].includes(label)), '<p><a href="/blog/">All articles</a></p>');
  }
}

for (const post of posts) {
  await page(post.path, '/blog/', post.title, post.description, `<article>
${spotlight(post.title, post.description)}${metadata(post)}
<div class="prose">${markdown.render(post.body)}</div>
</article><p><a href="/blog/">← All articles</a></p>`, post);
}

await output('search.json', JSON.stringify(posts.map(({ body, ...post }) => ({
  ...post, text: body.replace(/\s+/g, ' ').trim(),
}))));
await output('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${name}</title><link>${origin}/</link><description>${xml(introduction)}</description><language>en</language>
<atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml"/>
${posts.map((post) => `<item><title>${xml(post.title)}</title><link>${origin + post.path}</link><guid>${origin + post.path}</guid><pubDate>${new Date(post.date).toUTCString()}</pubDate><description>${xml(post.description)}</description></item>`).join('\n')}
</channel></rss>
`);
await output('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((url) => `<url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`);
await output('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await output('CNAME', new URL(origin).hostname + '\n');
await output('.nojekyll', '');
console.log(`Built ${sitemap.length} pages and ${posts.length} published articles in dist/.`);
