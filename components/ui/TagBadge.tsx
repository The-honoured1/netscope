import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TagBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  className?: string;
}

export const TagBadge = ({ children, variant = 'default', className }: TagBadgeProps) => {
  const variants = {
    default: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    danger: 'bg-red-950/30 text-red-400 border-red-900/50',
    warning: 'bg-amber-950/30 text-amber-400 border-amber-900/50',
    success: 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50',
    info: 'bg-blue-950/30 text-blue-400 border-blue-900/50',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
