import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, hint, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
          error ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200',
          className,
        )}
        {...props}
      />
      {hint && <p className={clsx('text-xs', error ? 'text-red-500' : 'text-slate-400')}>{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';
