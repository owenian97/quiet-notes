import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('./public/', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/health') {
        res.writeHead(200, {'content-type':'application/json','cache-control':'no-store'});
        return res.end(JSON.stringify({ok:true,version:9}));
      }
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === '/' || !path.extname(pathname)) pathname = '/index.html';
      const target = path.resolve(publicDir, `.${pathname}`);
      if (!target.startsWith(path.resolve(publicDir))) throw new Error('Forbidden');
      const file = await readFile(target);
      res.writeHead(200, {
        'content-type': types[path.extname(target)] || 'application/octet-stream',
        'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
        'x-content-type-options':'nosniff',
        'referrer-policy':'no-referrer'
      });
      res.end(file);
    } catch {
      res.writeHead(404, {'content-type':'text/plain; charset=utf-8'});
      res.end('Not found');
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT) || 3420;
  const host = process.env.HOST || '0.0.0.0';
  createServer().listen(port, host, () => console.log(`Quiet Notes listening on ${host}:${port}`));
}
