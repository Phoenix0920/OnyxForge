#!/usr/bin/env node
// scan-external.mjs —— 外呼回归扫描:统计发布产物(壳 + /tools/srk + /tools/it)里
// 出现在 JS/HTML/CSS 中的外部域名,供「联网工具说明」与隐私红线回归使用。
//
// 判定口径:
//   - 只扫文本文件(.js/.mjs/.html/.css/.json/.webmanifest),跳过图片/字体/二进制。
//   - 摘取 https?://host 与 //host(协议相对)两种形态。
//   - 排除:data:/blob:/wss: 同站协议、占位文本里不会真的发出的地址很难排除,
//     因此结果按「域名 + 命中文件数」聚合,人工复核是否属功能触发型(见 PLAN §5)。
//
// 用法: node scripts/scan-external.mjs [--dir tools/dist/site]
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const DIR = resolve(arg('--dir') ?? join(root, 'tools/dist/site'));

const TEXT_EXT = new Set(['.js', '.mjs', '.html', '.css', '.json', '.webmanifest', '.txt', '.map']);
const RE = /https?:\/\/([a-z0-9.-]+\.[a-z]{2,}|localhost)(?::\d+)?|(?<![\w."'])\/\/([a-z0-9.-]+\.[a-z]{2,})(?::\d+)?/gi;

const SKIP_HOST = new Set(['example.com', 'localhost', '127.0.0.1']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.LICENSE.txt')) continue; // 纯署名文本
    else if (TEXT_EXT.has(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

if (!existsSync(DIR)) {
  console.error(`✗ 目录不存在: ${DIR}`);
  process.exit(1);
}

const files = walk(DIR);
const hostFiles = new Map(); // host -> Set<file>
const hostAll = new Map(); // host -> 命中总数
for (const f of files) {
  let content;
  try {
    content = readFileSync(f, 'utf-8');
  } catch {
    continue;
  }
  let m;
  while ((m = RE.exec(content))) {
    const host = (m[1] || m[2] || '').toLowerCase();
    if (!host || SKIP_HOST.has(host)) continue;
    hostAll.set(host, (hostAll.get(host) ?? 0) + 1);
    if (!hostFiles.has(host)) hostFiles.set(host, new Set());
    hostFiles.get(host).add(f.replace(DIR, '').replace(/^\//, ''));
  }
}

const rows = [...hostAll.entries()].sort((a, b) => b[1] - a[1]);
console.log(`扫描 ${files.length} 个文本文件 @ ${DIR}`);
if (rows.length === 0) {
  console.log('✓ 未发现任何外部域名(默认零外呼)。');
  process.exit(0);
}
console.log(`发现 ${rows.length} 个外部域名:`);
for (const [host, n] of rows) {
  const ex = [...hostFiles.get(host)].slice(0, 3).join(' , ');
  const extra = [...hostFiles.get(host)].length > 3 ? ` (+${hostFiles.get(host).size - 3})` : '';
  console.log(`  ${n.toString().padStart(4)}×  ${host}\n        ↳ ${ex}${extra}`);
}
console.log('\n说明:域名出现在产物≠运行会发出(可能是工具帮助文本/占位示例)。请按 PLAN §5 的「功能触发型」口径复核。');
