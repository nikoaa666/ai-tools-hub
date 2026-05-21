'use client';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">出现了一个错误</h1>
          <p className="text-red-500 text-sm mb-4 font-mono bg-red-50 p-3 rounded-lg text-left overflow-auto">
            {this.state.error?.message || '未知错误'}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            刷新页面
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
