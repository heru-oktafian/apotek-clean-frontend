import type { ReactNode } from 'react';

interface ActionCellProps {
  children: ReactNode;
  className?: string;
}

export function ActionCell({ children, className = '' }: ActionCellProps) {
  return (
    <div className={`${className}`.trim()} style={{display: 'grid', placeItems: 'center', height: '100%'}}>
      {children}
    </div>
  );
}
