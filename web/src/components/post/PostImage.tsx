'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface PostImageProps {
  coverImage: string;
  title: string;
  slug: string;
  featured?: boolean;
  priority?: boolean;
}

export function PostImage({
  coverImage,
  title,
  slug,
  featured = false,
  priority = false,
}: PostImageProps) {
  return (
    <Link href={`/posts/${slug}`} className="block">
      <div
        className={cn(
          'relative w-full overflow-hidden bg-gray-100 group',
          featured ? 'h-64 md:h-80' : 'h-48 md:h-56',
        )}
      >
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes={
            featured
              ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          }
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          style={{ objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
}
