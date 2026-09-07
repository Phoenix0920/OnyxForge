import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../lib/ctx';

export function Nav() {
  const { meta, navOpen, setNavOpen, setFavOnly } = useData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const active = params.get('cat') ?? '';

  const go = (cat: string) => {
    navigate(cat ? `/?cat=${cat}` : '/');
    setFavOnly(false);
    setNavOpen(false);
  };

  return (
    <>
      <div
        className={`nav-backdrop${navOpen ? ' show' : ''}`}
        onClick={() => setNavOpen(false)}
        aria-hidden
      />
      <aside className={`nav scroll${navOpen ? ' open' : ''}`}>
        <button className={`nav-cat${active === '' ? ' active' : ''}`} onClick={() => go('')}>
          <span className="dot" /> 浏览全部
          <span className="cnt">{meta?.$meta.toolCount}</span>
        </button>
        {meta?.groups.map((g, gi) => (
          <div key={g.pluginId}>
            <div className="nav-group-label">
              {g.pluginName}
              <span className="cnt">{g.categories.length}</span>
            </div>
            {g.categories.map((c, ci) => {
              const key = `${gi}:${ci}`;
              return (
                <button
                  key={key}
                  className={`nav-cat${active === key ? ' active' : ''}`}
                  onClick={() => go(key)}
                >
                  {c.name}
                  <span className="cnt">{c.tools.length}</span>
                </button>
              );
            })}
          </div>
        ))}
      </aside>
    </>
  );
}
