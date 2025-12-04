import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gray' | 'green' | 'yellow' | 'red' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variantClasses = {
    gray: 'badge-gray',
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
    blue: 'badge-blue',
  };

  return (
    <span className={clsx('badge', variantClasses[variant], className)}>
      {children}
    </span>
  );
}