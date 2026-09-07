#!/usr/bin/env node
// assemble-site.mjs —— 把「壳 + SRK + it-tools」三份静态产物合成一个同源可发布目录。
// 产物布局(与 nginx/deploy 一致,纯静态,运行期零后端):
//   <out>/                 ← apps/web 壳(仅 SPA,HashRouter)
//   <out>/tools/srk/       ← SRK / CyberChef 系(路径已由 patch-srk.mjs 换成 /tools/srk)
//   <out>/tools/it/        ← it-tools(已在 vendor 内以 base=/tools/it 重新 build)
//
// 用法: node scripts/assemble-site.mjs [--out tools/dist/site]
import { cpSync, existsSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const OUT = resolve(arg('--out') ?? join(root, 'tools/dist/site'));

const parts = [
  ['壳(web)', join(root, 'apps/web/dist')],
  ['SRK/CyberChef', join(root, 'tools/dist/srk')],
  ['it-tools', join(root, 'tools/vendor/it-tools/dist')],
];
for (const [name, p] of parts) {
  if (!existsSync(p)) {
    console.error(`✗ 缺少 ${name} 产物: ${p}`);
    console.error('  请先构建: apps/web 运行 npm run build;SRK 运行 scripts/patch-srk.mjs;it-tools 运行 npm run build(vendor 内)。');
    process.exit(1);
  }
}

rmSync(OUT, { recursive: true, force: true });
cpSync(join(root, 'apps/web/dist'), OUT, { recursive: true });
cpSync(join(root, 'tools/dist/srk'), join(OUT, 'tools/srk'), { recursive: true });
cpSync(join(root, 'tools/vendor/it-tools/dist'), join(OUT, 'tools/it'), { recursive: true });

const size = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);
console.log(`✓ 已合成发布目录 ${OUT}`);
console.log(`  壳 index.html ${size(join(OUT, 'index.html'))}KB`);
console.log(`  /tools/srk  已就位(应含 assets/main.js,publicPath=/tools/srk)`);
console.log(`  /tools/it   已就位(应含 assets/index-*.js)`);
console.log(`\n本地实测: node deploy/local-serve.mjs --root ${OUT}`);
