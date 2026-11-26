const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

(async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'evavind-blog-'));
  let browser;
  try {
    const source = path.join(temp, 'content/blog');
    fs.mkdirSync(source, { recursive: true });
    fs.writeFileSync(path.join(temp, 'index.html'), '<!-- latest:start --><!-- latest:end -->');
    fs.writeFileSync(path.join(source, 'systems-note.md'), [
      '---', 'title: Example systems note', 'description: Rust browser test article', 'date: 2026-11-21',
      'updated: 2026-11-21', 'tags: [Rust]', 'category: Testing', 'slug: example-systems-note',
      'draft: false', 'language: en', '---', '## Notes', '', 'Fixture content for the article reader.',
      '', '```rust', 'fn main() { println!("Hello"); }', '```', '',
      '| A | B |', '|---|---|', '| 1 | 2 |', '', '![Evavind](/assets/favicon.svg)', '',
    ].join('\n'));
    execFileSync('python3', ['-c', 'import sys; from pathlib import Path; from scripts import build_blog; build_blog.ROOT = Path(sys.argv[1]); build_blog.build()', temp]);

    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
    const base = 'http://localhost:8000';
    const canonical = 'https://en.evanwindproof.top';
    const context = await browser.newContext({ locale: 'zh-TW' });
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto(base);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.ok(await page.locator('.blog-primary').isVisible());
    await page.locator('.dock [data-app="apps"]').click();
    for (const url of ['https://c-skeleton.evanwindproof.top/', 'https://orfreon.evanwindproof.top/']) {
      assert.equal(await page.locator(`a[href="${url}"]`).count(), 1);
    }
    const published = await page.request.get(base + '/blog/articles.json');
    assert.ok(published.ok());
    assert.ok((await published.json()).every(post => post.language.toLowerCase().split('-')[0] === 'en'));

    async function useFixture(context) {
      await context.route('**/blog/**', async route => {
        const { pathname } = new URL(route.request().url());
        const file = path.join(temp, pathname, pathname.endsWith('/') ? 'index.html' : '');
        if (fs.existsSync(file)) await route.fulfill({ path: file });
        else await route.continue();
      });
    }
    await useFixture(context);
    await page.goto(base + '/blog/');
    assert.equal(await page.locator('#blog-language').count(), 0);
    await page.locator('#blog-search').fill('no-such-article');
    await page.locator('#search-empty').waitFor({ state: 'visible' });
    await page.locator('#blog-search').fill('Rust');
    await page.locator('.post-card:visible h2 a').click();
    assert.equal((await page.reload()).status(), 200);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('article').getAttribute('lang'), 'en');
    assert.equal(await page.locator('.codehilite').count(), 1);
    assert.equal(await page.locator('.prose table').count(), 1);
    await page.waitForFunction(() => document.querySelector('.prose img').naturalWidth > 0);
    assert.equal(await page.locator('.toc a[href="#notes"]').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), canonical + '/blog/example-systems-note/');
    await page.locator('#blog-theme').click();
    assert.match(await page.locator('body').getAttribute('class'), /light/);
    await page.getByRole('link', { name: 'Rust', exact: true }).click();
    assert.equal(await page.locator('.post-card').count(), 1);
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }

    const nojs = await browser.newContext({ javaScriptEnabled: false });
    await useFixture(nojs);
    const article = await nojs.newPage();
    assert.equal((await article.goto(base + '/blog/example-systems-note/')).status(), 200);
    assert.match(await article.locator('.prose').textContent(), /Fixture content/);
    assert.equal((await article.reload()).status(), 200);
    for (const file of ['rss.xml', 'sitemap.xml']) {
      assert.ok(fs.readFileSync(path.join(temp, file), 'utf8').includes(canonical + '/blog/example-systems-note/'));
    }
    assert.deepEqual(errors, []);
    console.log('PASS blog: static and no-JS reading, search, tags, Markdown, SEO, RSS/sitemap, English UI, and mobile');
  } finally {
    await browser?.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
