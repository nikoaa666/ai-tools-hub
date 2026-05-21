'use client';
import { useState } from 'react';

interface Tool {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  image?: string;
  likes: number;
}

interface ToolCardProps {
  tool: Tool;
  isFavorited: boolean;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  isLoggedIn: boolean;
}

const categoryColors: Record<string, string> = {
  '对话': 'bg-purple-50 text-purple-600',
  '写作': 'bg-blue-50 text-blue-600',
  '编程': 'bg-green-50 text-green-600',
  '图像': 'bg-pink-50 text-pink-600',
  '视频': 'bg-red-50 text-red-600',
  '音频': 'bg-orange-50 text-orange-600',
  '效率': 'bg-cyan-50 text-cyan-600',
  '设计': 'bg-violet-50 text-violet-600',
  '营销': 'bg-amber-50 text-amber-600',
  'Agent': 'bg-indigo-50 text-indigo-600',
};

export default function ToolCard({ tool, isFavorited, onLike, onFavorite, isLoggedIn }: ToolCardProps) {
  const [liked, setLiked] = useState(false);

  function handleLike() {
    if (liked) return;
    setLiked(true);
    onLike(tool.id);
  }

  const colorClass = categoryColors[tool.category] || 'bg-gray-50 text-gray-600';

  return (
    <a
      href={`#${tool.id}`}
      className="group block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:border-gray-200 transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-3">
        {tool.image && (
          <img
            src={tool.image}
            alt={tool.name}
            className="w-10 h-10 rounded-xl shrink-0 object-contain bg-gray-50 p-1"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-base">
              {tool.name}
            </h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${colorClass}`}>
              {tool.category}
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{tool.description}</p>
      <div className="flex items-center gap-2.5" onClick={(e) => e.preventDefault()}>
        <button
          onClick={handleLike}
          disabled={liked}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition font-medium ${
            liked
              ? 'bg-red-50 text-red-500'
              : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {tool.likes + (liked ? 1 : 0)}
        </button>
        {isLoggedIn && (
          <button
            onClick={() => onFavorite(tool.id)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition font-medium ${
              isFavorited
                ? 'bg-yellow-50 text-yellow-600'
                : 'bg-gray-50 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600'
            }`}
          >
            <svg className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {isFavorited ? '已收藏' : '收藏'}
          </button>
        )}
      </div>
    </a>
  );
}
