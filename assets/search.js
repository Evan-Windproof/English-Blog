const form = document.querySelector('#search');
const input = document.querySelector('#query');
const archive = document.querySelector('#archive');
const results = document.querySelector('#search-results');
const status = document.querySelector('#search-status');
const matches = document.querySelector('#matches');
let indexRequest;
let searchVersion = 0;

function loadIndex() {
  indexRequest ??= fetch('/search.json').then((response) => {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.json();
  }).catch((error) => {
    indexRequest = undefined;
    throw error;
  });
  return indexRequest;
}

function renderMatch(post) {
  const item = document.createElement('li');
  const heading = document.createElement('h2');
  const link = document.createElement('a');
  const description = document.createElement('p');
  const date = document.createElement('time');
  link.href = post.path;
  link.textContent = post.title;
  description.textContent = post.description;
  date.dateTime = post.date;
  date.textContent = post.date;
  heading.append(link);
  item.append(heading, description, date);
  return item;
}

async function search(query) {
  const version = ++searchVersion;
  matches.replaceChildren();
  archive.hidden = Boolean(query);
  results.hidden = !query;
  if (!query) return;

  status.textContent = 'Searching…';
  try {
    const posts = await loadIndex();
    if (version !== searchVersion) return;
    const terms = query.toLowerCase().replaceAll('-', ' ').trim().split(/\s+/);
    const found = posts.filter((post) => {
      const text = [post.title, post.description, post.text, ...post.categories, ...post.tags]
        .join(' ').replaceAll('-', ' ').toLowerCase();
      return terms.every((term) => text.includes(term));
    });
    status.textContent = found.length ? `${found.length} ${found.length === 1 ? 'result' : 'results'}` : 'No matching articles.';
    matches.replaceChildren(...found.map(renderMatch));
  } catch {
    if (version !== searchVersion) return;
    archive.hidden = false;
    status.textContent = 'Search is temporarily unavailable. You can still browse the archive.';
  }
}

function restoreQuery() {
  input.value = new URL(location.href).searchParams.get('q') ?? '';
  search(input.value.trim());
}

form.hidden = false;
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const url = new URL(location.href);
  const query = input.value.trim();
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  if (url.href !== location.href) history.pushState(null, '', url);
  search(query);
});
window.addEventListener('popstate', restoreQuery);
restoreQuery();
