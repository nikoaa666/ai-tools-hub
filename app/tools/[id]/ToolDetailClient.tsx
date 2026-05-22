'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

const categoryColors: Record<string, string> = {
  '对话': 'bg-purple-50 text-purple-600 border-purple-200',
  '写作': 'bg-blue-50 text-blue-600 border-blue-200',
  '编程': 'bg-green-50 text-green-600 border-green-200',
  '图像': 'bg-pink-50 text-pink-600 border-pink-200',
  '视频': 'bg-red-50 text-red-600 border-red-200',
  '音频': 'bg-orange-50 text-orange-600 border-orange-200',
  '效率': 'bg-cyan-50 text-cyan-600 border-cyan-200',
  '设计': 'bg-violet-50 text-violet-600 border-violet-200',
  '营销': 'bg-amber-50 text-amber-600 border-amber-200',
  'Agent': 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

export default function ToolDetailClient({ id }: { id: string }) {
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchTool();
  }, []);

  async function fetchTool() {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      window.location.href = '/';
      return;
    }
    setTool(data as Tool);
    setLoading(false);
  }

  async function handleLike() {
    if (!tool || liked) return;
    setLiked(true);
    await supabase.from('tools').update({ likes: tool.likes + 1 }).eq('id', tool.id);
    setTool({ ...tool, likes: tool.likes + 1 });
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
      </main>
    );
  }

  if (!tool) return null;

  const colorClass = categoryColors[tool.category] || 'bg-gray-50 text-gray-600 border-gray-200';
  const usageSteps = tool.usage ? tool.usage.split('\n').filter(Boolean) : [];

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <a href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回工具列表
      </a>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            {tool.image && (
              <img
                src={tool.image}
                alt={tool.name}
                className="w-14 h-14 rounded-2xl object-contain bg-gray-50 p-2"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full border shrink-0 ${colorClass}`}>
            {tool.category}
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed text-lg mb-6">{tool.description}</p>
        <div className="flex items-center gap-4">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            访问官网
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={handleLike}
            disabled={liked}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border transition font-medium ${
              liked
                ? 'bg-red-50 text-red-500 border-red-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
            }`}
          >
            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {tool.likes + (liked ? 1 : 0)} 点赞
          </button>
        </div>
      </div>

      {usageSteps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            使用方法
          </h2>
          <ol className="space-y-3">
            {usageSteps.map((step, i) => {
              const cleaned = step.replace(/^\d+\.\s*/, '');
              return (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-gray-700 leading-relaxed pt-0.5">{cleaned}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="mt-6 text-center">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
        >
          {tool.url}
        </a>
      </div>
    </main>
  );
}
