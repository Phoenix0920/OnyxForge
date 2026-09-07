#!/usr/bin/env node
// gen-nav.mjs —— 从 MDGJX-extensions 的插件注册表(或等价 JSON)抽取工具导航元数据,
// 生成 OnyxForge 自己的 meta/tools.json。与旧仓库彻底脱钩:只需运行一次,产物入库固化。
//
// 用法:
//   node scripts/gen-nav.mjs [path/to/miaoda-dist-all.json] [-o meta/tools.json]
// 默认输入为相邻目录 MDGJX-extensions/meta/miaoda-dist-all.json

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const args = process.argv.slice(2);
const plainArgs = args.filter((a) => !a.startsWith('-'));
const src = plainArgs[0] ?? resolve(__dirname, '../../MDGJX-extensions/meta/miaoda-dist-all.json');
const idxO = args.indexOf('-o');
const outPath = idxO !== -1 ? args[idxO + 1] : 'meta/tools.json';

const registry = JSON.parse(readFileSync(src, 'utf-8'));

/** 规范化一个插件(含所有分类+工具)为新结构 */
function normalizePlugin(p) {
  if (p.disabled) return null;
  const id = p.id || p.name;
  const categories = (p.menus || []).map((cat) => {
    const kids = cat.children || cat.subItems || [];
    return {
      categoryId: cat.id ?? null,
      name: cat.name,
      icon: cat.iconInStr ?? null,
      belongTo: cat.belongTo ?? null,
      tools: kids.map((t) => ({
        toolId: t.id,
        name: t.name,
        icon: t.iconInStr ?? null,
        keywords: Array.isArray(t.keywords) ? t.keywords : [],
        description: t.description ?? '',
        // 深链原始信息:it-tools 走独立路由路径;CyberChef/SRK 走 recipe 参数
        deep:
          t.moduleItemtURL && t.moduleItemtURL !== (p.runtime?.embedded?.baseUrl ?? '') && !t.moduleItemQuery
            ? { type: 'route', rawUrl: t.moduleItemtURL }
            : { type: 'recipe', rawUrl: t.moduleItemtURL ?? '', recipe: t.moduleItemQuery?.recipe ?? null },
      })),
    };
  });
  return {
    pluginId: id,
    pluginName: p.name ?? id,
    runtimeType: p.runtime?.type ?? null,
    originalBaseUrl: p.runtime?.embedded?.baseUrl ?? null,
    categories,
  };
}

const plugins = registry.map(normalizePlugin).filter(Boolean);
const categoryCount = plugins.reduce((n, p) => n + p.categories.length, 0);
const toolCount = plugins.reduce((n, p) => n + p.categories.reduce((m, c) => m + c.tools.length, 0), 0);

const out = {
  $meta: {
    description: 'OnyxForge 工具导航元数据(本地固化,离线可用)。由 scripts/gen-nav.mjs 生成。',
    generatedBy: 'gen-nav.mjs',
    source: src,
    toolCount,
    categoryCount,
    pluginCount: plugins.length,
  },
  groups: plugins,
};

mkdirSync(dirname(resolve(repoRoot, outPath)), { recursive: true });
writeFileSync(resolve(repoRoot, outPath), JSON.stringify(out, null, 2), 'utf-8');

// 同步一份到 web 运行期数据目录(壳在运行时 fetch /tools.json)
const webPublic = resolve(repoRoot, 'apps/web/public');
if (process.env.NODE_ENV !== 'test') {
  try {
    mkdirSync(webPublic, { recursive: true });
    writeFileSync(resolve(webPublic, 'tools.json'), JSON.stringify(out), 'utf-8');
    console.log(`✓ 已同步 ${resolve(webPublic, 'tools.json')}`);
  } catch (e) {
    console.warn('(!) 未同步到 apps/web/public(目录不存在可忽略):', e.message);
  }
}

console.log(`✓ 已生成 ${outPath}`);
console.log(`  插件组:${plugins.map((p) => `${p.pluginName}(${p.pluginId})`).join(' / ')}`);
console.log(`  分类:${categoryCount}   工具:${toolCount}`);
