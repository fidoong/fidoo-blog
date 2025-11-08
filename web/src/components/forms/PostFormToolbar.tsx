'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';

interface PostFormToolbarProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function PostFormToolbar({ isSubmitting, onSubmit }: PostFormToolbarProps) {
  const router = useRouter();

  return (
    <div className="flex-shrink-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">写文章</h1>
            <p className="text-sm text-gray-500 mt-0.5">分享你的知识和经验</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              取消
            </Button>
            <Button
              type="submit"
              form="post-form"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  发布文章
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

