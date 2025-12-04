import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Alert({ children, variant = 'info', className }: AlertProps) {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-md border',
        variantClasses[variant],
        className
      )}
    >
      <span className="text-xl">{icons[variant]}</span>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}