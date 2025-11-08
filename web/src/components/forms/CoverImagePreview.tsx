'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FadeIn } from '@/components/ui/animation';

interface CoverImagePreviewProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CoverImagePreview({
  value,
  onChange,
  error,
}: CoverImagePreviewProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <ImageIcon className="inline h-4 w-4 mr-1" />
        封面图片 URL
      </label>
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/image.jpg"
        error={error}
      />
      {value && (
        <FadeIn className="mt-3">
          <div className="relative w-full h-64 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
            <Image
              src={value}
              alt="封面预览"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </FadeIn>
      )}
    </div>
  );
}

