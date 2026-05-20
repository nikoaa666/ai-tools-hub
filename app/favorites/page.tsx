'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Tool {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  likes: number;
}

export default function FavoritesPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const user = await getUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }
    setUserId(user.id);
    await fetchFavorites(user.id);
    setLoading(false);
  }

  async function fetchFavorites(uid: string) {
    const { data } = await supabase
      .from('favorites')
      .select('tool_id, tools(*)')
      .eq('user_id', uid);
    setTools((data || []).map((f: any) => f.tools).filter(Boolean));
  }

  async function removeFavorite(toolId: string) {
    if (!userId) return;
    await supabase.from('favorites').delete().eq('user_id', userId).eq('tool_id', toolId);
    setTools((prev) => prev.filter((t) => t.id !== toolId));
  }

  if (loading) {
    return <main className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</main>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">我的收藏</h1>
      {tools.length === 0 ? (
        <p className="text-center text-gray-400 py-20">还没有收藏任何工具</p>
      ) : (
        <div className="space-y-3">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:text-blue-600 transition">
                    {tool.name}
                  </a>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tool.category}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{tool.description}</p>
              </div>
              <button
                onClick={() => removeFavorite(tool.id)}
                className="ml-4 text-sm text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-3 py-1.5 rounded-md transition shrink-0"
              >
                取消收藏
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
