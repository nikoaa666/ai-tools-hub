'use client';
import { useState, useEffect } from 'react';
import { signIn } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { isValidEmail } from '@/lib/validate';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function getStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function setStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, value); } catch {}
}

function removeStorage(key: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch {}
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const router = useRouter();

  useEffect(() => {
    const stored = getStorage('login_lockout');
    if (stored) {
      const lockTime = parseInt(stored, 10);
      if (Date.now() < lockTime) {
        setLockedUntil(lockTime);
      } else {
        removeStorage('login_lockout');
        removeStorage('login_attempts');
      }
    }
    const storedAttempts = parseInt(getStorage('login_attempts') || '0', 10);
    setAttemptsLeft(MAX_ATTEMPTS - storedAttempts);
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setRemainingTime(0);
        removeStorage('login_lockout');
        removeStorage('login_attempts');
        setAttemptsLeft(MAX_ATTEMPTS);
        clearInterval(interval);
      } else {
        setRemainingTime(Math.ceil(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  function recordFailedAttempt() {
    const attempts = parseInt(getStorage('login_attempts') || '0', 10) + 1;
    setStorage('login_attempts', String(attempts));
    setAttemptsLeft(MAX_ATTEMPTS - attempts);
    if (attempts >= MAX_ATTEMPTS) {
      const lockTime = Date.now() + LOCKOUT_MS;
      setStorage('login_lockout', String(lockTime));
      setLockedUntil(lockTime);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (lockedUntil) return;

    setError('');
    setLoading(true);

    if (!isValidEmail(email)) {
      setError('请输入有效的邮箱地址');
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      recordFailedAttempt();
      setError('邮箱或密码错误');
    } else {
      removeStorage('login_attempts');
      removeStorage('login_lockout');
      router.push('/admin');
    }
  }

  if (lockedUntil) {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return (
      <main className="max-w-sm mx-auto px-4 py-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-500 text-4xl mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-red-700 mb-2">账户已临时锁定</h2>
          <p className="text-sm text-red-600 mb-4">登录失败次数过多，请等待后再试</p>
          <p className="text-2xl font-mono font-bold text-red-700">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-center mb-8">管理员登录</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && (
          <p className="text-amber-600 text-xs">剩余 {attemptsLeft} 次尝试机会</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </main>
  );
}
