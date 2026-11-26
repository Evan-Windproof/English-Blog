import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist');
const types = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};
const port = Number(process.env.PORT ?? 8000);
const host = process.env.HOST ?? '127.0.0.1';

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const path = decodeURIComponent(url.pathname);
    const file = resolve(root, '.' + path + (path.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root + sep)) throw new Error('Invalid path');
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Page not found');
  }
}).listen(port, host, () => console.log(`Serving dist/ at http://${host}:${port}/`));
