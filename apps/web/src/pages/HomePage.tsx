import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../lib/ctx';
import { matchTool, toolKey, SHORT_GROUP, type FlatTool } from '../lib/data';
import { ToolCard } from '../components/ToolCard';
import { XIcon } from '../components/Icons';

export function HomePage() {
  const { meta, flat, search, favs, favOnly, recents, removeRecent } = useData();
  const [params] = useSearchParams();
  const cat = params.get('cat') ?? '';
  const q = search.trim();
  const byKey = useMemo(() => new Map(flat.map((f) => [f.key, f])), [flat]);

  // 解析 cat=gi:ci
  const catSel = useMemo(() => {
    if (!meta) return null;
    const [a, b] = cat.split(':');
    const gi = a === undefined ? -1 : Number(a);
    const ci = b === undefined ? -1 : Number(b);
    const g = meta.groups[gi];
    const c = g?.categories[ci];
    if (!g || !c) return null;
    return { gi, ci, group: g, category: c };
  }, [meta, cat]);

  // 收藏模式下的分组 sections(可叠加搜索过滤)
  const favSections = useMemo(() => {
    if (!meta) return [];
    const out: { key: string; heading: string; sub: string; tools: FlatTool[] }[] = [];
    meta.groups.forEach((g, gi) => {
      g.categories.forEach((c, ci) => {
        const tools: FlatTool[] = [];
        c.tools.forEach((t) => {
          const ft = byKey.get(toolKey(g.pluginId, t.toolId));
          if (ft && favs.includes(ft.key) && matchTool(q, ft)) tools.push(ft);
        });
        if (tools.length)
          out.push({
            key: `${gi}:${ci}`,
            heading: c.name,
            sub: `${tools.length} 已收藏`,
            tools,
          });
      });
    });
    return out;
  }, [meta, byKey, favs, q]);

  // 搜索命中(全库)
  const searchHits = useMemo(() => (q ? flat.filter((f) => matchTool(q, f)) : []), [flat, q]);

  if (!meta) {
    return (
      <div className="main scroll">
        <div className="noresult">正在加载工具清单…</div>
      </div>
    );
  }

  const short = (pid: string) => SHORT_GROUP[pid] ?? pid;
  const linkToCat = (gi: number, ci: number) => `/?cat=${gi}:${ci}`;
  const renderGrid = (tools: FlatTool[]) =>
    tools.length ? (
      <div className="tool-grid">
        {tools.map((t) => (
          <ToolCard key={t.key} tool={t} />
        ))}
      </div>
    ) : null;

  return (
    <div className="main scroll">
      {/* 最近使用(仅默认浏览态) */}
      {!catSel && !favOnly && !q && recents.length > 0 && (
        <>
          <div className="section-head">
            <h2>最近使用</h2>
          </div>
          <div className="chips">
            {recents.slice(0, 10).map((k) => {
              const f = byKey.get(k);
              if (!f) return null;
              const url = `/t/${encodeURIComponent(f.pluginId)}/${encodeURIComponent(f.item.toolId)}`;
              return (
                <span key={k} className="chip">
                  <Link to={url}>{f.item.name}</Link>
                  <span
                    className="x"
                    role="button"
                    aria-label="移除"
                    onClick={(e) => {
                      e.preventDefault();
                      removeRecent(k);
                    }}
                  >
                    <XIcon width={11} height={11} />
                  </span>
                </span>
              );
            })}
          </div>
        </>
      )}

      {/* 收藏模式 */}
      {favOnly && (
        <>
          <div className="section-head">
            <h2>我的收藏</h2>
            <span>{favs.length} 个工具</span>
          </div>
          {favSections.length === 0 && (
            <div className="noresult">还没有收藏。点工具卡片右上角星标即可收藏。</div>
          )}
          {favSections.map((s) => (
            <section key={s.key} className="section">
              <div className="section-head">
                <h2>{s.heading}</h2>
                <span>{s.sub}</span>
              </div>
              {renderGrid(s.tools)}
            </section>
          ))}
        </>
      )}

      {/* 搜索模式 */}
      {!favOnly && q && (
        <>
          <div className="section-head">
            <h2>搜索结果</h2>
            <span>{searchHits.length} 个匹配</span>
          </div>
          {searchHits.length === 0 && <div className="noresult">没有匹配「{q}」的工具</div>}
          {renderGrid(searchHits)}
        </>
      )}

      {/* 指定分类浏览 */}
      {!favOnly && !q && catSel && (
        <section className="section">
          <div className="section-head">
            <Link className="link-btn" to="/" title="浏览全部">
              ← 浏览全部
            </Link>
            <h2>{catSel.category.name}</h2>
            <span>
              {short(catSel.group.pluginId)} · {catSel.category.tools.length} 个工具
            </span>
          </div>
          {renderGrid(
            catSel.category.tools.flatMap((t) => {
              const ft = byKey.get(toolKey(catSel.group.pluginId, t.toolId));
              return ft ? [ft] : [];
            }),
          )}
        </section>
      )}

      {/* 默认:分类磁贴总览 */}
      {!favOnly && !q && !catSel && (
        <>
          <div className="section-head">
            <h2>工具分类</h2>
            <span>
              {meta.groups.length} 大来源 · {meta.$meta.categoryCount} 类 · {meta.$meta.toolCount} 个工具
            </span>
          </div>
          <div className="cat-grid">
            {meta.groups.map((g, gi) =>
              g.categories.map((c, ci) => (
                <Link key={`${gi}:${ci}`} to={linkToCat(gi, ci)} className="cat-tile">
                  <div className="tt-top">
                    <span className="tt-name">{c.name}</span>
                    <span className="tt-cnt">{c.tools.length}</span>
                  </div>
                  <div className="tt-group">{short(g.pluginId)}</div>
                  {c.tools[0] && <div className="tt-desc">例:{c.tools[0].name}</div>}
                </Link>
              )),
            )}
          </div>
        </>
      )}
    </div>
  );
}
