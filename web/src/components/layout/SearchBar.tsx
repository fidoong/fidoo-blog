'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils/cn';

interface SearchBarProps {
  className?: string;
  mobile?: boolean;
  onClose?: () => void;
}

export function SearchBar({ className, mobile = false, onClose }: SearchBarProps) {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword('');
      onClose?.();
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="搜索文章、标签..."
        className={cn(
          'w-full pl-10 pr-10 py-2 text-sm border rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'bg-gray-50 hover:bg-white transition-all duration-200',
          mobile && 'border-gray-200',
        )}
        autoFocus={mobile}
      />
      {searchKeyword && (
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearchKeyword('');
            onClose?.();
          }}
          aria-label="清除搜索"
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="h-3.5 w-3.5" />
        </IconButton>
      )}
    </form>
  );
}

