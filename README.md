# Evan Windproof’s English Blog

This is the independent English edition of Evan Windproof’s personal website, prepared for [en.evanwindproof.top](https://en.evanwindproof.top/). It localizes the existing [Evavind website](https://github.com/Evan-Windproof/Evan-Windproof.github.io) at source commit `9193ac5a4af3f431744a9c79bb4bb09003533b92`. The Evavind desktop, window manager, Dock, simulated terminal, Aelthoren browser concept, project pages, themes, animations, and blog layout use the original implementation. The Chinese edition maintains its own repository and release process.

## Local development

Use Python 3.12 and, for the browser tests, Node.js 24 and Chromium.

```sh
python3 -m venv work/venv
. work/venv/bin/activate
python -m pip install -r requirements-blog.txt
python scripts/build_blog.py
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000/`. Run the build again after editing blog posts. No framework or bundler is required for the desktop.

| Location | Purpose |
| --- | --- |
| `index.html`, `app.js`, `styles.css`, `js/`, `locales/en.js` | Evavind desktop and English interface |
| `content/blog/` | Markdown source for the public blog |
| `blog/`, `rss.xml`, `sitemap.xml`, `robots.txt` | Static blog, index, feed, and crawler output |
| `articles/` | Markdown and registry for the separate Aelthoren reader |
| `projects/`, `assets/` | Project pages and shared assets |
| `scripts/`, `tests/` | Build, packaging, and regression tools |

## Publishing articles

Add a Markdown file under `content/blog/<year>/`. Include YAML front matter with `title`, `description`, `date`, `updated`, `tags` (a list), `category`, `slug`, `draft`, and `language: en`. Use ISO dates and choose a unique lowercase slug with hyphens. Set `draft: false` when the article is ready, then rebuild and review the generated pages. The generator excludes drafts and non-English entries from the published blog, search index, RSS, and sitemap.

The Aelthoren reader uses its own registry in `articles/index.js`. To add a reader entry, keep the existing registry shape and supply the English text as `articles/<id>/en.md`.

### Imported article inventory

The upstream snapshot contained nine Chinese-only public-blog sources. Their corresponding generated posts, search records, tags, and syndication entries were removed during the rebuild.

| Removed Markdown file | Former URL under `/blog/` |
| --- | --- |
| `C.md` | `c-skeleton/` |
| `aelthoren.md` | `blog-opening-aelthoren/` |
| `blog-opening-announcement.md` | `blog-opening-announcement/` |
| `google.md` | `google-search-milestone/` |
| `hooftty.md` | `hooftty/` |
| `introducing-aelthoren.md` | `introducing-aelthoren/` |
| `kernseed.md` | `kernseed/` |
| `mlp-os-archive.md` | `mlp-os-archive/` |
| `xok-exos-revival.md` | `xok-exos/` |

The English half of the upstream bilingual example remains at `articles/example/en.md` and opens at `aelthoren://articles/example`. Its Chinese counterpart was removed. The English HoofTTY project page and its Silkscreen font are retained. The public blog starts empty because the source snapshot contained no English public-blog articles.

## Tests and Pages packaging

With the Python environment activated:

```sh
python scripts/build_blog.py
python -m unittest discover -s tests
npm install --prefix work/browser --no-save --package-lock=false playwright@1.58.2
mkdir -p work
export NODE_PATH="$PWD/work/browser/node_modules"
node "$NODE_PATH/playwright/cli.js" install chromium
export CHROMIUM_PATH="$(node -p "require('playwright').chromium.executablePath()")"
```

Keep the local server running in a separate terminal, then run:

```sh
for test in tests/*.cjs; do node "$test" || exit 1; done
bash scripts/stage_pages.sh "$(mktemp -d)"
```

The packaging command copies the static site, including `CNAME` and `.nojekyll`, to an empty directory. The browser tests build their sample posts in temporary directories.

## GitHub Pages and DNS

The repository workflow builds and tests changes to `main`. Deployment is manual. After authorization, choose **GitHub Actions** under **Settings → Pages → Build and deployment**, configure `en.evanwindproof.top` in **Custom domain**, then run **Build and test English blog** on `main` with the **Publish this main build to GitHub Pages** option enabled.

Check the existing `en` DNS record before changing it. When DNS changes are authorized, a GitHub Pages CNAME for `en.evanwindproof.top` should point to `evan-windproof.github.io`, without a repository path. Verify the domain in GitHub Pages and enable **Enforce HTTPS** once the certificate is available.

Cloudflare Web Analytics, IndexNow submission automation, and outbound HoofTTY mirroring are disabled for this edition. The source site's IndexNow and mirroring utilities are retained for maintenance reference. The English site does not use the Chinese site's analytics token or IndexNow key.
