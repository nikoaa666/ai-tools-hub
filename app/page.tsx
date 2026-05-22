'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import SearchBar from '@/components/SearchBar';
import CategoryBar from '@/components/CategoryBar';
import ToolCard from '@/components/ToolCard';

interface Tool {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  usage: string;
  image?: string;
  likes: number;
}

type SortBy = 'likes' | 'name' | 'newest';

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [sortBy, setSortBy] = useState<SortBy>('likes');
  const [user, setUser] = useState<any>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTools();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchFavorites(data.user.id);
    });
  }, []);

  async function fetchTools() {
    try {
      const { data, error } = await supabase.from('tools').select('*');
      if (error) { console.error('fetchTools error:', error); return; }
      setTools((data as Tool[]) || []);
    } catch (e) { console.error('fetchTools exception:', e); }
  }

  async function fetchFavorites(userId: string) {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('tool_id')
        .eq('user_id', userId);
      setFavoriteIds(new Set((data || []).map((f: any) => f.tool_id)));
    } catch (e) { console.error('fetchFavorites exception:', e); }
  }

  async function handleLike(id: string) {
    const tool = tools.find((t) => t.id === id);
    if (!tool) return;
    await supabase.from('tools').update({ likes: tool.likes + 1 }).eq('id', id);
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, likes: t.likes + 1 } : t)));
  }

  async function handleFavorite(toolId: string) {
    if (!user) return;
    if (favoriteIds.has(toolId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('tool_id', toolId);
      setFavoriteIds((prev) => { const next = new Set(prev); next.delete(toolId); return next; });
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, tool_id: toolId }]);
      setFavoriteIds((prev) => new Set(prev).add(toolId));
    }
  }

  const hasFilter = search || category !== '全部';

  const filtered = useMemo(() => {
    let result = tools.filter((t) => {
      const q = search.toLowerCase();
      const matchCategory = category === '全部' || t.category === category;
      const matchSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });

    if (search) {
      const q = search.toLowerCase();
      result.sort((a, b) => {
        const aName = a.name.toLowerCase().includes(q) ? 0 : 1;
        const bName = b.name.toLowerCase().includes(q) ? 0 : 1;
        if (aName !== bName) return aName - bName;
        return b.likes - a.likes;
      });
    } else {
      switch (sortBy) {
        case 'likes':
          result.sort((a, b) => b.likes - a.likes);
          break;
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
          result.reverse();
          break;
      }
    }

    return result;
  }, [tools, search, category, sortBy]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <CategoryBar active={category} onSelect={setCategory} />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">排序</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="likes">最多点赞</option>
            <option value="name">名称 A-Z</option>
            <option value="newest">最新添加</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {hasFilter ? (
            <>
              找到 <span className="font-semibold text-gray-700">{filtered.length}</span> 个工具
              {search && <> · 搜索「<span className="text-blue-600">{search}</span>」</>}
              {category !== '全部' && <> · <span className="text-blue-600">{category}</span></>}
            </>
          ) : (
            <>共 <span className="font-semibold text-gray-700">{tools.length}</span> 个 AI 工具</>
          )}
        </p>
        {hasFilter && (
          <button
            onClick={() => { setSearch(''); setCategory('全部'); }}
            className="text-sm text-blue-600 hover:text-blue-700 transition"
          >
            清除筛选
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-2">没有找到相关工具</p>
          <button
            onClick={() => { setSearch(''); setCategory('全部'); }}
            className="text-sm text-blue-600 hover:text-blue-700 transition"
          >
            清除筛选条件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorited={favoriteIds.has(tool.id)}
              onLike={handleLike}
              onFavorite={handleFavorite}
              isLoggedIn={!!user}
            />
          ))}
        </div>
      )}
    </main>
  );
}
