# Evan Windproof’s English Blog

An independent English-language site for Evan Windproof, Independent Developer & Technical Researcher. The site covers software engineering, operating system development, technical research and experiments, and open-source projects. Its canonical address is [en.evanwindproof.top](https://en.evanwindproof.top/).

## Features

- Home, Blog, Projects, Research, and About pages
- Markdown articles with publication dates, category and tag archives, and syntax-highlighted code blocks
- Static archives paginated at ten articles per page and browser-based search across published articles
- Responsive layouts with light and dark themes based on system preferences
- RSS at `/rss.xml`, a sitemap at `/sitemap.xml`, canonical URLs, and social metadata
- Static output for GitHub Pages. Browsing and reading work with JavaScript off.

## Repository structure

| Path | Purpose |
| --- | --- |
| `articles/` | Markdown source files for drafts and published articles |
| `assets/` | Site styles and browser search |
| `scripts/build.mjs` | Page templates, article processing, and static output |
| `scripts/serve.mjs` | Local static preview server |
| `.github/workflows/pages.yml` | Build checks and GitHub Pages deployment |
| `dist/` | Generated site, excluded from version control |

## Local development

Use Node.js 24, as specified in `.nvmrc`. From the repository root, run:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:8000/`. The server reads files from `dist/`. After editing the source, run `npm run build` in another terminal and refresh. Use `PORT=8080 npm run dev` if port 8000 is busy.

## Production build

```sh
npm ci
npm run build
```

The build validates article metadata, recreates `dist/`, and generates the HTML, search index, syndication files, and GitHub Pages files. The output expects to be served at the root of the configured custom domain.

## Article publishing

1. Add an `articles/<slug>.md` file, or open one of the three existing drafts. Use lowercase letters, digits, and single hyphens in the filename. The filename determines the URL, so keep it stable after publication. The slugs `page`, `category`, and `tag` are reserved.
2. Begin the file with JSON front matter delimited by lines containing `---`. Use the following fields:

   | Field | Value |
   | --- | --- |
   | `title` | Article title. The site renders this as the page heading. |
   | `description` | Short summary for the listing, feed, and metadata. |
   | `date` | Publication date as a `YYYY-MM-DD` string, or `null` while drafting. |
   | `draft` | `true` to exclude the article from the generated site. |
   | `categories` | Array of lowercase, hyphen-separated labels. An empty array is allowed. |
   | `tags` | Array of labels using the same format as categories. |

3. Write the article below the closing delimiter. Start body headings at level two. Use fenced code blocks with a language identifier for highlighting. Put local images in `assets/` and link to them using site-root paths such as `/assets/example.png`.
4. Set the date and change `draft` to `false` when the article is ready. Preview the post, verify its links, then merge to `main`. The build adds it to the archives, search, RSS, and sitemap.

Drafts are omitted from generated output. Source drafts are still visible to anyone with read access to the repository.

## GitHub Pages deployment

1. In `Evan-Windproof/English-Blog`, open **Settings → Pages**, then choose **GitHub Actions** as the source under **Build and deployment**.
2. Push or merge to `main`, or run **Build and deploy GitHub Pages** from the **Actions** tab on `main`. Pull requests to `main` run the build without deployment.
3. Confirm that the `github-pages` environment reports a successful deployment.

## Custom domain

The build emits a `CNAME` file for `en.evanwindproof.top`. With a custom GitHub Actions workflow, set the custom domain in **Settings → Pages** as well. The generated `CNAME` alone does not configure Pages.

When authorized to connect the domain, configure only the `en` subdomain. A GitHub Pages CNAME record for `en.evanwindproof.top` should point to `evan-windproof.github.io`, without a repository suffix. Wait for the Pages DNS check and certificate provisioning, then enable **Enforce HTTPS**. Verify the deployed home page, article URLs, and RSS feed at the custom domain.
