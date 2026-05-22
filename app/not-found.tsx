'use client';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [path, setPath] = useState('');

  useEffect(() => {
    const currentPath = window.location.pathname;
    setPath(currentPath);

    // 如果是工具详情页 URL，重定向到首页并显示工具
    const toolMatch = currentPath.match(/^\/tools\/(.+)/);
    if (toolMatch) {
      // 跳转到首页，携带工具 ID 作为 hash
      window.location.href = `/#${toolMatch[1]}`;
    }
  }, []);

  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">404</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">页面未找到</h1>
      <p className="text-gray-500 mb-6">该页面不存在或已被移除</p>
      <a
        href="/"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium"
      >
        返回首页
      </a>
    </main>
  );
}
