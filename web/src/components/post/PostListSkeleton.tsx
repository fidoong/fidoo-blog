'use client';

import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { Stagger } from '@/components/ui/animation';

export function PostListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Stagger staggerDelay={50}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </Stagger>
    </div>
  );
}
