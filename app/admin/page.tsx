'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/auth';
import { CATEGORIES } from '@/lib/categories';
import { validateToolInput, sanitizeString } from '@/lib/validate';
import { useRouter } from 'next/navigation';

interface Tool {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  image?: string;
  likes: number;
}

export default function Admin() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [form, setForm] = useState({ name: '', category: '对话', url: '', description: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const user = await getUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }
    setLoading(false);
    fetchTools();
  }

  async function fetchTools() {
    const { data } = await supabase.from('tools').select('*').order('created_at', { ascending: false });
    setTools((data as Tool[]) || []);
  }

  async function addTool(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // 输入验证
    const cleaned = {
      name: sanitizeString(form.name, 100),
      category: form.category,
      url: form.url.trim(),
      description: sanitizeString(form.description, 2000),
    };

    const validation = validateToolInput(cleaned);
    if (!validation.valid) {
      setError(validation.errors.join('；'));
      return;
    }

    await supabase.from('tools').insert([{ ...cleaned, likes: 0 }]);
    setForm({ name: '', category: '对话', url: '', description: '', image: '' });
    fetchTools();
  }

  async function deleteTool(id: string, name: string) {
    if (!confirm(`确定删除「${name}」吗？此操作不可恢复。`)) return;
    await supabase.from('tools').delete().eq('id', id);
    fetchTools();
  }

  if (loading) {
    return <main className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">验证身份中...</main>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">后台管理</h1>

      <form onSubmit={addTool} className="bg-white border border-gray-200 rounded-xl p-6 mb-8 space-y-4">
        <h2 className="font-semibold text-gray-700">添加工具</h2>
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="工具名称 (1-100字)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={100}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {CATEGORIES.filter((c) => c !== '全部').map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            placeholder="工具链接 (https://...)"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
            maxLength={500}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <input
            placeholder="工具描述 (1-2000字)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            maxLength={2000}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          添加
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">名称</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">分类</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">点赞</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tools.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t.category}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{t.likes}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteTool(t.id, t.name)}
                    className="text-red-500 hover:text-red-700 text-sm transition"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {tools.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">暂无工具</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
