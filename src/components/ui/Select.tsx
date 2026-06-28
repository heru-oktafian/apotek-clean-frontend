import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select ref={ref} className={className} {...props}>
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
