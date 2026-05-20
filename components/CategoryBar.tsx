'use client';
import { CATEGORIES } from '@/lib/categories';

interface CategoryBarProps {
  active: string;
  onSelect: (category: string) => void;
}

export default function CategoryBar({ active, onSelect }: CategoryBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            active === cat
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
