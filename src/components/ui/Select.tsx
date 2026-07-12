import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, hint, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <select
          ref={ref}
          className={clsx(
            'w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer',
            error ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200',
            'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {hint && <p className={clsx('text-xs', error ? 'text-red-500' : 'text-slate-400')}>{hint}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
