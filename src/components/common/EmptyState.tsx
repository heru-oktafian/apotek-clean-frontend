import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title = 'Tidak ada data',
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon ? (
        <div className="mb-4 text-slate-300">{icon}</div>
      ) : (
        <div className="mb-4">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-slate-200 mx-auto">
            <rect x="8" y="16" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M8 24h48" stroke="currentColor" strokeWidth="2" />
            <path d="M20 32h8M20 40h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}
      {title && <p className="text-base font-medium text-slate-500 mb-1">{title}</p>}
      {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
