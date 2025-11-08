'use client';

import * as React from 'react';
import { Radio } from '@/components/ui/radio';
import { Checkbox } from '@/components/ui/checkbox';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface PublishOptionsProps {
  statusRegister: UseFormRegisterReturn<'status'>;
  isFeaturedRegister: UseFormRegisterReturn<'isFeatured'>;
  isTopRegister: UseFormRegisterReturn<'isTop'>;
  statusValue: 'draft' | 'published';
}

export function PublishOptions({
  statusRegister,
  isFeaturedRegister,
  isTopRegister,
  statusValue,
}: PublishOptionsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          发布状态
        </label>
        <div className="flex items-center gap-6">
          <Radio
            {...statusRegister}
            value="draft"
            label="保存为草稿"
            checked={statusValue === 'draft'}
          />
          <Radio
            {...statusRegister}
            value="published"
            label="立即发布"
            checked={statusValue === 'published'}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          其他选项
        </label>
        <div className="flex flex-wrap gap-6">
          <Checkbox {...isFeaturedRegister} label="设为精选" />
          <Checkbox {...isTopRegister} label="置顶" />
        </div>
      </div>
    </div>
  );
}

