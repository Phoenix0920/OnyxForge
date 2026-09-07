// 与 meta/tools.json 结构一致
export interface ToolsMeta {
  $meta: {
    toolCount: number;
    categoryCount: number;
    pluginCount: number;
    description?: string;
  };
  groups: ToolGroup[];
}

export interface ToolGroup {
  pluginId: string; // 'SRK-Toolbox' | 'it-tools'
  pluginName: string;
  runtimeType: string | null;
  originalBaseUrl: string | null;
  categories: ToolCategory[];
}

export interface ToolCategory {
  categoryId: string | null;
  name: string;
  icon: string | null;
  belongTo: string | null;
  tools: ToolItem[];
}

export interface ToolDeep {
  type: 'recipe' | 'route';
  rawUrl?: string | null;
  recipe?: string | null;
}

export interface ToolItem {
  toolId: string;
  name: string;
  icon: string | null;
  keywords: string[];
  description: string;
  deep: ToolDeep;
}
