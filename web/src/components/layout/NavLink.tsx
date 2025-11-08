'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  href: string;
  label: string;
  icon?: LucideIcon;
}

export function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium px-3 py-1.5 transition-all duration-200 rounded-md',
        'flex items-center gap-1.5',
        'hover:scale-105 active:scale-95',
        isActive
          ? 'text-primary-600 bg-primary-50'
          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50',
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );
}

