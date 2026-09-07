import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ToolsMeta, ToolItem } from './types';
import { flattenTools, type FlatTool } from './data';
import { useFavorites, useRecents } from './store';

export interface Lookup {
  item: ToolItem;
  pluginId: string;
  categoryName: string;
  groupName: string;
}

interface DataCtxType {
  meta: ToolsMeta | null;
  error: string | null;
  flat: FlatTool[];
  find: (pluginId: string, toolId: string) => Lookup | null;
  // 收藏 / 最近
  favs: string[];
  hasFav: (k: string) => boolean;
  toggleFav: (k: string) => void;
  recents: string[];
  pushRecent: (k: string) => void;
  removeRecent: (k: string) => void;
  clearRecents: () => void;
  // UI
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  favOnly: boolean;
  setFavOnly: (v: boolean) => void;
}

const DataCtx = createContext<DataCtxType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<ToolsMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const flat = meta ? flattenTools(meta) : [];
  const { favs, has, toggle } = useFavorites();
  const { recents, push, remove, clear } = useRecents();
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [favOnly, setFavOnly] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/tools.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ToolsMeta>;
      })
      .then((d) => alive && setMeta(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, []);

  const find = (pluginId: string, toolId: string): Lookup | null => {
    for (const g of meta?.groups ?? []) {
      if (g.pluginId !== pluginId) continue;
      for (const c of g.categories) {
        const t = c.tools.find((x) => x.toolId === toolId);
        if (t) return { item: t, pluginId: g.pluginId, categoryName: c.name, groupName: g.pluginName };
      }
    }
    return null;
  };

  const value: DataCtxType = {
    meta, error, flat, find,
    favs, hasFav: has, toggleFav: toggle,
    recents, pushRecent: push, removeRecent: remove, clearRecents: clear,
    navOpen, setNavOpen, search, setSearch, favOnly, setFavOnly,
  };
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData(): DataCtxType {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error('useData 必须在 <DataProvider> 内使用');
  return ctx;
}
