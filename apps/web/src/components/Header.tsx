import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../lib/ctx';
import { useTheme } from '../lib/store';
import { MenuIcon, SearchIcon, StarIcon, SunIcon, MoonIcon } from './Icons';

export function Header() {
  const { meta, error, search, setSearch, favs, favOnly, setFavOnly, navOpen, setNavOpen } = useData();
  const { effective, cycle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="header">
      <button className="icon-btn burger" aria-label="菜单" onClick={() => setNavOpen(!navOpen)}>
        <MenuIcon />
      </button>
      <Link to="/" className="brand" onClick={() => setNavOpen(false)}>
        <span className="brand-name">
          Onyx<b>Forge</b>
        </span>
        <span className="brand-sub">玄铁炉 · 自托管工具集</span>
      </Link>
      <label className="search">
        <SearchIcon />
        <input
          value={search}
          placeholder="搜索 462 个工具 · 中/英/关键词"
          onChange={(e) => {
            setSearch(e.target.value);
            if (location.pathname !== '/') navigate('/');
          }}
        />
      </label>
      {error && <span className="hcount" title={error}>数据加载失败</span>}
      {!error && meta && <span className="hcount">{meta.$meta.toolCount} 个工具 · 全部本地计算</span>}
      <div className="hright">
        <button
          className={`icon-btn${favOnly ? ' active' : ''}`}
          title={`收藏(${favs.length})`}
          aria-label="只看收藏"
          onClick={() => {
            setFavOnly(!favOnly);
            if (location.pathname !== '/') navigate('/');
          }}
        >
          <StarIcon width={16} height={16} fill={favOnly ? 'currentColor' : 'none'} />
        </button>
        <button className="icon-btn" title={`主题:${effective}(切换)`} aria-label="切换主题" onClick={cycle}>
          {effective === 'dark' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
}
