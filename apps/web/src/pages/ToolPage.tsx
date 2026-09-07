import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../lib/ctx';
import { useTheme } from '../lib/store';
import { buildToolUrl, toolKey, SHORT_GROUP, NET_TOOLS } from '../lib/data';
import { BackIcon, ExternalIcon, StarIcon } from '../components/Icons';

export function ToolPage() {
  const { plugin = '', tool = '' } = useParams();
  const { meta, find, hasFav, toggleFav, pushRecent } = useData();
  const { effective } = useTheme();
  const [loaded, setLoaded] = useState(false);

  const lookup = plugin && tool ? find(plugin, tool) : null;
  const key = lookup ? toolKey(plugin, tool) : null;

  useEffect(() => {
    setLoaded(false);
    if (key) pushRecent(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!meta) {
    return (
      <div className="main scroll">
        <div className="noresult">加载中…</div>
      </div>
    );
  }

  if (!lookup) {
    return (
      <div className="main scroll">
        <div className="noresult">
          <p>未找到该工具。</p>
          <Link to="/">← 返回首页</Link>
        </div>
      </div>
    );
  }

  const src = buildToolUrl(plugin, lookup.item, effective);
  const on = key ? hasFav(key) : false;
  const short = SHORT_GROUP[plugin] ?? plugin;
  const netNote = key ? NET_TOOLS[key] : undefined;

  return (
    <div className="main main-tool">
      {netNote && (
        <div className="netnote" title="此工具在显式使用时才会发出请求">
          <span>联网工具</span> {netNote} —— 仅在你操作时发出,不会自动外呼。
        </div>
      )}
      <div className="tool-bar">
        <Link to="/" className="link-btn" title="返回">
          <BackIcon />
        </Link>
        <span className="tname">{lookup.item.name}</span>
        <span className="grp">
          {short} · {lookup.categoryName}
        </span>
        <span className="sp" />
        <button className={`icon-btn${on ? ' active' : ''}`} title="收藏" onClick={() => key && toggleFav(key)}>
          <StarIcon width={16} height={16} fill={on ? 'currentColor' : 'none'} />
        </button>
        <a className="link-btn" href={src} target="_blank" rel="noreferrer" title="在新标签打开">
          <ExternalIcon /> 新窗口
        </a>
      </div>
      <div className="tool-frame-wrap">
        {!loaded && <div className="loading">正在载入工具…</div>}
        <iframe title={lookup.item.name} src={src} onLoad={() => setLoaded(true)} />
      </div>
    </div>
  );
}
