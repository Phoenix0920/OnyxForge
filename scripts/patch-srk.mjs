#!/usr/bin/env node
// patch-srk.mjs —— 把 SRK/CyberChef 中文版已构建产物拷入部署目录,并把硬编码的
// 路径前缀 /ext-view/srk 替换为 /tools/srk(免重编译,见 PLAN.md §5)。
//
// 背景:SRK 静态包资源引用是绝对路径(webpack publicPath 硬编码 /ext-view/srk),
// 但运行期 Worker/OCR 等资源按 location.href 自适应,因此只需修两处文本文件即可
// 整体挂到 /tools/srk/ 下。
//
// 用法:
//   node scripts/patch-srk.mjs [--src <build/prod 绝对或相对路径>] [--out <部署目录>]
// 默认 --src ../MDGJX-extensions/extensions/SRK-Toolbox/build/prod, --out tools/dist
// 运行后产物在 <out>/srk/,可用同源静态服务器 + /tools/srk 前缀访问。

import { readFileSync, writeFileSync, cpSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const SRC = arg('--src') ?? resolve(root, '../MDGJX-extensions/extensions/SRK-Toolbox/build/prod');
const OUT = arg('--out') ?? resolve(root, 'tools/dist');
const FROM = '/ext-view/srk';
const TO = '/tools/srk';

if (!existsSync(SRC)) {
  console.error(`✗ 源目录不存在: ${SRC}`);
  console.error('  请确认 MDGJX-extensions 快照路径,或用 --src 指定 SRK build/prod 的绝对路径。');
  process.exit(1);
}

const dst = resolve(OUT, 'srk');
rmSync(dst, { recursive: true, force: true });
cpSync(SRC, dst, { recursive: true });
console.log(`✓ 已拷贝 ${SRC}\n  → ${dst}`);

const targets = ['index.html', 'assets/main.js'];
for (const rel of targets) {
  const file = resolve(dst, rel);
  if (!existsSync(file)) {
    console.warn(`  (!) 缺文件 ${rel},跳过`);
    continue;
  }
  const before = readFileSync(file, 'utf-8');
  const after = before.split(FROM).join(TO);
  if (after === before) {
    console.warn(`  (!) ${rel} 未发现 ${FROM}(${after === before ? '无变更' : ''})`);
  } else {
    writeFileSync(file, after, 'utf-8');
    const n = before.split(FROM).length - 1;
    console.log(`  ✓ ${rel}:替换 ${n} 处 ${FROM} → ${TO}`);
  }
}

// 兜底扫描:其余文本文件里是否还有残留 /ext-view/srk(除图片/字体等二进制外)
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === 'assets' || name === 'modules' || name === 'images') continue; // 已在主包与模块中兜底
      walk(p, out);
    } else if (/\.(html?|js|css|json|mjs)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}
const leftovers = walk(dst).filter((p) => readFileSync(p, 'utf-8').includes(FROM));
if (leftovers.length) {
  console.warn(`  ⚠ 仍有 ${leftovers.length} 个文件含 ${FROM}(可按需一并替换):`);
  leftovers.slice(0, 10).forEach((p) => console.warn(`    - ${p.replace(dst, 'srk')}`));
} else {
  console.log('  ✓ 全目录扫描无残留 /ext-view/srk');
}

console.log(`\n完成。发布时把 ${dst} 放到站点 /tools/srk/ 下。`);
console.log('验证:访问 /tools/srk/#recipe=转换到Hexdump() 应直达该操作。');
