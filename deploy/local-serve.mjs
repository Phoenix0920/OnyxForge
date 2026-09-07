#!/usr/bin/env node
// local-serve.mjs —— 无依赖的本地静态服务器,供组装后的单目录做端到端实测与参考。
// 特性:
//   - 纯静态文件服务(壳 + /tools/srk + /tools/it 同源)
//   - SPA fallback:it-tools 用 history 路由(createWebHistory('/tools/it')),
//     因此任何 /tools/it/<tool> 无扩展名路径须回退到 /tools/it/index.html。
//   - 生产建议用 deploy/nginx.conf 的 try_files 达到同样效果。
//
// 用法: node deploy/local-serve.mjs [--root <发布目录>] [--port 8900]

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootOf = dirname(fileURLToPath(import.meta.url));
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const ROOT = resolve(arg('--root') ?? join(rootOf, '../tools/dist/site'));
const PORT = Number(arg('--port') ?? process.env.PORT ?? 8900);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.map': 'application/json',
  '.gz': 'application/gzip',
  '.txt': 'text/plain; charset=utf-8',
};

async function send(file, res) {
  const data = await readFile(file);
  res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' });
  res.end(data);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let p = decodeURIComponent(url.pathname);
    if (p === '/') p = '/index.html';
    let file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    try {
      const st = await stat(file);
      if (st.isDirectory()) file = join(file, 'index.html');
      await send(file, res);
      return;
    } catch {
      /* 落到 fallback */
    }
    // SPA fallback
    let fallback = join(ROOT, 'index.html');
    if (p.startsWith('/tools/it/')) fallback = join(ROOT, 'tools/it/index.html');
    await send(fallback, res);
  } catch (e) {
    res.writeHead(500).end(String(e));
  }
});

server.listen(PORT, () => {
  console.log(`local-serve  ${ROOT}`);
  console.log(`  http://127.0.0.1:${PORT}/        (壳)`);
  console.log(`  http://127.0.0.1:${PORT}/tools/srk/  (CyberChef)`);
  console.log(`  http://127.0.0.1:${PORT}/tools/it/rmb-d  (it-tools 深链示例)`);
});
