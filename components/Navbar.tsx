'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          AI Tools Hub
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <Link
              href="/favorites"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              我的收藏
            </Link>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition"
            >
              退出登录
            </button>
          ) : (
            <Link
              href="/admin/login"
              className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md transition"
            >
              管理员登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
