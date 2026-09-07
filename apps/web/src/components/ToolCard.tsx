import { Link } from 'react-router-dom';
import type { FlatTool } from '../lib/data';
import { SHORT_GROUP } from '../lib/data';
import { useData } from '../lib/ctx';
import { StarIcon } from './Icons';

export function ToolCard({ tool }: { tool: FlatTool }) {
  const { hasFav, toggleFav } = useData();
  const on = hasFav(tool.key);
  const short = SHORT_GROUP[tool.pluginId] ?? tool.pluginId;
  const url = `/t/${encodeURIComponent(tool.pluginId)}/${encodeURIComponent(tool.item.toolId)}`;
  return (
    <Link to={url} className="tool-card" title={tool.item.description || tool.item.name}>
      <span className="name">{tool.item.name}</span>
      <button
        type="button"
        className={`star${on ? ' on' : ''}`}
        aria-label={on ? '取消收藏' : '收藏'}
        onClick={(e) => {
          e.preventDefault();
          toggleFav(tool.key);
        }}
      >
        <StarIcon width={15} height={15} fill={on ? 'currentColor' : 'none'} />
      </button>
      <span className="desc">{tool.item.description || tool.item.keywords.join(' · ')}</span>
      <span className="tool-tag">{short}</span>
    </Link>
  );
}
