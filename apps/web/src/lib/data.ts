import type { ToolsMeta, ToolItem } from './types';

// 部署路径方案(与 PLAN.md §5 一致)
export const DEPLOY_PATHS: Record<string, { dir: string }> = {
  'SRK-Toolbox': { dir: '/tools/srk/' },
  'it-tools': { dir: '/tools/it/' },
};

/** 组唯一 key(用于路由/收藏/最近) */
export const groupKey = (pluginId: string) => pluginId;
/** 工具唯一 key */
export const toolKey = (pluginId: string, toolId: string) => `${pluginId}/${toolId}`;

/** 某个工具在静态托管下的 iframe 深链 URL */
export function buildToolUrl(pluginId: string, tool: ToolItem): string {
  const dir = DEPLOY_PATHS[pluginId]?.dir ?? '';
  if (tool.deep.type === 'route') {
    // it-tools: 路由型深链,路径 = base + /<toolId>
    return `${dir}${tool.toolId}`;
  }
  // SRK / CyberChef: recipe 型深链,取 hash 形式 #recipe=<编码后的操作>()
  const recipe = tool.deep.recipe ?? `${tool.name}()`;
  return `${dir}#recipe=${encodeURIComponent(recipe)}`;
}

export const SHORT_GROUP: Record<string, string> = {
  'SRK-Toolbox': 'CyberChef',
  'it-tools': 'it-tools',
};

/**
 * 「联网工具」清单 —— 默认零外呼之外,仅这四个工具在用户显式使用时才会向第三方发起请求
 * (审计见 PLAN.md §5)。key = `${pluginId}/${toolId}`;值为对用户可见的说明。
 */
export const NET_TOOLS: Record<string, string> = {
  'SRK-Toolbox/httpqingqiu': '把请求发送到你填写的目标 URL',
  'SRK-Toolbox/dns over https': '向公共 DoH 服务(dns.google / cloudflare-dns)查询',
  'SRK-Toolbox/zaidetushangxianshi': '从 CDN 加载 Leaflet 与公开地图瓦片(maps.wikimedia.org)',
  'it-tools/ascii-text-drawer': '从 unpkg CDN 拉取 figlet 字体',
};

/** 扁平化全部工具(便于搜索/收藏),携带所属信息 */
export interface FlatTool {
  pluginId: string;
  categoryName: string;
  item: ToolItem;
  key: string;
}

export function flattenTools(meta: ToolsMeta): FlatTool[] {
  const out: FlatTool[] = [];
  for (const g of meta.groups) {
    for (const c of g.categories) {
      for (const t of c.tools) {
        out.push({
          pluginId: g.pluginId,
          categoryName: c.name,
          item: t,
          key: toolKey(g.pluginId, t.toolId),
        });
      }
    }
  }
  return out;
}

/** 简单中文/英文子串匹配搜索 */
export function matchTool(q: string, t: FlatTool): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = [t.item.name, t.categoryName, ...t.item.keywords, t.item.description]
    .join(' ')
    .toLowerCase();
  return hay.includes(s);
}
